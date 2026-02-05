"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { SavedPropertiesProvider } from "@/context/SavedPropertiesContext";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SavedPropertiesProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[240px] transition-all duration-300">
          {children}
        </main>
      </div>
    </SavedPropertiesProvider>
  );
}
