export interface User {
  id: bigint;
  walletAddress: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: bigint;
}

export enum UserRole {
  Regular = 0,
  Manager = 1,
  Admin = 2,
}

export enum TransactionStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Rejected = 3,
}

export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface Transaction {
  id: bigint;
  from: string;
  to: string;
  amount: bigint;
  description: string;
  status: TransactionStatus;
  timestamp: bigint;
  approvalId: bigint;
}

export interface Approval {
  id: bigint;
  transactionId: bigint;
  requester: string;
  approver: string;
  status: ApprovalStatus;
  reason: string;
  timestamp: bigint;
}
