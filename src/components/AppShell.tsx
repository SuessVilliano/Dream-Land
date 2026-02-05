"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { SavedPropertiesProvider } from "@/context/SavedPropertiesContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Pages that should render WITHOUT the sidebar (public pages)
const PUBLIC_PATHS = ["/", "/login", "/signup"];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // Public pages: no sidebar, no providers
  if (isPublicPage) {
    return <>{children}</>;
  }

  // App pages: full layout with sidebar, saved properties, theme
  return (
    <ThemeProvider>
      <SavedPropertiesProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[240px] transition-all duration-300 peer-[.collapsed]:ml-[68px]">
            {children}
          </main>
        </div>
      </SavedPropertiesProvider>
    </ThemeProvider>
  );
}
