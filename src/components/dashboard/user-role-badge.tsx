import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const getVariant = (role: UserRole) => {
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

  return <Badge variant={getVariant(role)}>{UserRole[role]}</Badge>;
}
