"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Building,
  Loader2,
} from "lucide-react";
import {
  markInReview,
  assignToDepartment,
  rejectComplaint,
} from "@/app/admin/actions";

interface Complaint {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  location: string | null;
  created_at: string;
  citizen: { full_name: string | null; email: string | null } | null;
  departments: { id: string; name: string } | null;
  assigned_officer: { full_name: string | null } | null;
}

interface Department {
  id: string;
  name: string;
}

interface Officer {
  id: string;
  full_name: string | null;
  department_id: string | null;
  departments: { name: string } | null;
}

interface AdminComplaintsTableProps {
  complaints: Complaint[];
  departments: Department[];
  officers: Officer[];
  showFilters?: boolean;
}

export function AdminComplaintsTable({
  complaints,
  departments,
  officers,
  showFilters = false,
}: AdminComplaintsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);

  // Dialogs state
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    complaintId: string;
  }>({ open: false, complaintId: "" });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    complaintId: string;
  }>({ open: false, complaintId: "" });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      complaint.citizen?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      complaint.citizen?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" ||
      complaint.departments?.id === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  async function handleMarkInReview(complaintId: string) {
    setLoading(complaintId);
    await markInReview(complaintId);
    setLoading(null);
  }

  async function handleAssign() {
    if (!selectedDepartment) return;
    setLoading(assignDialog.complaintId);
    await assignToDepartment(
      assignDialog.complaintId,
      selectedDepartment,
      selectedOfficer || undefined
    );
    setAssignDialog({ open: false, complaintId: "" });
    setSelectedDepartment("");
    setSelectedOfficer("");
    setLoading(null);
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading(rejectDialog.complaintId);
    await rejectComplaint(rejectDialog.complaintId, rejectReason);
    setRejectDialog({ open: false, complaintId: "" });
    setRejectReason("");
    setLoading(null);
  }

  const filteredOfficers = officers.filter(
    (o) => !selectedDepartment || o.department_id === selectedDepartment
  );

  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No complaints found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, ticket, or citizen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        {filteredComplaints.map((complaint) => (
          <Card key={complaint.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {complaint.ticket_number}
                    </span>
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
                  <h3 className="font-semibold">{complaint.title}</h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {complaint.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      By: {complaint.citizen?.full_name || complaint.citizen?.email}
                    </span>
                    {complaint.departments && (
                      <span>Dept: {complaint.departments.name}</span>
                    )}
                    {complaint.assigned_officer && (
                      <span>Officer: {complaint.assigned_officer.full_name}</span>
                    )}
                    <span>Submitted: {formatDate(complaint.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/complaint/${complaint.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>

                  {complaint.status === "pending" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleMarkInReview(complaint.id)}
                      disabled={loading === complaint.id}
                    >
                      {loading === complaint.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Mark In Review
                    </Button>
                  )}

                  {(complaint.status === "pending" ||
                    complaint.status === "in-review") && (
                    <>
                      <Dialog
                        open={
                          assignDialog.open &&
                          assignDialog.complaintId === complaint.id
                        }
                        onOpenChange={(open) =>
                          setAssignDialog({ open, complaintId: complaint.id })
                        }
                      >
                        <DialogTrigger asChild>
                          <Button variant="default" size="sm" className="gap-2">
                            <Building className="h-4 w-4" />
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign to Department</DialogTitle>
                            <DialogDescription>
                              Assign this complaint to a department and
                              optionally a specific officer.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Department *</Label>
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
                                    <SelectItem
                                      key={officer.id}
                                      value={officer.id}
                                    >
                                      {officer.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setAssignDialog({ open: false, complaintId: "" })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAssign}
                              disabled={
                                !selectedDepartment || loading === complaint.id
                              }
                            >
                              {loading === complaint.id && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Assign
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={
                          rejectDialog.open &&
                          rejectDialog.complaintId === complaint.id
                        }
                        onOpenChange={(open) =>
                          setRejectDialog({ open, complaintId: complaint.id })
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Complaint</DialogTitle>
                            <DialogDescription>
                              Provide a reason for rejecting this complaint. The
                              citizen will be able to reapply.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label>Rejection Reason *</Label>
                            <Textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Enter the reason for rejection..."
                              rows={4}
                              className="mt-2"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setRejectDialog({ open: false, complaintId: "" })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleReject}
                              disabled={
                                !rejectReason.trim() || loading === complaint.id
                              }
                            >
                              {loading === complaint.id && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Reject
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredComplaints.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No complaints match your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
