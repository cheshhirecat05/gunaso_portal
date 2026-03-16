import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminComplaintsTable } from "@/components/admin/admin-complaints-table";

export default async function AllComplaintsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get all complaints
  const { data: complaints } = await supabase
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

  // Get departments
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  // Get officers
  const { data: officers } = await supabase
    .from("profiles")
    .select("*, departments(name)")
    .eq("role", "department_officer");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All Complaints</h1>
        <p className="text-muted-foreground">
          View and manage all submitted grievances
        </p>
      </div>

      <AdminComplaintsTable
        complaints={complaints || []}
        departments={departments || []}
        officers={officers || []}
        showFilters
      />
    </div>
  );
}
