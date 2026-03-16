"use server";

import { createClient } from "@/lib/supabase/server";
import { generateTicketNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function submitComplaint(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a complaint" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const location = formData.get("location") as string;
  const priority = formData.get("priority") as string;
  const reappliedFrom = formData.get("reappliedFrom") as string | null;

  const ticketNumber = generateTicketNumber();

  const { data: complaint, error } = await supabase
    .from("complaints")
    .insert({
      ticket_number: ticketNumber,
      citizen_id: user.id,
      title,
      description,
      category,
      location,
      priority: priority || "medium",
      status: "pending",
      reapplied_from: reappliedFrom || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting complaint:", error);
    return { error: error.message };
  }

  // Add to history
  await supabase.from("complaint_history").insert({
    complaint_id: complaint.id,
    action: reappliedFrom ? "reapplied" : "submitted",
    performed_by: user.id,
    notes: reappliedFrom
      ? "Complaint resubmitted after rejection"
      : "Complaint submitted",
  });

  // Create notification for the citizen
  await supabase.from("notifications").insert({
    user_id: user.id,
    complaint_id: complaint.id,
    title: "Complaint Submitted",
    message: `Your complaint (${ticketNumber}) has been submitted successfully.`,
  });

  revalidatePath("/citizen");
  return { success: true, ticketNumber };
}

export async function getMyComplaints() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", complaints: [] };
  }

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      departments(name),
      assigned_officer:profiles!complaints_assigned_officer_id_fkey(full_name)
    `
    )
    .eq("citizen_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching complaints:", error);
    return { error: error.message, complaints: [] };
  }

  return { complaints };
}

export async function getComplaintDetails(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      departments(name),
      assigned_officer:profiles!complaints_assigned_officer_id_fkey(full_name, email)
    `
    )
    .eq("id", id)
    .eq("citizen_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching complaint:", error);
    return { error: error.message };
  }

  // Get history
  const { data: history } = await supabase
    .from("complaint_history")
    .select(
      `
      *,
      performer:profiles!complaint_history_performed_by_fkey(full_name, role)
    `
    )
    .eq("complaint_id", id)
    .order("created_at", { ascending: false });

  return { complaint, history };
}

export async function getMyNotifications() {
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
      complaints(ticket_number, title)
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

export async function markNotificationRead(id: string) {
  const supabase = await createClient();

  await supabase.from("notifications").update({ is_read: true }).eq("id", id);

  revalidatePath("/citizen/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id);

  revalidatePath("/citizen/notifications");
}
