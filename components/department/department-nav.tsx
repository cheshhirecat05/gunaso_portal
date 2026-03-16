"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Bell,
  LogOut,
  User,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface DepartmentNavProps {
  user: SupabaseUser;
  profile: {
    full_name: string | null;
    email: string | null;
    departments: { name: string } | null;
  } | null;
}

export function DepartmentNav({ user, profile }: DepartmentNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/department", label: "My Assignments", icon: LayoutDashboard },
    { href: "/department/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/department" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">Department Portal</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2",
                    pathname === item.href && "bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm md:flex">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {profile?.full_name || user.email}
            </span>
            {profile?.departments && (
              <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Building className="h-3 w-3" />
                {profile.departments.name}
              </span>
            )}
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </form>
        </div>
      </div>
      {/* Mobile navigation */}
      <nav className="flex items-center justify-around border-t py-2 md:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-col gap-1 h-auto py-2",
                pathname === item.href && "bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </header>
  );
}
