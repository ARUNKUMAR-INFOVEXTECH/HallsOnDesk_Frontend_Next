import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as settingsService from '@/services/api/modules/settings.service';
import { HallProfile, HallSettings } from '@/types/settings';
import { useState } from 'react';

// STALE TIME: 5 Minutes (settings rarely change, so cache them heavily)
const CACHE_TIME = 5 * 60 * 1000;

export function useHallProfile() {
  return useQuery({
    queryKey: ['hall-profile'],
    queryFn: settingsService.getHallProfile,
    staleTime: CACHE_TIME,
  });
}

export function useHallSettings() {
  return useQuery({
    queryKey: ['hall-settings'],
    queryFn: settingsService.getHallSettings,
    staleTime: CACHE_TIME,
  });
}

export function useUpdateHallProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateHallProfile,
    onSuccess: (res) => {
      queryClient.setQueryData(['hall-profile'], res.data);
      queryClient.invalidateQueries({ queryKey: ['hall-profile'] });
      toast.success('Hall profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update hall profile');
    },
  });
}

export function useUpdateHallSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateHallSettings,
    onSuccess: (res) => {
      queryClient.setQueryData(['hall-settings'], res.data);
      queryClient.invalidateQueries({ queryKey: ['hall-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      setIsUploading(true);
      setProgress(20);
      
      const res = await settingsService.uploadLogo(file);
      setProgress(100);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hall-profile'] });
      toast.success('Logo updated successfully');
      setIsUploading(false);
      setProgress(0);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload logo image');
      setIsUploading(false);
      setProgress(0);
    }
  });

  return {
    ...mutation,
    progress,
    isUploading,
  };
}

export function useUploadCoverImage() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      setIsUploading(true);
      setProgress(20);

      const res = await settingsService.uploadCoverImage(file);
      setProgress(100);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hall-profile'] });
      toast.success('Cover image updated successfully');
      setIsUploading(false);
      setProgress(0);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload cover image');
      setIsUploading(false);
      setProgress(0);
    }
  });

  return {
    ...mutation,
    progress,
    isUploading,
  };
}
