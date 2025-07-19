"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { usePendingApprovals } from "@/hooks/useApprovals";
import { useUserMetrics } from "@/hooks/useUserMetrics";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/types";
import { ArrowLeftRight, Clock, Users, CheckCircle } from "lucide-react";

export function SimpleMetrics() {
  const { data: user } = useUser();
  const { data: transactions = [] } = useTransactions();
  const { data: approvals = [] } = usePendingApprovals();
  const { data: userCount = 0 } = useUserMetrics();
  
  const canViewApprovals = user && user.role >= UserRole.Manager;
  const isAdmin = user?.role === UserRole.Admin;
  
  const completedTransactions = transactions.filter(tx => tx.status === 2).length;
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactions.length}</div>
          <p className="text-xs text-muted-foreground">
            All transactions in the system
          </p>
        </CardContent>
      </Card>

      {canViewApprovals && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTransactions}</div>
          <p className="text-xs text-muted-foreground">
            Successfully completed
          </p>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}