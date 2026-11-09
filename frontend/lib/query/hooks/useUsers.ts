// frontend/lib/query/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApiClient, AppUser, UserRole, UpdateProfileInput } from "@/lib/api/users";
import { queryKeys } from "../keys";
import { toast, apiErrorMsg } from "@/lib/toast";

export function useUsersList(search?: string) {
  return useQuery<AppUser[]>({
    queryKey: queryKeys.users.list(search),
    queryFn: () => usersApiClient.getUsers(search),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation<AppUser, Error, { id: string; role: UserRole }>({
    mutationFn: ({ id, role }) => usersApiClient.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to update role")),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<AppUser, Error, UpdateProfileInput>({
    mutationFn: (data) => usersApiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to update profile")),
  });
}
