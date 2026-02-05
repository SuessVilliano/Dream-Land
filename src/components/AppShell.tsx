"use client";

import { ReactNode, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar, { SidebarState } from "@/components/Sidebar";
import Onboarding from "@/components/Onboarding";
import { SavedPropertiesProvider } from "@/context/SavedPropertiesContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Pages that should render WITHOUT the sidebar (public pages)
const PUBLIC_PATHS = ["/", "/login", "/signup"];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    collapsed: false,
    isMobile: false,
    mobileOpen: false,
  });

  const handleSidebarChange = useCallback((state: SidebarState) => {
    setSidebarState(state);
  }, []);

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // Public pages: no sidebar, no providers
  if (isPublicPage) {
    return <>{children}</>;
  }

  // On mobile: no left margin (sidebar is an overlay).
  // On desktop: margin matches sidebar width.
  const mainMargin = sidebarState.isMobile
    ? "ml-0"
    : sidebarState.collapsed
      ? "ml-[68px]"
      : "ml-[240px]";

  // App pages: full layout with sidebar, saved properties, theme
  return (
    <ThemeProvider>
      <SavedPropertiesProvider>
        <div className="flex min-h-screen">
          <Sidebar onStateChange={handleSidebarChange} />
          <main className={`flex-1 transition-all duration-300 ${mainMargin}`}>
            {children}
          </main>
          <Onboarding />
        </div>
      </SavedPropertiesProvider>
    </ThemeProvider>
  );
}
