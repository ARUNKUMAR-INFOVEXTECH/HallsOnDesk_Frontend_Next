'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  logCustomerInteraction,
  CustomersQuery,
  CustomersListResponse,
} from '@/services/api/modules/customers.service';
import { Customer } from '@/types';

// 1. Fetch Customers List Query
export function useCustomersQuery(params: CustomersQuery = {}) {
  return useQuery<CustomersListResponse, Error>({
    queryKey: ['customers', 'list', params],
    queryFn: () => getCustomers(params),
    staleTime: 1 * 60 * 1000, // 1 minute cache validity
  });
}

// 2. Fetch Customer Details Query
export function useCustomerDetailQuery(id: string) {
  return useQuery<Customer & { bookings: any[] }, Error>({
    queryKey: ['customers', 'detail', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id, // Only execute if id exists
    staleTime: 2 * 60 * 1000,
  });
}

// 3. Create Customer Mutation
export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (res) => {
      toast.success('Customer profile created successfully!', {
        description: `${res.data.customer_name} has been added to the database.`,
      });
      // Invalidate customer lists cache
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to create customer profile. Please try again.';
      toast.error(errorMsg);
    },
  });
}

// 4. Update Customer Mutation
export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      updateCustomer(id, data),
    onSuccess: (_, variables) => {
      toast.success('Customer details updated successfully!');
      // Invalidate lists and details cache
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'detail', variables.id] });
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to save updates. Please try again.';
      toast.error(errorMsg);
    },
  });
}

// 5. Delete Customer Mutation
export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success('Customer profile deleted successfully.');
      // Invalidate customer lists cache
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to delete customer profile.';
      toast.error(errorMsg);
    },
  });
}

// 6. Log Customer Touchpoint/Interaction Mutation
export function useLogCustomerInteractionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, type, notes }: { id: string; type: string; notes: string }) =>
      logCustomerInteraction(id, { type, notes }),
    onSuccess: (_, variables) => {
      toast.success('Touchpoint interaction logged successfully!');
      // Invalidate customer details to refresh any activities/timeline
      queryClient.invalidateQueries({ queryKey: ['customers', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', 'customer', variables.id] });
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to log interaction touchpoint.';
      toast.error(errorMsg);
    },
  });
}
