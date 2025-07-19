"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ethers } from "ethers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterUser } from "@/hooks/useUser";
import { UserRole } from "@/types";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const registerUserSchema = z.object({
  walletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .refine((value) => ethers.isAddress(value), "Invalid Ethereum address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.email("Invalid email address"),
  role: z
    .enum(["0", "1", "2"])
    .refine((val) => val !== undefined, "Role is required"),
});

type RegisterUserForm = z.infer<typeof registerUserSchema>;

export function RegisterUserDialog() {
  const [open, setOpen] = useState(false);
  const registerUser = useRegisterUser();

  const form = useForm<RegisterUserForm>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      walletAddress: "",
      name: "",
      email: "",
      role: undefined,
    },
  });

  const onSubmit = async (data: RegisterUserForm) => {
    try {
      await registerUser.mutateAsync({
        walletAddress: data.walletAddress,
        name: data.name,
        email: data.email,
        role: parseInt(data.role) as UserRole,
      });

      toast.success("User registered successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Failed to register user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Register User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Register New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with their wallet address and role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="0x..."
                {...form.register("walletAddress")}
              />
              {form.formState.errors.walletAddress && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.walletAddress.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as "0" | "1" | "2")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    {UserRole[UserRole.Regular]}
                  </SelectItem>
                  <SelectItem value="1">
                    {UserRole[UserRole.Manager]}
                  </SelectItem>
                  <SelectItem value="2">{UserRole[UserRole.Admin]}</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={registerUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={registerUser.isPending}>
              {registerUser.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Register User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
