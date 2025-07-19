import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ApprovalList } from "@/components/approvals/approval-list";
import { UserRole } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approvals",
  description:
    "Review and process pending transaction approval requests. Manager and admin access required.",
};

export default function ApprovalsPage() {
  return (
    <DashboardLayout
      title="Approvals"
      description="Review and process pending approval requests"
      requiredRole={UserRole.Manager}
    >
      <ApprovalList />
    </DashboardLayout>
  );
}
