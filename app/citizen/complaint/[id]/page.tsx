import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Clock, User, Building } from "lucide-react";
import { formatDateTime, getStatusColor, getPriorityColor } from "@/lib/utils";

interface ComplaintPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: ComplaintPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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

  if (error || !complaint) {
    notFound();
  }

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

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/citizen">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardDescription className="font-mono">
                    {complaint.ticket_number}
                  </CardDescription>
                  <CardTitle className="mt-1">{complaint.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getPriorityColor(complaint.priority)}
                  >
                    {complaint.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 font-semibold">Description</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {complaint.description}
                </p>
              </div>

              {complaint.rejection_reason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h4 className="font-semibold text-red-800">Rejection Reason</h4>
                  <p className="mt-1 text-sm text-red-700">
                    {complaint.rejection_reason}
                  </p>
                </div>
              )}

              {complaint.resolution_notes && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-800">Resolution Notes</h4>
                  <p className="mt-1 text-sm text-green-700">
                    {complaint.resolution_notes}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {complaint.category && (
                  <div>
                    <span className="text-sm text-muted-foreground">Category</span>
                    <p className="font-medium capitalize">{complaint.category}</p>
                  </div>
                )}
                {complaint.location && (
                  <div>
                    <span className="text-sm text-muted-foreground">Location</span>
                    <p className="font-medium">{complaint.location}</p>
                  </div>
                )}
                {complaint.departments && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Assigned Department
                    </span>
                    <p className="font-medium">{complaint.departments.name}</p>
                  </div>
                )}
                {complaint.assigned_officer && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Assigned Officer
                    </span>
                    <p className="font-medium">
                      {complaint.assigned_officer.full_name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-4">
            {complaint.status === "rejected" && (
              <Link href={`/citizen/submit?reapply=${complaint.id}`}>
                <Button className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reapply with Changes
                </Button>
              </Link>
            )}
            {complaint.status === "resolved" && (
              <Link href="/citizen/submit">
                <Button className="gap-2">Submit New Grievance</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history?.map((item, index) => (
                  <div key={item.id} className="relative pl-6">
                    {index !== (history?.length || 0) - 1 && (
                      <div className="absolute left-[9px] top-6 h-full w-px bg-border" />
                    )}
                    <div className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full border-2 border-primary bg-background" />
                    <div>
                      <p className="font-medium capitalize">
                        {item.action.replace("_", " ")}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(item.created_at)}
                      </div>
                      {item.performer && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {item.performer.full_name} ({item.performer.role})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
