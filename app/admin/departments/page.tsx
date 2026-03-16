import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users } from "lucide-react";

export default async function DepartmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get departments with complaint counts
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  // Get officers count per department
  const { data: officers } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("role", "department_officer");

  // Get complaints per department
  const { data: complaints } = await supabase
    .from("complaints")
    .select("department_id, status");

  const departmentStats =
    departments?.map((dept) => {
      const deptComplaints =
        complaints?.filter((c) => c.department_id === dept.id) || [];
      const deptOfficers =
        officers?.filter((o) => o.department_id === dept.id) || [];

      return {
        ...dept,
        officerCount: deptOfficers.length,
        totalComplaints: deptComplaints.length,
        pendingComplaints: deptComplaints.filter(
          (c) =>
            c.status === "assigned" ||
            c.status === "in-progress" ||
            c.status === "in-review"
        ).length,
        resolvedComplaints: deptComplaints.filter((c) => c.status === "resolved")
          .length,
      };
    }) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">
          View department statistics and assignments
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departmentStats.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                {dept.description && (
                  <p className="text-sm text-muted-foreground">
                    {dept.description}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{dept.officerCount}</p>
                    <p className="text-xs text-muted-foreground">Officers</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{dept.totalComplaints}</p>
                  <p className="text-xs text-muted-foreground">
                    Total Complaints
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary">
                  {dept.pendingComplaints} Active
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700"
                >
                  {dept.resolvedComplaints} Resolved
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
