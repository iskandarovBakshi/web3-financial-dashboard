# Web3 Financial Dashboard

Build a comprehensive dashboard for managing financial transactions, approvals, and users with **Web3 integration**. The frontend integrates with smart contracts to provide a real blockchain-based financial management system.

## Features

### Core Functionality
- **Dashboard Overview**: Display key metrics from blockchain (total transactions, pending approvals, active deals)
- **Transaction Management**: View list of transactions from blockchain with filtering, create new transactions through smart contract calls
- **Approval Workflow**: View pending approvals, approve or reject requests through smart contract calls
- **User Management**: View user profiles from blockchain, manage user roles and permissions through smart contract calls
- **Web3 Integration**: MetaMask wallet connection and smart contract interaction

### Role-Based Access Control
- **Regular Users**: Can create and view their own transactions
- **Managers**: Can approve/reject transactions + regular user permissions
- **Administrators**: Full system access including user management

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** (no hardcoded CSS)
- **React Query** (for local/sample/mock data fetching)
- **Shadcn/ui** components
- **React Hook Form** + Zod for forms
- **Web3 Integration**: Ethers.js

## Prerequisites

- Node.js 18+ and yarn
- MetaMask browser extension
- Access to Ethereum networks (localhost/Sepolia)

## Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd oumla-technical-assignment-web3-dashboard
yarn install
```

2. **Environment Setup**
```bash
cp .env.example .env
```

Update `.env` with your contract addresses:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x...
```

3. **Run Development Server**
```bash
yarn dev
```

4. **Connect Wallet**
- Install MetaMask if not already installed
- Switch to localhost (Chain ID: 31337) or Sepolia (Chain ID: 11155111)
- Connect your wallet in the application

## Web3 Integration Requirements

### Smart Contract Functions
- **User Management**: `getUser()`, `registerUser()`, `updateUserRole()`
- **Transaction Management**: `createTransaction()`, `getTransaction()`, `getUserTransactions()`
- **Approval Workflow**: `requestApproval()`, `processApproval()`, `getPendingApprovals()`
- **Data Retrieval**: `getTransactionCount()`, `getApprovalCount()`, `getUserCount()`

### Role-Based Access Control
- **User Roles**: Regular, Manager, Admin
- **Permission Checks**: Check user roles before showing/hiding features
- **Admin Functions**: Only admins can register users and update roles
- **Approver Functions**: Only managers/admins can process approvals

## Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn lint         # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard page
│   ├── transactions/      # Transaction management
│   ├── approvals/         # Approval workflow
│   └── users/             # User management (admin)
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── transactions/      # Transaction components
│   ├── approvals/         # Approval components
│   ├── users/             # User management components
│   ├── wallet/            # Wallet connection components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

## Required Components

### 1. Wallet Connection
- Connect/disconnect wallet
- Display account information
- Show network status
- Handle connection errors

### 2. Dashboard
- Display blockchain metrics
- Show user's role and permissions
- Recent activity feed

### 3. Transaction Management
- Transaction list with blockchain data
- Create transaction form with contract integration
- Transaction details modal
- Status tracking and updates

### 4. Approval Workflow
- Pending approvals list
- Approval processing interface
- Approval history

### 5. User Management
- User list (admin only)
- User registration form (admin only)
- Role management interface

---

This project is part of a technical assignment demonstrating Web3 integration with smart contracts.
