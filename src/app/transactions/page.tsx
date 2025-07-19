import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateTransactionDialog } from "@/components/transactions/create-transaction-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <DashboardLayout
      title="Transactions"
      description="Manage your financial transactions"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-end">
          <CreateTransactionDialog />
        </div>
        <TransactionList />
      </div>
    </DashboardLayout>
  );
}
