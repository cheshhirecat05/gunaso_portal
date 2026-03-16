import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubmitComplaintForm } from "@/components/citizen/submit-complaint-form";

interface SubmitPageProps {
  searchParams: Promise<{ reapply?: string }>;
}

export default async function SubmitComplaintPage({ searchParams }: SubmitPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let reapplyComplaint = null;

  if (params.reapply) {
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", params.reapply)
      .eq("citizen_id", user.id)
      .eq("status", "rejected")
      .single();

    reapplyComplaint = data;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {reapplyComplaint ? "Resubmit Complaint" : "Submit New Complaint"}
        </h1>
        <p className="text-muted-foreground">
          {reapplyComplaint
            ? "Your previous complaint was rejected. Please review and resubmit with additional details."
            : "Fill out the form below to submit your grievance."}
        </p>
      </div>

      {reapplyComplaint && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-800">Previous Rejection Reason:</h3>
          <p className="mt-1 text-sm text-yellow-700">
            {reapplyComplaint.rejection_reason || "No reason provided"}
          </p>
        </div>
      )}

      <SubmitComplaintForm reapplyComplaint={reapplyComplaint} />
    </div>
  );
}
