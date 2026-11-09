"use client";

import { useAuthStore } from "@/store/auth.store";

export type UserRole = "admin" | "manager" | "staff" | "viewer";

/** Returns true if the current user has at least the given role level. */
const ROLE_LEVEL: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  staff: 2,
  viewer: 1,
};

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role?.toLowerCase() ?? "viewer") as UserRole;

  return {
    role,
    isAdmin: role === "admin",
    isManager: role === "manager" || role === "admin",
    isStaff: ROLE_LEVEL[role] >= ROLE_LEVEL["staff"],
    can: (minRole: UserRole) => ROLE_LEVEL[role] >= ROLE_LEVEL[minRole],
  };
}
