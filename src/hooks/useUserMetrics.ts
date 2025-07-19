import { useQuery } from "@tanstack/react-query";
import { useContract } from "./useContract";
import { useChainId } from "wagmi";

export function useUserMetrics() {
  const { readOnlyContract } = useContract();
  const chainId = useChainId();

  return useQuery({
    queryKey: ["user-metrics", chainId],
    queryFn: async (): Promise<number> => {
      if (!readOnlyContract) {
        throw new Error("Contract not available");
      }

      try {
        const userCount = await readOnlyContract.getUserCount();
        return Number(userCount);
      } catch (error) {
        console.error("Error fetching user count:", error);
        throw error;
      }
    },
    enabled: !!readOnlyContract,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
