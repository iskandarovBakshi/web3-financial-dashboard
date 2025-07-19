"use client";

import { useMemo, useState } from "react";
import {
  useCompleteTransaction,
  useTransactions,
} from "@/hooks/useTransactions";
import { useRequestApproval } from "@/hooks/useApprovals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionStatus } from "@/types";
import { format } from "date-fns";
import { ethers } from "ethers";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Search,
  XCircle,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { toShortAddress } from "@/lib/toShortAddress";

type StatusFilter = "all" | TransactionStatus;

export function TransactionList() {
  const { address: currentAccountAddress } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { data: transactions = [], isLoading } = useTransactions();
  const requestApproval = useRequestApproval();
  const completeTransaction = useCompleteTransaction();

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.from.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, transactions]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    statusFilter !== "all"
  ].filter(Boolean).length;

  const handleRequestApproval = async (transactionId: bigint) => {
    try {
      await requestApproval.mutateAsync({
        transactionId,
        reason: "Requesting approval for transaction execution",
      });
      toast.success("Approval requested successfully");
    } catch (error) {
      console.error("Error requesting approval:", error);
      toast.error("Failed to request approval");
    }
  };

  const handleCompleteTransaction = async (transactionId: bigint) => {
    try {
      await completeTransaction.mutateAsync(transactionId);
      toast.success("Transaction completed successfully");
    } catch (error) {
      console.error("Error completing transaction:", error);
      toast.error("Failed to complete transaction");
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Pending:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case TransactionStatus.Active:
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case TransactionStatus.Completed:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case TransactionStatus.Rejected:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Pending:
        return "secondary" as const;
      case TransactionStatus.Active:
        return "default" as const;
      case TransactionStatus.Completed:
        return "default" as const;
      case TransactionStatus.Rejected:
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select 
            value={statusFilter.toString()} 
            onValueChange={(value) => setStatusFilter(value === "all" ? "all" : parseInt(value) as TransactionStatus)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={TransactionStatus.Pending.toString()}>Pending</SelectItem>
              <SelectItem value={TransactionStatus.Active.toString()}>Active</SelectItem>
              <SelectItem value={TransactionStatus.Completed.toString()}>Completed</SelectItem>
              <SelectItem value={TransactionStatus.Rejected.toString()}>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {transaction.description}
                    </CardTitle>
                    <CardDescription>
                      Transaction id: {transaction.id.toString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {TransactionStatus[transaction.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Amount</p>
                      <p className="text-lg font-bold">
                        {ethers.formatEther(transaction.amount)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">To</p>
                      <div>
                        <span className="text-sm text-muted-foreground font-mono">
                          {toShortAddress(transaction.to)}{" "}
                        </span>
                        {transaction.to === currentAccountAddress && (
                          <Badge variant={"default"}>you</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(Number(transaction.timestamp) * 1000),
                          "PPP p",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">From</p>
                      <div>
                        <span className="text-sm text-muted-foreground font-mono">
                          {toShortAddress(transaction.from)}{" "}
                        </span>
                        {transaction.from === currentAccountAddress && (
                          <Badge variant={"default"}>you</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  {transaction.status === TransactionStatus.Pending &&
                    transaction.from === currentAccountAddress && (
                      <Button
                        onClick={() => handleRequestApproval(transaction.id)}
                        disabled={requestApproval.isPending}
                        size="sm"
                      >
                        Request Approval
                      </Button>
                    )}

                  {transaction.status === TransactionStatus.Active &&
                    transaction.from === currentAccountAddress && (
                      <Button
                        onClick={() =>
                          handleCompleteTransaction(transaction.id)
                        }
                        disabled={completeTransaction.isPending}
                        size="sm"
                      >
                        Complete Transaction
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
