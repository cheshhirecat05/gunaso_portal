"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import { submitComplaint } from "@/app/citizen/actions";

interface ReapplyComplaint {
  id: string;
  title: string;
  description: string;
  category: string | null;
  location: string | null;
  priority: string;
}

interface SubmitComplaintFormProps {
  reapplyComplaint?: ReapplyComplaint | null;
}

export function SubmitComplaintForm({
  reapplyComplaint,
}: SubmitComplaintFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (reapplyComplaint) {
      formData.set("reappliedFrom", reapplyComplaint.id);
    }

    const result = await submitComplaint(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(result.ticketNumber || "");
    }
  }

  if (success) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Complaint Submitted Successfully!</CardTitle>
          <CardDescription>
            Your ticket number is: <strong className="font-mono">{success}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can track the status of your complaint from your dashboard. You
            will receive notifications as your complaint progresses.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-4">
          <Button onClick={() => router.push("/citizen")}>
            View My Complaints
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(null);
              setLoading(false);
            }}
          >
            Submit Another
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help us resolve your issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief summary of your complaint"
              defaultValue={reapplyComplaint?.title || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your issue in detail..."
              defaultValue={reapplyComplaint?.description || ""}
              rows={5}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category"
                defaultValue={reapplyComplaint?.category || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                name="priority"
                defaultValue={reapplyComplaint?.priority || "medium"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Where is this issue located?"
              defaultValue={reapplyComplaint?.location || ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {reapplyComplaint ? "Resubmit Complaint" : "Submit Complaint"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
