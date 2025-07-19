import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Web3 financial dashboard overview with real-time metrics, transaction summaries, and approval status.",
};

export default function Home() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your financial platform activity"
    >
      <Dashboard />
    </DashboardLayout>
  );
}
