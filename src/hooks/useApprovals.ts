import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContract } from "./useContract";
import { useChainId } from "wagmi";
import { Approval } from "@/types";

export function usePendingApprovals() {
  const { readOnlyContract } = useContract();
  const chainId = useChainId();

  return useQuery({
    queryKey: ["pending-approvals", chainId],
    queryFn: async () => {
      if (!readOnlyContract) return [];

      try {
        const approvalIds = await readOnlyContract.getPendingApprovals();

        return await Promise.all(
          approvalIds.map(async (id) => {
            const approval = await readOnlyContract.getApproval(id);
            return {
              id: approval.id,
              transactionId: approval.transactionId,
              requester: approval.requester,
              approver: approval.approver,
              status: Number(approval.status),
              reason: approval.reason,
              timestamp: approval.timestamp,
            } as Approval;
          }),
        );
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
        return [];
      }
    },
    enabled: !!readOnlyContract,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
}

export function useRequestApproval() {
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: bigint;
      reason: string;
    }) => {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.requestApproval(transactionId, reason);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] }).then();
      queryClient.invalidateQueries({ queryKey: ["transactions"] }).then();
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] }).then();
    },
  });
}

export function useProcessApproval() {
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      approvalId,
      approved,
      reason,
    }: {
      approvalId: bigint;
      approved: boolean;
      reason: string;
    }) => {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.processApproval(approvalId, approved, reason);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] }).then();
      queryClient.invalidateQueries({ queryKey: ["approval"] }).then();
      queryClient.invalidateQueries({ queryKey: ["transactions"] }).then();
      queryClient.invalidateQueries({ queryKey: ["transaction"] }).then();
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] }).then();
    },
  });
}
