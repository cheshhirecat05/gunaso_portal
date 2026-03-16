"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAllComplaints(filters?: {
  status?: string;
  department?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("complaints")
    .select(
      `
      *,
      citizen:profiles!complaints_citizen_id_fkey(full_name, email),
      departments(id, name),
      assigned_officer:profiles!complaints_assigned_officer_id_fkey(full_name)
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.department && filters.department !== "all") {
    query = query.eq("department_id", filters.department);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`
    );
  }

  const { data: complaints, error } = await query;

  if (error) {
    console.error("Error fetching complaints:", error);
    return { error: error.message, complaints: [] };
  }

  return { complaints };
}

export async function getDepartments() {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching departments:", error);
    return { error: error.message, departments: [] };
  }

  return { departments };
}

export async function getDepartmentOfficers(departmentId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*, departments(name)")
    .eq("role", "department_officer");

  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data: officers, error } = await query.order("full_name");

  if (error) {
    console.error("Error fetching officers:", error);
    return { error: error.message, officers: [] };
  }

  return { officers };
}

export async function markInReview(complaintId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("complaints")
    .update({
      status: "in-review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (error) {
    return { error: error.message };
  }

  // Get complaint for notification
  const { data: complaint } = await supabase
    .from("complaints")
    .select("citizen_id, ticket_number")
    .eq("id", complaintId)
    .single();

  // Add history
  await supabase.from("complaint_history").insert({
    complaint_id: complaintId,
    action: "marked_in_review",
    performed_by: user.id,
    notes: "Complaint is being reviewed by admin",
  });

  // Notify citizen
  if (complaint) {
    await supabase.from("notifications").insert({
      user_id: complaint.citizen_id,
      complaint_id: complaintId,
      title: "Complaint Under Review",
      message: `Your complaint (${complaint.ticket_number}) is now being reviewed.`,
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function assignToDepartment(
  complaintId: string,
  departmentId: string,
  officerId?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("complaints")
    .update({
      status: "assigned",
      department_id: departmentId,
      assigned_officer_id: officerId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (error) {
    return { error: error.message };
  }

  // Get complaint and department info
  const { data: complaint } = await supabase
    .from("complaints")
    .select("citizen_id, ticket_number")
    .eq("id", complaintId)
    .single();

  const { data: department } = await supabase
    .from("departments")
    .select("name")
    .eq("id", departmentId)
    .single();

  // Add history
  await supabase.from("complaint_history").insert({
    complaint_id: complaintId,
    action: "assigned",
    performed_by: user.id,
    notes: `Assigned to ${department?.name || "department"}`,
  });

  // Notify citizen
  if (complaint) {
    await supabase.from("notifications").insert({
      user_id: complaint.citizen_id,
      complaint_id: complaintId,
      title: "Complaint Assigned",
      message: `Your complaint (${complaint.ticket_number}) has been assigned to ${department?.name || "a department"}.`,
    });
  }

  // Notify officer if assigned
  if (officerId) {
    await supabase.from("notifications").insert({
      user_id: officerId,
      complaint_id: complaintId,
      title: "New Complaint Assigned",
      message: `A new complaint (${complaint?.ticket_number}) has been assigned to you.`,
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function rejectComplaint(complaintId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("complaints")
    .update({
      status: "rejected",
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (error) {
    return { error: error.message };
  }

  // Get complaint for notification
  const { data: complaint } = await supabase
    .from("complaints")
    .select("citizen_id, ticket_number")
    .eq("id", complaintId)
    .single();

  // Add history
  await supabase.from("complaint_history").insert({
    complaint_id: complaintId,
    action: "rejected",
    performed_by: user.id,
    notes: reason,
  });

  // Notify citizen
  if (complaint) {
    await supabase.from("notifications").insert({
      user_id: complaint.citizen_id,
      complaint_id: complaintId,
      title: "Complaint Rejected",
      message: `Your complaint (${complaint.ticket_number}) has been rejected. Reason: ${reason}. You can reapply with additional details.`,
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function getAdminStats() {
  const supabase = await createClient();

  const { data: complaints } = await supabase
    .from("complaints")
    .select("status");

  const stats = {
    total: complaints?.length || 0,
    pending: complaints?.filter((c) => c.status === "pending").length || 0,
    inReview: complaints?.filter((c) => c.status === "in-review").length || 0,
    assigned: complaints?.filter((c) => c.status === "assigned").length || 0,
    inProgress: complaints?.filter((c) => c.status === "in-progress").length || 0,
    resolved: complaints?.filter((c) => c.status === "resolved").length || 0,
    rejected: complaints?.filter((c) => c.status === "rejected").length || 0,
  };

  return stats;
}

export async function createDepartmentOfficer(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const departmentId = formData.get("departmentId") as string;

  // Create user with admin privileges (this requires service role in production)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "department_officer",
        department_id: departmentId,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  revalidatePath("/admin/officers");
  return { success: true };
}
