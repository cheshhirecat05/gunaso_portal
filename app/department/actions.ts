"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMyAssignments() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", complaints: [] };
  }

  // Get user's department
  const { data: profile } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("id", user.id)
    .single();

  if (!profile?.department_id) {
    return { error: "No department assigned", complaints: [] };
  }

  // Get complaints assigned to this officer or to their department without a specific officer
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      citizen:profiles!complaints_citizen_id_fkey(full_name, email, phone),
      departments(name)
    `
    )
    .eq("department_id", profile.department_id)
    .or(`assigned_officer_id.eq.${user.id},assigned_officer_id.is.null`)
    .in("status", ["assigned", "in-progress"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    return { error: error.message, complaints: [] };
  }

  return { complaints };
}

export async function markInProgress(complaintId: string) {
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
      status: "in-progress",
      assigned_officer_id: user.id,
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
    action: "started_work",
    performed_by: user.id,
    notes: "Department officer started working on the complaint",
  });

  // Notify citizen
  if (complaint) {
    await supabase.from("notifications").insert({
      user_id: complaint.citizen_id,
      complaint_id: complaintId,
      title: "Work Started on Your Complaint",
      message: `Work has begun on your complaint (${complaint.ticket_number}). A department officer is now handling it.`,
    });
  }

  revalidatePath("/department");
  return { success: true };
}

export async function resolveComplaint(complaintId: string, notes: string) {
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
      status: "resolved",
      resolution_notes: notes,
      resolved_at: new Date().toISOString(),
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
    action: "resolved",
    performed_by: user.id,
    notes: notes,
  });

  // Notify citizen
  if (complaint) {
    await supabase.from("notifications").insert({
      user_id: complaint.citizen_id,
      complaint_id: complaintId,
      title: "Complaint Resolved",
      message: `Your complaint (${complaint.ticket_number}) has been resolved. You can submit a new grievance if needed.`,
    });
  }

  revalidatePath("/department");
  return { success: true };
}

export async function getDepartmentNotifications() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", notifications: [] };
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      `
      *,
      complaints(ticket_number, title, status)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { error: error.message, notifications: [] };
  }

  return { notifications };
}

export async function markDepartmentNotificationRead(id: string) {
  const supabase = await createClient();

  await supabase.from("notifications").update({ is_read: true }).eq("id", id);

  revalidatePath("/department/notifications");
}
