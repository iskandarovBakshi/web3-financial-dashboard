"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CustomConnectButton } from "@/components/wallet/connect-button";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/types";
import {
  ArrowLeftRight,
  CheckSquare,
  LayoutDashboard,
  Menu,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Approvals",
    href: "/approvals",
    icon: CheckSquare,
    requiredRole: UserRole.Manager,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    requiredRole: UserRole.Admin,
  },
];

function NavigationItems() {
  const pathname = usePathname();
  const { data: user } = useUser();

  const filteredNavigation = navigation.filter((item) => {
    if (item.requiredRole === undefined) return true;
    return user && user.role >= item.requiredRole;
  });

  return (
    <>
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );
}

export function Navigation() {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-col gap-2 p-4 w-64 border-r bg-background h-screen fixed left-0 top-0 z-40">
        <div className="mb-6">
          <h1 className="text-lg font-semibold">Financial Dashboard</h1>
        </div>
        <NavigationItems />
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b min-w-0 fixed top-0 left-0 right-0 bg-background z-50">
        <h1 className="text-base sm:text-lg font-semibold truncate">
          Financial Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="hidden xs:block">
            <CustomConnectButton />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col gap-2 p-4">
                <div className="mb-6">
                  <h1 className="text-lg font-semibold">Financial Dashboard</h1>
                </div>
                <div className="xs:hidden mb-4">
                  <CustomConnectButton />
                </div>
                <NavigationItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
