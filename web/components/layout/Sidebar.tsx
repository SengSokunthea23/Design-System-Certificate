"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings2, LogOut, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout, useMe } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Projects", icon: LayoutDashboard },
  { href: "/presets", label: "Presets", icon: Palette },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <aside className="flex h-screen w-[var(--sidebar-width)] flex-col border-r border-[--color-border] bg-[--color-background]">
      <div className="flex h-16 items-center px-6 border-b border-[--color-border]">
        <span className="font-semibold text-sm tracking-tight">Design System Picker</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-[--color-muted] text-[--color-foreground]"
                : "text-[--color-muted-foreground] hover:bg-[--color-muted] hover:text-[--color-foreground]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[--color-border] p-4 space-y-2">
        {user && (
          <div className="px-3 py-1">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs text-[--color-muted-foreground] truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-[--color-muted-foreground]"
          onClick={() => logout.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
