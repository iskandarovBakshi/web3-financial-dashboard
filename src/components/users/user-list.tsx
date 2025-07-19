"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUpdateUserRole, useUser } from "@/hooks/useUser";
import { UserRole } from "@/types";
import { Loader2, Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { toShortAddress } from "@/lib/toShortAddress";

interface UserCardProps {
  address: string;
}

function UserCard({ address }: UserCardProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const { data: user, isLoading } = useUser(address);
  const updateUserRole = useUpdateUserRole();

  const handleUpdateRole = async () => {
    if (!user || !newRole) return;

    try {
      await updateUserRole.mutateAsync({
        userAddress: address,
        newRole: parseInt(newRole) as UserRole,
      });

      toast.success("User role updated successfully");
      setUpdateDialogOpen(false);
      setNewRole("");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-3 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-16 w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sm text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return "destructive" as const;
      case UserRole.Manager:
        return "default" as const;
      case UserRole.Regular:
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription className="font-mono">
              {toShortAddress(user.walletAddress)}
            </CardDescription>
          </div>
          <Badge variant={getRoleBadgeVariant(user.role)}>
            {UserRole[user.role]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium">Email</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium">Status</p>
              <Badge
                variant={user.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 pt-3 sm:pt-4">
            <p className="text-xs text-muted-foreground truncate">
              User ID: {user.id.toString()}
            </p>

            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs w-full xs:w-auto"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Update </span>Role
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-2rem)] max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    Update User Role
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Change the role for {user.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="newRole" className="text-sm">
                      New Role
                    </Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" className="text-sm">
                          {UserRole[UserRole.Regular]}
                        </SelectItem>
                        <SelectItem value="1" className="text-sm">
                          {UserRole[UserRole.Manager]}
                        </SelectItem>
                        <SelectItem value="2" className="text-sm">
                          {UserRole[UserRole.Admin]}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setUpdateDialogOpen(false)}
                    disabled={updateUserRole.isPending}
                    className="w-full sm:w-auto text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateRole}
                    disabled={updateUserRole.isPending || !newRole}
                    className="w-full sm:w-auto text-sm"
                  >
                    {updateUserRole.isPending && (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    )}
                    Update Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserList() {
  const [userAddresses, setUserAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");

  const addAddress = () => {
    if (newAddress && !userAddresses.includes(newAddress)) {
      setUserAddresses([...userAddresses, newAddress]);
      setNewAddress("");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Quick add user address for testing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick User Lookup</CardTitle>
          <CardDescription>
            Enter a wallet address to view user details (for testing purposes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xs:flex-row gap-2">
            <Input
              placeholder="Enter wallet address..."
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="text-sm flex-1"
            />
            <Button
              onClick={addAddress}
              disabled={!newAddress}
              className="text-sm w-full xs:w-auto"
            >
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {userAddresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users to display</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add wallet addresses above to view user details
              </p>
            </CardContent>
          </Card>
        ) : (
          userAddresses.map((address) => (
            <UserCard key={address} address={address} />
          ))
        )}
      </div>
    </div>
  );
}
