"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, CheckCircle, Loader2 } from "lucide-react";
import { markInProgress, resolveComplaint } from "@/app/department/actions";

interface DepartmentComplaintActionsProps {
  complaintId: string;
  status: string;
}

export function DepartmentComplaintActions({
  complaintId,
  status,
}: DepartmentComplaintActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  async function handleMarkInProgress() {
    setLoading("progress");
    await markInProgress(complaintId);
    setLoading(null);
    router.refresh();
  }

  async function handleResolve() {
    if (!resolutionNotes.trim()) return;
    setLoading("resolve");
    await resolveComplaint(complaintId, resolutionNotes);
    setLoading(null);
    router.push("/department");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "assigned" && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-medium">Start Working</h4>
              <p className="text-sm text-muted-foreground">
                Indicate that you have started working on this complaint
              </p>
            </div>
            <Button
              onClick={handleMarkInProgress}
              disabled={loading === "progress"}
              className="gap-2"
            >
              {loading === "progress" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Working
            </Button>
          </div>
        )}

        {status === "in-progress" && (
          <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div>
              <h4 className="font-medium text-green-800">
                Resolve Complaint
              </h4>
              <p className="text-sm text-green-600">
                Mark this complaint as resolved and provide resolution details
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-green-800">Resolution Notes *</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                rows={4}
                className="border-green-200 bg-white focus-visible:ring-green-500"
              />
            </div>
            <Button
              onClick={handleResolve}
              disabled={!resolutionNotes.trim() || loading === "resolve"}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading === "resolve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Mark Resolved
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
