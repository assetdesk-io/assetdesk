import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorsApiClient, Vendor, CreateVendorInput, UpdateVendorInput } from '@/lib/api/vendors';
import { queryKeys } from '../keys';
import { toast, apiErrorMsg } from '@/lib/toast';

export function useVendors() {
  return useQuery<Vendor[]>({
    queryKey: queryKeys.vendors.list(),
    queryFn: () => vendorsApiClient.getVendors(),
  });
}

export function useVendor(id?: string) {
  return useQuery<Vendor>({
    queryKey: queryKeys.vendors.detail(id ?? ''),
    queryFn: () => vendorsApiClient.getVendor(id as string),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorInput) => vendorsApiClient.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success('Vendor created');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to create vendor')),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorInput }) =>
      vendorsApiClient.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success('Vendor updated');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to update vendor')),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorsApiClient.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success('Vendor deleted');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to delete vendor')),
  });
}
