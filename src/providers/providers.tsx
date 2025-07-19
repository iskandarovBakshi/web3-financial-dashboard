"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProviderWrapper } from "@/providers/wagmi-provider-wrapper";
import { Toaster } from "sonner";
import { ReactNode, useState } from "react";
import { useContractEvents } from "@/hooks/useContractEvents";

interface ProvidersProps {
  children: ReactNode;
}

function ProvidersContent({ children }: ProvidersProps) {
  // Setup contract event listeners
  useContractEvents();

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchInterval: false, // Disable polling since we use events
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProviderWrapper>
        <ProvidersContent>{children}</ProvidersContent>
        <Toaster />
      </WagmiProviderWrapper>
    </QueryClientProvider>
  );
}
