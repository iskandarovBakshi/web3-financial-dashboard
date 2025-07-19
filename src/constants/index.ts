import { env } from "@/lib/env";

export const CHAIN_IDS = {
  localhost: 31337,
  sepolia: 11155111,
};

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.localhost]: {
    FinancialPlatform: env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || "",
  },
  [CHAIN_IDS.sepolia]: {
    FinancialPlatform: env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "",
  },
} as const;
