"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Map,
  LayoutDashboard,
  Search,
  MapPin,
  Bookmark,
  Calculator,
  Database,
  Plug,
  Crosshair,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { useSavedProperties } from "@/context/SavedPropertiesContext";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Search },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/explore", label: "Explore Markets", icon: Database },
  { href: "/saved", label: "Saved", icon: Bookmark, showBadge: true },
  { href: "/canvas", label: "Canvas", icon: Crosshair },
  { href: "/tax-liens", label: "Tax Liens", icon: FileText },
  { href: "/sources", label: "Data Sources", icon: Plug },
  { href: "/calculator", label: "NACA Calculator", icon: Calculator },
  { href: "/help", label: "Help & Docs", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { count } = useSavedProperties();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userPlan = (session?.user as { plan?: string })?.plan || "scout";
  const userRole = (session?.user as { role?: string })?.role || "user";
  const isAdmin = userRole === "admin";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 sidebar-bg ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 sidebar-border-b">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(59,130,246,0.3)] shrink-0">
          <Map size={20} color="white" />
        </div>
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
            LandScout
          </h1>
        )}
      </div>

      {/* User Profile */}
      <div className={`px-3 py-4 sidebar-border-b ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white cursor-default"
            title={`${userName}\n${userEmail}`}
          >
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold sidebar-text-primary truncate">
                {userName}
              </div>
              <div className="text-[0.65rem] sidebar-text-secondary truncate">
                {userEmail}
              </div>
            </div>
            <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
              isAdmin
                ? "bg-amber-500/15 text-amber-400"
                : "bg-blue-500/15 text-blue-400"
            }`}>
              {isAdmin ? "admin" : userPlan}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/properties" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all group relative ${
                isActive
                  ? "nav-item-active"
                  : "nav-item-inactive"
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

      {/* Bottom controls */}
      <div className="px-2 pb-4 space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium sidebar-btn transition-all"
          title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
        >
          {theme === "dark" ? (
            <Sun size={20} className="shrink-0" />
          ) : (
            <Moon size={20} className="shrink-0" />
          )}
          {!collapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium sidebar-btn transition-all hover:!text-red-400"
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full p-2.5 rounded-xl sidebar-collapse-btn cursor-pointer transition-all flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
