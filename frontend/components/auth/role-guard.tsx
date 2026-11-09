"use client";

import { useRole, UserRole } from "@/lib/hooks/useRole";

interface RoleGuardProps {
  /** Minimum role required to render children */
  minRole: UserRole;
  /** Optional fallback if access is denied. Defaults to null (render nothing). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children only when the current user has at least `minRole`.
 *
 * Usage:
 *   <RoleGuard minRole="admin">
 *     <DeleteButton />
 *   </RoleGuard>
 */
export function RoleGuard({ minRole, fallback = null, children }: RoleGuardProps) {
  const { can } = useRole();
  return can(minRole) ? <>{children}</> : <>{fallback}</>;
}
