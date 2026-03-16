import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    if (profile?.role === "citizen") {
      redirect("/citizen");
    } else if (profile?.role === "department_officer") {
      redirect("/department");
    }
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
