'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as instructionalsApi from '../api';
import { showToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { NewInstructional, NewInstructionalVideo, ProgressStatus } from '../types';

export function useInstructionals() {
  return useQuery({ queryKey: ['instructionals'], queryFn: instructionalsApi.listInstructionals });
}

export function useCreateInstructional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instructional: NewInstructional) => instructionalsApi.createInstructional(instructional),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructionals'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not add this instructional'), 'error'),
    meta: { toastSuccess: 'Instructional added' },
  });
}

export function useInstructionalVideos(instructionalId: string | undefined) {
  return useQuery({
    queryKey: ['instructionals', instructionalId, 'videos'],
    queryFn: () => instructionalsApi.listVideos(instructionalId as string),
    enabled: !!instructionalId,
  });
}

export function useCreateVideo(instructionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (video: NewInstructionalVideo) => instructionalsApi.createVideo(instructionalId, video),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructionals', instructionalId, 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['instructionals'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not add this video'), 'error'),
    meta: { toastSuccess: 'Video added' },
  });
}

export function useInstructionalProgress() {
  return useQuery({ queryKey: ['instructionalProgress'], queryFn: instructionalsApi.listProgress });
}

export function useSetProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, status, notes }: { videoId: string; status: ProgressStatus; notes?: string | null }) =>
      instructionalsApi.upsertProgress(videoId, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructionalProgress'] });
      queryClient.invalidateQueries({ queryKey: ['instructionals'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not update progress'), 'error'),
  });
}

export function useRemoveProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => instructionalsApi.deleteProgress(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructionalProgress'] });
      queryClient.invalidateQueries({ queryKey: ['instructionals'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not update progress'), 'error'),
  });
}
