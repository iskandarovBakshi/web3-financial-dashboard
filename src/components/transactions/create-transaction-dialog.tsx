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
import { Textarea } from "@/components/ui/textarea";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

const createTransactionSchema = z.object({
  to: z
    .string()
    .min(1, "Recipient address is required")
    .refine((value) => ethers.isAddress(value), "Invalid Ethereum address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => {
      try {
        const num = parseFloat(value);
        return num > 0;
      } catch {
        return false;
      }
    }, "Amount must be a positive number"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters"),
});

type CreateTransactionForm = z.infer<typeof createTransactionSchema>;

export function CreateTransactionDialog() {
  const [open, setOpen] = useState(false);
  const createTransaction = useCreateTransaction();

  const form = useForm<CreateTransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      to: "",
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateTransactionForm) => {
    try {
      const amountInWei = ethers.parseEther(data.amount);

      await createTransaction.mutateAsync({
        to: data.to,
        amount: amountInWei,
        description: data.description,
      });

      toast.success("Transaction created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">New </span>Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[425px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>
              Create a new transaction that will require approval before
              execution.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm">
                Recipient Address
              </Label>
              <Input
                id="to"
                placeholder="0x..."
                className="text-sm"
                {...form.register("to")}
              />
              {form.formState.errors.to && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.to.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">
                Amount (ETH)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                placeholder="0.00"
                className="text-sm"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Transaction description..."
                className="text-sm min-h-[60px] sm:min-h-[80px]"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createTransaction.isPending}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTransaction.isPending}
              className="w-full sm:w-auto text-sm"
            >
              {createTransaction.isPending && (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              )}
              <span className="hidden xs:inline">Create </span>Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
