import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DepartmentComplaintsList } from "@/components/department/department-complaints-list";

export default async function DepartmentDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's profile and department
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, departments(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.department_id) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">No Department Assigned</p>
        <p className="text-muted-foreground">
          Please contact an administrator to assign you to a department.
        </p>
      </div>
    );
  }

  // Get complaints assigned to this officer or their department
  const { data: complaints } = await supabase
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

  // Get resolved complaints by this officer
  const { data: resolvedComplaints } = await supabase
    .from("complaints")
    .select("id")
    .eq("assigned_officer_id", user.id)
    .eq("status", "resolved");

  const stats = {
    total: complaints?.length || 0,
    assigned: complaints?.filter((c) => c.status === "assigned").length || 0,
    inProgress: complaints?.filter((c) => c.status === "in-progress").length || 0,
    resolved: resolvedComplaints?.length || 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground">
          {profile.departments?.name} - Manage complaints assigned to you
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Awaiting Action
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {stats.assigned}
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              In Progress
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Resolved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {stats.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <DepartmentComplaintsList complaints={complaints || []} />
    </div>
  );
}
