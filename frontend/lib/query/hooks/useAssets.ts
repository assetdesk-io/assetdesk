// frontend/lib/query/hooks/useAssets.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  assetApiClient,
  AssetListFilters,
  AssetListResponse,
  CreateAssetInput,
  DepartmentWithCount,
  CategoryWithCount,
} from "@/lib/api/assets";
import { queryKeys } from "../keys";
import { Asset, AssetUser, UpdateAssetStatusInput, TransferAssetInput } from "../types/asset";
import { ApiError } from "../types";
import { toast, apiErrorMsg } from "@/lib/toast";

export function useAssets(
  filters?: AssetListFilters,
  options?: Omit<UseQueryOptions<AssetListResponse, ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery<AssetListResponse, ApiError>({
    queryKey: queryKeys.assets.list((filters as Record<string, unknown>) ?? {}),
    queryFn: () => assetApiClient.getAssets(filters),
    ...options,
  });
}

// ── Departments ───────────────────────────────────────────────

export function useDepartmentsList() {
  return useQuery<DepartmentWithCount[], ApiError>({
    queryKey: queryKeys.departments.list(),
    queryFn: () => assetApiClient.getDepartments(),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; name: string }, ApiError, { name: string; description?: string }>({
    mutationFn: (data) => assetApiClient.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast.success("Department created");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to create department")),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => assetApiClient.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast.success("Department deleted");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to delete department")),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; name: string }, ApiError, { id: string; data: { name: string; description?: string } }>({
    mutationFn: ({ id, data }) => assetApiClient.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast.success("Department updated");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to update department")),
  });
}

// ── Categories ────────────────────────────────────────────────

export function useCategories() {
  return useQuery<CategoryWithCount[], ApiError>({
    queryKey: queryKeys.categories.list(),
    queryFn: () => assetApiClient.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; name: string }, ApiError, { name: string; description?: string }>({
    mutationFn: (data) => assetApiClient.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Category created");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to create category")),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => assetApiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to delete category")),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; name: string }, ApiError, { id: string; data: { name: string; description?: string } }>({
    mutationFn: ({ id, data }) => assetApiClient.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Category updated");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to update category")),
  });
}

// ── Assets ────────────────────────────────────────────────────

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation<Asset, ApiError, CreateAssetInput>({
    mutationFn: (data) => assetApiClient.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success("Asset registered");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to create asset")),
  });
}

export function useUpdateAsset(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Asset, ApiError, Partial<CreateAssetInput>>({
    mutationFn: (data) => assetApiClient.updateAsset(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.assets.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success("Asset updated");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to update asset")),
  });
}

export function useUpdateAssetStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Asset, ApiError, UpdateAssetStatusInput>({
    mutationFn: (data) => assetApiClient.updateAssetStatus(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.assets.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to update status")),
  });
}

export function useTransferAsset(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Asset, ApiError, TransferAssetInput>({
    mutationFn: (data) => assetApiClient.transferAsset(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.assets.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success("Asset transferred");
    },
    onError: (err) => toast.error(apiErrorMsg(err, "Failed to transfer asset")),
  });
}

// ── Users (fixed key — uses queryKeys.users.list()) ───────────

export function useUsers() {
  return useQuery<AssetUser[], ApiError>({
    queryKey: queryKeys.users.list(),
    queryFn: () => assetApiClient.getUsers(),
  });
}
