"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  Building,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AdminNavProps {
  user: SupabaseUser;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export function AdminNav({ user, profile }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/complaints", label: "All Complaints", icon: FileText },
    { href: "/admin/departments", label: "Departments", icon: Building },
    { href: "/admin/officers", label: "Officers", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin Portal</span>
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
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Admin
            </span>
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
