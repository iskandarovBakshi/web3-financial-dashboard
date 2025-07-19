import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContract } from "./useContract";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { TransactionStatus, UserRole } from "@/types";
import { useUser } from "@/hooks/useUser";

export function useContractEvents() {
  const { readOnlyContract } = useContract();
  const { address: account } = useAccount();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useUser();

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["approvals"] });
    queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [queryClient]);

  const setupEventListeners = useCallback(() => {
    if (!readOnlyContract || userLoading || !user) return;

    const currentUserRole = user.role;

    try {
      // Listen for TransactionCreated events
      // if the current user is admin or involved in the transaction, show a notification
      readOnlyContract.on(
        readOnlyContract.filters[
          "TransactionCreated(uint256,address,address,uint256)"
        ],
        (id, from, to) => {
          const isCurrentUserInvolved =
            user.walletAddress.toLowerCase() === from.toLowerCase() ||
            user.walletAddress.toLowerCase() === to.toLowerCase();

          if (currentUserRole === UserRole.Admin || isCurrentUserInvolved) {
            const description = isCurrentUserInvolved
              ? `Transaction ID: ${id.toString()} - You are ${user.walletAddress.toLowerCase() === from.toLowerCase() ? "sender" : "recipient"}`
              : `Transaction ID: ${id.toString()}`;

            toast.success("New transaction created!", {
              description,
            });

            invalidateQueries();
          }
        },
      );

      // Listen for TransactionStatusUpdated events
      // if the current user is admin or involved in the transaction, show a notification
      readOnlyContract.on(
        readOnlyContract.filters["TransactionStatusUpdated(uint256,uint8)"],
        async (id, status) => {
          // We need to fetch the transaction to get from/to addresses
          try {
            const transaction = await readOnlyContract.getTransaction(id);
            const isCurrentUserInvolved =
              user.walletAddress.toLowerCase() ===
                transaction.from.toLowerCase() ||
              user.walletAddress.toLowerCase() === transaction.to.toLowerCase();

            if (currentUserRole === UserRole.Admin || isCurrentUserInvolved) {
              const statusName = TransactionStatus[Number(status)] || "Unknown";

              const description = isCurrentUserInvolved
                ? `Your transaction ${id.toString()} is now ${statusName}`
                : `Transaction ${id.toString()} is now ${statusName}`;

              toast.info("Transaction status updated", {
                description,
              });

              invalidateQueries();
            }
          } catch (error) {
            console.error(
              "Error fetching transaction for status update:",
              error,
            );
            // Fallback: show to all users if we can't determine involvement
            if (currentUserRole === UserRole.Admin) {
              toast.info("Transaction status updated", {
                description: `Transaction ${id.toString()} is now ${TransactionStatus[Number(status)] || "Unknown"}`,
              });
              invalidateQueries();
            }
          }
        },
      );

      // Listen for ApprovalRequested events
      // if the current user is admin/manager, show a notification
      readOnlyContract.on(
        readOnlyContract.filters["ApprovalRequested(uint256,uint256,address)"],
        async (_, transactionId, requested) => {
          if (user.walletAddress.toLowerCase() === requested.toLowerCase())
            return;

          if (
            currentUserRole === UserRole.Admin ||
            currentUserRole === UserRole.Manager
          ) {
            toast.info("New approval request", {
              description: `Transaction ${transactionId.toString()} requires approval`,
            });

            invalidateQueries();
          }
        },
      );

      // Listen for ApprovalProcessed events
      // if the current user is admin/manager or involved in the transaction, show a notification
      readOnlyContract.on(
        readOnlyContract.filters["ApprovalProcessed(uint256,uint8,address)"],
        async (id, status, approver) => {
          if (user.walletAddress.toLowerCase() === approver.toLowerCase())
            return;

          try {
            const transaction = await readOnlyContract.getTransaction(id);
            const isCurrentUserInvolved =
              user.walletAddress.toLowerCase() ===
                transaction.from.toLowerCase() ||
              user.walletAddress.toLowerCase() === transaction.to.toLowerCase();

            if (
              currentUserRole === UserRole.Admin ||
              currentUserRole === UserRole.Manager ||
              isCurrentUserInvolved
            ) {
              const approved = Number(status) === 1; // Assuming 1 = approved, 0 = rejected
              const description = isCurrentUserInvolved
                ? `Your approval ${id.toString()} has been ${approved ? "approved" : "rejected"}`
                : `Approval ${id.toString()} has been ${approved ? "approved" : "rejected"}`;

              toast.success(`Approval ${approved ? "approved" : "rejected"}`, {
                description,
              });

              invalidateQueries();
            }
          } catch (error) {
            console.error(
              "Error fetching transaction for approval processed:",
              error,
            );
            // Fallback: show to admin/manager users if we can't determine involvement
            if (
              currentUserRole === UserRole.Admin ||
              currentUserRole === UserRole.Manager
            ) {
              const approved = Number(status) === 1;
              toast.success(`Approval ${approved ? "approved" : "rejected"}`, {
                description: `Approval ${id.toString()} has been processed`,
              });
              invalidateQueries();
            }
          }
        },
      );
      // Listen for UserRegistered events
      readOnlyContract.on(
        readOnlyContract.filters["UserRegistered(uint256,address,string)"],
        (userAddress, _, __, role) => {
          if (String(userAddress).toLowerCase() === account?.toLowerCase()) {
            toast.success("Welcome! Your account has been registered", {
              description: `Role: ${UserRole[Number(role)] || "Unknown"}`,
            });
          }

          invalidateQueries();
        },
      );

      // Listen for UserRoleUpdated events
      readOnlyContract.on(
        readOnlyContract.filters["UserRoleUpdated(address,uint8)"],
        (userAddress, newRole, _) => {
          // Show notification if it's the current user
          if (String(userAddress).toLowerCase() === account?.toLowerCase()) {
            toast.info("Your role has been updated", {
              description: `New role: ${UserRole[Number(newRole)] || "Unknown"}`,
            });
          }

          invalidateQueries();
        },
      );
    } catch (error) {
      console.error("Failed to set up contract event listeners:", error);
    }
  }, [readOnlyContract, account, invalidateQueries, user, userLoading]);

  const cleanupEventListeners = useCallback(() => {
    if (!readOnlyContract) return;

    try {
      // Remove all listeners
      readOnlyContract.removeAllListeners();
    } catch (error) {
      console.error("Failed to cleanup contract event listeners:", error);
    }
  }, [readOnlyContract]);

  useEffect(() => {
    if (readOnlyContract && account && !userLoading && user) {
      setupEventListeners();

      // Cleanup on unmount or when dependencies change
      return cleanupEventListeners;
    }
  }, [
    readOnlyContract,
    account,
    setupEventListeners,
    cleanupEventListeners,
    userLoading,
    user,
  ]);

  return {
    setupEventListeners,
    cleanupEventListeners,
  };
}
