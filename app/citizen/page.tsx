import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { ComplaintsList } from "@/components/citizen/complaints-list";

export default async function CitizenDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: complaints } = await supabase
    .from("complaints")
    .select(
      `
      *,
      departments(name)
    `
    )
    .eq("citizen_id", user.id)
    .order("created_at", { ascending: false });

  const stats = {
    total: complaints?.length || 0,
    pending: complaints?.filter((c) => c.status === "pending").length || 0,
    inProgress:
      complaints?.filter((c) =>
        ["in-review", "assigned", "in-progress"].includes(c.status)
      ).length || 0,
    resolved: complaints?.filter((c) => c.status === "resolved").length || 0,
    rejected: complaints?.filter((c) => c.status === "rejected").length || 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Complaints</h1>
          <p className="text-muted-foreground">
            Track and manage your submitted grievances
          </p>
        </div>
        <Link href="/citizen/submit">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Complaint
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <ComplaintsList complaints={complaints || []} />
    </div>
  );
}
