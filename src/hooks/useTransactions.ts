import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContract } from "./useContract";
import { useAccount, useChainId } from "wagmi";
import { Transaction } from "@/types";

export function useTransactions(userAddress?: string) {
  const { readOnlyContract } = useContract();
  const { address: account } = useAccount();
  const chainId = useChainId();

  const targetAddress = userAddress || account;

  return useQuery({
    queryKey: ["transactions", targetAddress, chainId],
    queryFn: async () => {
      if (!targetAddress || !readOnlyContract) return [];

      try {
        const transactionIds =
          await readOnlyContract.getUserTransactions(targetAddress);

        return await Promise.all(
          transactionIds.map(async (id) => {
            const tx = await readOnlyContract.getTransaction(id);
            return {
              id: tx.id,
              from: tx.from,
              to: tx.to,
              amount: tx.amount,
              description: tx.description,
              status: Number(tx.status),
              timestamp: tx.timestamp,
              approvalId: tx.approvalId,
            } as Transaction;
          }),
        );
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
    },
    enabled: !!targetAddress && !!readOnlyContract,
  });
}

export function useTransaction(transactionId?: bigint) {
  const { readOnlyContract } = useContract();
  const chainId = useChainId();

  return useQuery({
    queryKey: ["transaction", transactionId?.toString(), chainId],
    queryFn: async () => {
      if (!transactionId || !readOnlyContract) return null;

      try {
        const tx = await readOnlyContract.getTransaction(transactionId);
        return {
          id: tx.id,
          from: tx.from,
          to: tx.to,
          amount: tx.amount,
          description: tx.description,
          status: Number(tx.status),
          timestamp: tx.timestamp,
          approvalId: tx.approvalId,
        } as Transaction;
      } catch {
        return null;
      }
    },
    enabled: !!transactionId && !!readOnlyContract,
  });
}

export function useCreateTransaction() {
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      to,
      amount,
      description,
    }: {
      to: string;
      amount: bigint;
      description: string;
    }) => {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.createTransaction(to, amount, description);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] }).then();
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] }).then();
    },
  });
}

export function useCompleteTransaction() {
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: bigint) => {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.completeTransaction(transactionId);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] }).then();
      queryClient.invalidateQueries({ queryKey: ["transaction"] }).then();
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] }).then();
    },
  });
}
