'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMuhurthamDates, addMuhurthamDate, MuhurthamDate } from '@/services/api/modules/muhurtham.service';

// Hook: Fetch all Muhurtham dates
export function useMuhurthamDates(params: { from_date?: string; to_date?: string } = {}) {
  return useQuery<MuhurthamDate[], Error>({
    queryKey: ['muhurtham-dates', params],
    queryFn: () => getMuhurthamDates(params),
    staleTime: 60 * 60 * 1000, // 1 hour caching (astrological dates rarely change)
    refetchOnWindowFocus: false,
  });
}

// Hook: Add custom Muhurtham date
export function useAddMuhurthamDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMuhurthamDate,
    onSuccess: () => {
      toast.success('Auspicious Muhurtham date added successfully!');
      queryClient.invalidateQueries({ queryKey: ['muhurtham-dates'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to add Muhurtham date.';
      toast.error(errMsg);
    },
  });
}
