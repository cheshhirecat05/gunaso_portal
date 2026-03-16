import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, FileText, PlusCircle } from "lucide-react";
import { CreateOfficerDialog } from "@/components/admin/create-officer-dialog";

export default async function OfficersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get officers with department info
  const { data: officers } = await supabase
    .from("profiles")
    .select("*, departments(name)")
    .eq("role", "department_officer")
    .order("full_name");

  // Get departments for the create dialog
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  // Get complaints assigned to each officer
  const { data: complaints } = await supabase
    .from("complaints")
    .select("assigned_officer_id, status");

  const officerStats =
    officers?.map((officer) => {
      const officerComplaints =
        complaints?.filter((c) => c.assigned_officer_id === officer.id) || [];
      return {
        ...officer,
        totalAssigned: officerComplaints.length,
        activeComplaints: officerComplaints.filter(
          (c) => c.status === "assigned" || c.status === "in-progress"
        ).length,
        resolvedComplaints: officerComplaints.filter(
          (c) => c.status === "resolved"
        ).length,
      };
    }) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Department Officers</h1>
          <p className="text-muted-foreground">
            Manage officers assigned to departments
          </p>
        </div>
        <CreateOfficerDialog departments={departments || []} />
      </div>

      {officerStats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No department officers found.
            </p>
            <p className="text-sm text-muted-foreground">
              Create an officer to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officerStats.map((officer) => (
            <Card key={officer.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <User className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {officer.full_name || "Unnamed Officer"}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {officer.email}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {officer.departments && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{officer.departments.name}</Badge>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold">{officer.totalAssigned}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {officer.activeComplaints}
                    </p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {officer.resolvedComplaints}
                    </p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
