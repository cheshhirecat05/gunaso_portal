import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Users,
  Briefcase,
} from "lucide-react";
import { AdminComplaintsTable } from "@/components/admin/admin-complaints-table";

export default async function AdminDashboard() {
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

  const stats = {
    total: complaints?.length || 0,
    pending: complaints?.filter((c) => c.status === "pending").length || 0,
    inReview: complaints?.filter((c) => c.status === "in-review").length || 0,
    assigned: complaints?.filter((c) => c.status === "assigned").length || 0,
    inProgress: complaints?.filter((c) => c.status === "in-progress").length || 0,
    resolved: complaints?.filter((c) => c.status === "resolved").length || 0,
    rejected: complaints?.filter((c) => c.status === "rejected").length || 0,
  };

  // Recent complaints that need attention
  const pendingComplaints = complaints?.filter(
    (c) => c.status === "pending" || c.status === "in-review"
  ).slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and assign grievances across departments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              In Progress
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {stats.inReview + stats.assigned + stats.inProgress}
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

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{departments?.length || 0}</div>
            <Link href="/admin/departments">
              <Button variant="link" className="mt-2 h-auto p-0 text-sm">
                Manage Departments <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Department Officers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{officers?.length || 0}</div>
            <Link href="/admin/officers">
              <Button variant="link" className="mt-2 h-auto p-0 text-sm">
                Manage Officers <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Citizens can reapply
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complaints needing attention */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Complaints Needing Attention</h2>
          <Link href="/admin/complaints">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <AdminComplaintsTable
          complaints={pendingComplaints || []}
          departments={departments || []}
          officers={officers || []}
        />
      </div>
    </div>
  );
}
