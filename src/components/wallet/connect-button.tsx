"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useChainId } from "wagmi";
import { injected } from "wagmi/connectors";

export function CustomConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading during hydration
  if (!mounted) {
    return (
      <Button disabled>
        <Wallet className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address).then();
    toast.success("Address copied to clipboard");
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number) => {
    switch (id) {
      case 31337:
        return "Localhost";
      case 11155111:
        return "Sepolia";
      default:
        return "Unknown";
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => connect({ connector: injected() })}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        {getNetworkName(chainId)}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {formatAddress(address!)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem
            onClick={() => copyAddress(address!)}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Address
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              const explorerUrl = chainId === 11155111 
                ? "https://sepolia.etherscan.io" 
                : "https://etherscan.io";
              window.open(`${explorerUrl}/address/${address}`, "_blank");
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => disconnect()}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
