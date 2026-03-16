"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import {
  Search,
  Eye,
  Play,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { markInProgress, resolveComplaint } from "@/app/department/actions";

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
  citizen: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  departments: { name: string } | null;
}

interface DepartmentComplaintsListProps {
  complaints: Complaint[];
}

export function DepartmentComplaintsList({
  complaints,
}: DepartmentComplaintsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [resolveDialog, setResolveDialog] = useState<{
    open: boolean;
    complaintId: string;
  }>({ open: false, complaintId: "" });
  const [resolutionNotes, setResolutionNotes] = useState("");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      complaint.citizen?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleMarkInProgress(complaintId: string) {
    setLoading(complaintId);
    await markInProgress(complaintId);
    setLoading(null);
  }

  async function handleResolve() {
    if (!resolutionNotes.trim()) return;
    setLoading(resolveDialog.complaintId);
    await resolveComplaint(resolveDialog.complaintId, resolutionNotes);
    setResolveDialog({ open: false, complaintId: "" });
    setResolutionNotes("");
    setLoading(null);
  }

  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="mt-4 text-lg font-medium">All caught up!</p>
          <p className="text-muted-foreground">
            No complaints are currently assigned to you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredComplaints.map((complaint) => (
          <Card key={complaint.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
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
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {complaint.description}
                  </p>

                  {/* Citizen Info */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {complaint.citizen?.full_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {complaint.citizen.full_name}
                      </span>
                    )}
                    {complaint.citizen?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {complaint.citizen.email}
                      </span>
                    )}
                    {complaint.citizen?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {complaint.citizen.phone}
                      </span>
                    )}
                    <span>Submitted: {formatDate(complaint.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/department/complaint/${complaint.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>

                  {complaint.status === "assigned" && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleMarkInProgress(complaint.id)}
                      disabled={loading === complaint.id}
                    >
                      {loading === complaint.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Start Working
                    </Button>
                  )}

                  {complaint.status === "in-progress" && (
                    <Dialog
                      open={
                        resolveDialog.open &&
                        resolveDialog.complaintId === complaint.id
                      }
                      onOpenChange={(open) =>
                        setResolveDialog({ open, complaintId: complaint.id })
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Complaint</DialogTitle>
                          <DialogDescription>
                            Provide resolution notes describing how the issue was
                            resolved.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label>Resolution Notes *</Label>
                          <Textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Describe how the issue was resolved..."
                            rows={4}
                            className="mt-2"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() =>
                              setResolveDialog({ open: false, complaintId: "" })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleResolve}
                            disabled={
                              !resolutionNotes.trim() ||
                              loading === complaint.id
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {loading === complaint.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Mark Resolved
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
