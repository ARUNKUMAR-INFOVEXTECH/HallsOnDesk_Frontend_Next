import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as ownerHallsService from '@/services/api/modules/ownerHalls.service';

export function useOwnerHallsList() {
  return useQuery({
    queryKey: ['owner-halls'],
    queryFn: ownerHallsService.getOwnerHalls,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateSecondaryHall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerHallsService.createSecondaryHall,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['owner-halls'] });
      toast.success(res.message || 'Secondary hall created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create secondary hall');
    },
  });
}

export function useUpdateSecondaryHall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ownerHallsService.updateSecondaryHall(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['owner-halls'] });
      toast.success(res.message || 'Hall configuration updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update hall details');
    },
  });
}

export function useDeleteSecondaryHall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerHallsService.deleteSecondaryHall,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['owner-halls'] });
      toast.success(res.message || 'Secondary hall deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete secondary hall');
    },
  });
}

export function useTransferStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, targetHallId }: { staffId: string; targetHallId: string }) =>
      ownerHallsService.transferStaffMember(staffId, targetHallId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['owner-halls'] });
      toast.success(res.message || 'Staff transferred successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to transfer staff member');
    },
  });
}
