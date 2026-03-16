"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { Shield, FileText, PlusCircle, Bell, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface CitizenNavProps {
  user: SupabaseUser;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export function CitizenNav({ user, profile }: CitizenNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/citizen", label: "My Complaints", icon: FileText },
    { href: "/citizen/submit", label: "New Complaint", icon: PlusCircle },
    { href: "/citizen/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/citizen" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">Gunaso Portal</span>
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
