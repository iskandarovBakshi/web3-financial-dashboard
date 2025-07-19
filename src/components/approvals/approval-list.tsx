"use client";

import { useState } from "react";
import { usePendingApprovals, useProcessApproval } from "@/hooks/useApprovals";
import { useTransaction } from "@/hooks/useTransactions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ethers } from "ethers";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { toShortAddress } from "@/lib/toShortAddress";

interface ApprovalCardProps {
  approval: {
    id: bigint;
    transactionId: bigint;
    requester: string;
    timestamp: bigint;
    reason: string;
  };
}

function ApprovalCard({ approval }: ApprovalCardProps) {
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const { data: transaction } = useTransaction(approval.transactionId);
  const processApproval = useProcessApproval();

  const MAX_REASON_LENGTH = 300;

  const validateReason = (value: string) => {
    if (!value.trim()) {
      setReasonError("Please provide a reason for your decision");
      return false;
    }
    if (value.length > MAX_REASON_LENGTH) {
      setReasonError(`Reason must be ${MAX_REASON_LENGTH} characters or less`);
      return false;
    }
    setReasonError("");
    return true;
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (reasonError) {
      validateReason(value);
    }
  };

  const handleProcessApproval = async (approved: boolean) => {
    if (!validateReason(reason)) {
      toast.error(reasonError);
      return;
    }

    try {
      await processApproval.mutateAsync({
        approvalId: approval.id,
        approved,
        reason: reason.trim(),
      });

      toast.success(
        `Approval ${approved ? "approved" : "rejected"} successfully`,
      );
      setProcessDialogOpen(false);
      setReason("");
      setReasonError("");
    } catch (error) {
      console.error("Error processing approval:", error);
      toast.error("Failed to process approval");
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setProcessDialogOpen(open);
    if (!open) {
      setReason("");
      setReasonError("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              Approval Request #{approval.id.toString()}
            </CardTitle>
            <CardDescription>
              Transaction id: {approval.transactionId.toString()}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transaction && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Transaction Amount</p>
                  <p className="text-lg font-bold">
                    {ethers.formatEther(transaction.amount)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.description}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">To</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {toShortAddress(transaction.to)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Requested By</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {toShortAddress(approval.requester)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Request Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(Number(approval.timestamp) * 1000),
                      "PPP p",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reason</p>
                  <p className="text-sm text-muted-foreground">
                    {approval.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Dialog
              open={processDialogOpen}
              onOpenChange={handleDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Process Approval
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Process Approval Request</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for your decision on this approval
                    request.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label className="block" htmlFor="reason">
                    Reason
                  </Label>
                  <div className="space-y-1">
                    <Textarea
                      id="reason"
                      placeholder="Provide your reason for approval or rejection..."
                      value={reason}
                      onChange={(e) => handleReasonChange(e.target.value)}
                      className={
                        reasonError
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      maxLength={MAX_REASON_LENGTH}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span
                        className={
                          reasonError
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {reasonError || ""}
                      </span>
                      <span
                        className={`text-muted-foreground ${reason.length > MAX_REASON_LENGTH * 0.9 ? "text-amber-600" : ""} ${reason.length >= MAX_REASON_LENGTH ? "text-destructive" : ""}`}
                      >
                        {reason.length}/{MAX_REASON_LENGTH}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleProcessApproval(false)}
                    disabled={processApproval.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleProcessApproval(true)}
                    disabled={processApproval.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApprovalList() {
  const { data: approvals = [], isLoading } = usePendingApprovals();

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
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No pending approvals found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              All approval requests have been processed
            </p>
          </CardContent>
        </Card>
      ) : (
        approvals.map((approval) => (
          <ApprovalCard key={approval.id.toString()} approval={approval} />
        ))
      )}
    </div>
  );
}
