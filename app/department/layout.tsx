import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DepartmentNav } from "@/components/department/department-nav";

export default async function DepartmentLayout({
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
    .select("*, departments(*)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "department_officer") {
    if (profile?.role === "admin") {
      redirect("/admin");
    } else if (profile?.role === "citizen") {
      redirect("/citizen");
    }
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <DepartmentNav user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
