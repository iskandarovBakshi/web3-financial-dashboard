import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { CHAIN_IDS, CONTRACT_ADDRESSES } from "@/constants";
import { FinancialPlatform__factory } from "../../typechain-types";
import { env } from "@/lib/env";

export function useContract() {
  const { address: account } = useAccount();
  const chainId = useChainId();

  const getContract = useCallback(async () => {
    if (
      !account ||
      !chainId ||
      typeof window === "undefined" ||
      !window.ethereum
    ) {
      return null;
    }

    const contractAddress =
      CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
        ?.FinancialPlatform;
    if (!contractAddress) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return FinancialPlatform__factory.connect(contractAddress, signer);
    } catch (error) {
      console.error("Failed to create contract instance:", error);
      return null;
    }
  }, [account, chainId]);

  const readOnlyContract = useMemo(() => {
    if (!chainId) {
      return null;
    }

    const contractAddress =
      CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
        ?.FinancialPlatform;

    if (!contractAddress) {
      return null;
    }

    try {
      const sepoliaRpcUrl =
        env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
        "https://sepolia.infura.io/v3/your-project-id";

      const rpcUrl =
        chainId === CHAIN_IDS.localhost
          ? "http://127.0.0.1:8545"
          : sepoliaRpcUrl;

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      return FinancialPlatform__factory.connect(contractAddress, provider);
    } catch (error) {
      console.error("Failed to create read-only contract instance:", error);
      return null;
    }
  }, [chainId]);

  return { getContract, readOnlyContract };
}
