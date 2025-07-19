"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/types";
import { CustomConnectButton } from "@/components/wallet/connect-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toShortAddress } from "@/lib/toShortAddress";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requiredRole,
  fallback,
}: AuthGuardProps) {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
    isRefetching,
  } = useUser();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading during hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not connected to wallet
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Connect Wallet
            </CardTitle>
            <CardDescription>
              Connect your wallet to access the financial dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Supported Networks:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sepolia (testnet)</li>
                {env.NODE_ENV === "development" && (
                  <li>• Localhost (development)</li>
                )}
              </ul>
            </div>
            <CustomConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading user data
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Error fetching user data
  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Connection Error
            </CardTitle>
            <CardDescription>
              Failed to load user data from the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Connected Account</p>
              <p className="text-sm text-muted-foreground font-mono">
                {toShortAddress(address)}
              </p>
            </div>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Unable to fetch user information. This could be due to:
              </p>
              <ul className="text-sm text-destructive mt-2 space-y-1">
                <li>• Network connectivity issues</li>
                <li>• Blockchain node problems</li>
                <li>• Smart contract errors</li>
              </ul>
            </div>
            <Button
              onClick={() => refetchUser()}
              disabled={isRefetching}
              className="w-full gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              {isRefetching ? "Retrying..." : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not registered
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Registration Required
            </CardTitle>
            <CardDescription>
              Your wallet is not registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Connected Account</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {toShortAddress(address)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  Please contact an administrator to register your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole !== undefined && user.role < requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Your Role:</p>
                <p className="text-sm text-muted-foreground">
                  {user.role === UserRole.Regular && "Regular User"}
                  {user.role === UserRole.Manager && "Manager"}
                  {user.role === UserRole.Admin && "Administrator"}
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  {requiredRole === UserRole.Manager &&
                    "Manager or Administrator role required"}
                  {requiredRole === UserRole.Admin &&
                    "Administrator role required"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
