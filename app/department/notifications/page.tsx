import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DepartmentNotificationsList } from "@/components/department/department-notifications-list";

export default async function DepartmentNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: notifications } = await supabase
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

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated on assigned complaints
          {unreadCount > 0 && ` (${unreadCount} unread)`}
        </p>
      </div>

      <DepartmentNotificationsList notifications={notifications || []} />
    </div>
  );
}
