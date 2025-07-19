import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RegisterUserDialog } from "@/components/users/register-user-dialog";
import { UserList } from "@/components/users/user-list";
import { UserRole } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description:
    "Manage user accounts, roles, and permissions. Register new users and update existing user roles. Admin access required.",
};

export default function UsersPage() {
  return (
    <DashboardLayout
      title="User Management"
      description="Manage user accounts and permissions"
      requiredRole={UserRole.Admin}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-end">
          <RegisterUserDialog />
        </div>
        <UserList />
      </div>
    </DashboardLayout>
  );
}
