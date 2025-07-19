import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContract } from "./useContract";
import { useAccount, useChainId } from "wagmi";
import { User, UserRole } from "@/types";

export function useUser(address?: string) {
  const { readOnlyContract } = useContract();
  const { address: account } = useAccount();
  const chainId = useChainId();

  const userAddress = address || account;

  return useQuery({
    queryKey: ["user", userAddress, chainId],
    queryFn: async () => {
      if (!userAddress || !readOnlyContract) {
        return null;
      }

      try {
        const user = await readOnlyContract.getUser(userAddress);

        // Check if user exists (id should be > 0 for existing users)
        if (user.id === BigInt(0)) {
          return null;
        }

        // Processed user object
        return {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.email,
          role: Number(user.role),
          isActive: user.isActive,
          createdAt: user.createdAt,
        } as User;
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error; // Re-throw the error so React Query can handle it properly
      }
    },
    enabled: !!userAddress && !!readOnlyContract,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useRegisterUser() {
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      name,
      email,
      role,
    }: {
      walletAddress: string;
      name: string;
      email: string;
      role: UserRole;
    }) => {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.registerUser(walletAddress, name, email, role);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }).then();
      queryClient.invalidateQueries({ queryKey: ["users"] }).then();
    },
  });
}

export function useUpdateUserRole() {
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userAddress,
      newRole,
    }: {
      userAddress: string;
      newRole: UserRole;
    }) => {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.updateUserRole(userAddress, newRole);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }).then();
      queryClient.invalidateQueries({ queryKey: ["users"] }).then();
    },
  });
}
