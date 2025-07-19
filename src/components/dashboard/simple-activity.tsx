"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { usePendingApprovals } from "@/hooks/useApprovals";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/types";
import { formatDistanceToNow } from "date-fns";

export function SimpleActivity() {
  const { data: user } = useUser();
  const { data: transactions = [] } = useTransactions();
  const { data: approvals = [] } = usePendingApprovals();
  
  const canViewApprovals = user && user.role >= UserRole.Manager;
  
  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 5);
  
  // Get recent approvals (last 5)  
  const recentApprovals = approvals
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 5);

  const getStatusText = (status: number) => {
    const statusNames = ["Pending", "Active", "Completed", "Rejected"];
    return statusNames[status] || "Unknown";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest transaction activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No transactions yet</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {(Number(tx.amount) / 1e18).toFixed(4)} ETH
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(tx.timestamp) * 1000), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 2 ? 'bg-green-100 text-green-800' :
                      tx.status === 3 ? 'bg-red-100 text-red-800' :
                      tx.status === 1 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals (for Managers/Admins) or User Activity */}
      {canViewApprovals ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Transactions awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApprovals.length === 0 ? (
                <p className="text-muted-foreground text-sm">No pending approvals</p>
              ) : (
                recentApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Approval #{approval.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(Number(approval.timestamp) * 1000), { addSuffix: true })}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user && recentTransactions
                .filter(tx => tx.from === user.walletAddress)
                .slice(0, 5)
                .map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {(Number(tx.amount) / 1e18).toFixed(4)} ETH
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(Number(tx.timestamp) * 1000), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 2 ? 'bg-green-100 text-green-800' :
                      tx.status === 3 ? 'bg-red-100 text-red-800' :
                      tx.status === 1 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}