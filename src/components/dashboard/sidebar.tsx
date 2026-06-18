"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "◇" },
  { label: "Pipeline", href: "/dashboard/pipeline", icon: "▤" },
  { label: "Jobs", href: "/dashboard/jobs", icon: "○" },
  { label: "Outreach", href: "/dashboard/outreach", icon: "◎" },
  { label: "Interviews", href: "/dashboard/interviews", icon: "◈" },
  { label: "Offers", href: "/dashboard/offers", icon: "⬡" },
  { label: "Visas", href: "/dashboard/visas", icon: "▣" },
  { label: "Certs", href: "/dashboard/certs", icon: "◉" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "▤" },
];

const settingsItems = [
  { label: "Health", href: "/dashboard/settings/health", icon: "◌" },
  { label: "CV Tracks", href: "/dashboard/settings/cv-tracks", icon: "◎" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-[#e6e6e6] flex flex-col h-screen py-3">
      <div className="px-4 pb-3 mb-2 border-b border-[#e6e6e6]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#000000]">JobFlow</span>
        </Link>
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-[5px] transition-colors",
                isActive
                  ? "bg-[#f6f5f4] text-[#0075de] font-medium"
                  : "text-[#31302e] hover:bg-[#f6f5f4]"
              )}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 pt-2 border-t border-[#e6e6e6]">
        <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.125px] text-[#a39e98] uppercase">
          Settings
        </div>
        {settingsItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-[5px] transition-colors",
                isActive
                  ? "bg-[#f6f5f4] text-[#0075de] font-medium"
                  : "text-[#31302e] hover:bg-[#f6f5f4]"
              )}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
