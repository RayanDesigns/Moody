"use client";

import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-64 min-h-screen">
          <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
