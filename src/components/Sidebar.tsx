"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  LayoutDashboard,
  Search,
  MapPin,
  Bookmark,
  Calculator,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useSavedProperties } from "@/context/SavedPropertiesContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Properties", icon: Search },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/explore", label: "Explore Markets", icon: Database },
  { href: "/saved", label: "Saved", icon: Bookmark, showBadge: true },
  { href: "/calculator", label: "NACA Calculator", icon: Calculator },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { count } = useSavedProperties();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 bg-[#070d1b] border-r border-blue-500/15 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-500/15">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(59,130,246,0.3)] shrink-0">
          <Map size={20} color="white" />
        </div>
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
            LandScout
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all group relative ${
                isActive
                  ? "bg-blue-500/15 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {item.showBadge && count > 0 && (
                <span
                  className={`${
                    collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                  } min-w-[20px] h-5 flex items-center justify-center rounded-full text-[0.65rem] font-bold bg-blue-500 text-white px-1`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 p-2.5 rounded-xl bg-transparent border border-blue-500/15 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
