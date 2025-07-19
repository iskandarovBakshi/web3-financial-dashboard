"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Navigation } from "./navigation";
import { CustomConnectButton } from "@/components/wallet/connect-button";
import { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  requiredRole?: UserRole;
}

export function DashboardLayout({
  children,
  title,
  description,
  actions,
  requiredRole,
}: DashboardLayoutProps) {
  return (
    <AuthGuard requiredRole={requiredRole}>
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <Navigation />
          <div className="ml-64">
            <header className="border-b bg-background p-4 fixed top-0 right-0 left-64 z-30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">{title}</h1>
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {actions}
                  <CustomConnectButton />
                </div>
              </div>
            </header>
            <main className="p-6 pt-24">{children}</main>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <Navigation />
          <main className="p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0 pt-16 sm:pt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
            <div className="min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
