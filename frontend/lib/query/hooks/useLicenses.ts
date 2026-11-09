import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { licenseApiClient, CreateLicenseInput, UpdateLicenseInput, License, SeatAssignment } from '@/lib/api/licenses';
import { queryKeys } from '../keys';
import { toast, apiErrorMsg } from '@/lib/toast';

export function useLicenses() {
  return useQuery<License[]>({
    queryKey: queryKeys.licenses.list(),
    queryFn: () => licenseApiClient.getLicenses(),
  });
}

export function useLicense(id?: string) {
  return useQuery<License>({
    queryKey: queryKeys.licenses.detail(id ?? ''),
    queryFn: () => licenseApiClient.getLicense(id as string),
    enabled: !!id,
  });
}

export function useLicenseAssignments(id?: string) {
  return useQuery<SeatAssignment[]>({
    queryKey: queryKeys.licenses.assignments(id ?? ''),
    queryFn: () => licenseApiClient.getAssignments(id as string),
    enabled: !!id,
  });
}

export function useCreateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLicenseInput) => licenseApiClient.createLicense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.all });
      toast.success('License created');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to create license')),
  });
}

export function useUpdateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLicenseInput }) =>
      licenseApiClient.updateLicense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.all });
      toast.success('License updated');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to update license')),
  });
}

export function useDeleteLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => licenseApiClient.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.all });
      toast.success('License deleted');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to delete license')),
  });
}

export function useRevealLicenseKey() {
  return useMutation({
    mutationFn: (id: string) => licenseApiClient.revealKey(id),
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to reveal license key')),
  });
}

export function useAssignSeat(licenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => licenseApiClient.assignSeat(licenseId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.assignments(licenseId) });
      toast.success('Seat assigned');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to assign seat')),
  });
}

export function useUnassignSeat(licenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => licenseApiClient.unassignSeat(licenseId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses.assignments(licenseId) });
      toast.success('Seat unassigned');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to unassign seat')),
  });
}
