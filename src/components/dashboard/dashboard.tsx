"use client";

import { useUser } from "@/hooks/useUser";
import { UserRoleBadge } from "./user-role-badge";
import { SimpleMetrics } from "./simple-metrics";
import { SimpleActivity } from "./simple-activity";

export function Dashboard() {
  const { data: user } = useUser();

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              {user && <>Logged in as {user.name}</>}
            </p>
            {user && <UserRoleBadge role={user.role} />}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <SimpleMetrics />

      {/* Activity Feed */}
      <SimpleActivity />
    </div>
  );
}
