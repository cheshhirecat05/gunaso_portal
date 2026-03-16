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
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import { Search, Eye, RefreshCw } from "lucide-react";

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
  departments: { name: string } | null;
}

interface ComplaintsListProps {
  complaints: Complaint[];
}

export function ComplaintsList({ complaints }: ComplaintsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.ticket_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            You haven&apos;t submitted any complaints yet.
          </p>
          <Link href="/citizen/submit" className="mt-4">
            <Button>Submit Your First Complaint</Button>
          </Link>
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
            placeholder="Search by title or ticket number..."
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
      </div>

      <div className="space-y-4">
        {filteredComplaints.map((complaint) => (
          <Card key={complaint.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
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
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {complaint.departments && (
                      <span>Dept: {complaint.departments.name}</span>
                    )}
                    {complaint.category && (
                      <span>Category: {complaint.category}</span>
                    )}
                    <span>Submitted: {formatDate(complaint.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/citizen/complaint/${complaint.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  {complaint.status === "rejected" && (
                    <Link
                      href={`/citizen/submit?reapply=${complaint.id}`}
                    >
                      <Button variant="secondary" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reapply
                      </Button>
                    </Link>
                  )}
                  {complaint.status === "resolved" && (
                    <Link href="/citizen/submit">
                      <Button variant="secondary" size="sm" className="gap-2">
                        New Grievance
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredComplaints.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No complaints match your search criteria.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
