"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Building, Loader2 } from "lucide-react";
import {
  markInReview,
  assignToDepartment,
  rejectComplaint,
} from "@/app/admin/actions";

interface Department {
  id: string;
  name: string;
}

interface Officer {
  id: string;
  full_name: string | null;
  department_id: string | null;
}

interface AdminComplaintActionsProps {
  complaintId: string;
  departments: Department[];
  officers: Officer[];
}

export function AdminComplaintActions({
  complaintId,
  departments,
  officers,
}: AdminComplaintActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const filteredOfficers = officers.filter(
    (o) => !selectedDepartment || o.department_id === selectedDepartment
  );

  async function handleMarkInReview() {
    setLoading("review");
    await markInReview(complaintId);
    setLoading(null);
    router.refresh();
  }

  async function handleAssign() {
    if (!selectedDepartment) return;
    setLoading("assign");
    await assignToDepartment(
      complaintId,
      selectedDepartment,
      selectedOfficer || undefined
    );
    setLoading(null);
    router.refresh();
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading("reject");
    await rejectComplaint(complaintId, rejectReason);
    setLoading(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mark In Review */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Mark as In Review</h4>
            <p className="text-sm text-muted-foreground">
              Indicate that you are reviewing this complaint
            </p>
          </div>
          <Button
            onClick={handleMarkInReview}
            disabled={loading === "review"}
            className="gap-2"
          >
            {loading === "review" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Mark In Review
          </Button>
        </div>

        {/* Assign to Department */}
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Assign to Department</h4>
            <p className="text-sm text-muted-foreground">
              Forward this complaint to the appropriate department
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setSelectedOfficer("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Officer (Optional)</Label>
              <Select
                value={selectedOfficer}
                onValueChange={setSelectedOfficer}
                disabled={!selectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  {filteredOfficers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedDepartment || loading === "assign"}
            className="gap-2"
          >
            {loading === "assign" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building className="h-4 w-4" />
            )}
            Assign to Department
          </Button>
        </div>

        {/* Reject */}
        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div>
            <h4 className="font-medium text-red-800">Reject Complaint</h4>
            <p className="text-sm text-red-600">
              Reject this complaint with a reason. The citizen can reapply.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-red-800">Rejection Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={3}
              className="border-red-200 focus-visible:ring-red-500"
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectReason.trim() || loading === "reject"}
            className="gap-2"
          >
            {loading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject Complaint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
