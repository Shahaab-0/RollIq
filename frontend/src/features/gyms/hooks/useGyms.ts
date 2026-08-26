import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as gymsApi from '../../../api/gyms';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type {
  GymRole,
  NewGym,
  NewGymClassEntry,
  NewGymClassVideo,
  NewGymScheduleEntry,
} from '../types';

export function useGyms() {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: gymsApi.listGyms,
  });
}

export function useCreateGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gym: NewGym) => gymsApi.createGym(gym),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not create this gym'), 'error'),
    meta: { toastSuccess: 'Gym created' },
  });
}

export function useGym(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', gymId],
    queryFn: () => gymsApi.getGym(gymId as string),
    enabled: !!gymId,
  });
}

export function useJoinGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => gymsApi.joinGym(inviteCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not join with that code'), 'error'),
    meta: { toastSuccess: 'Joined gym' },
  });
}

export function useGymMembers(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', gymId, 'members'],
    queryFn: () => gymsApi.listMembers(gymId as string),
    enabled: !!gymId,
  });
}

export function usePromoteMember(gymId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: GymRole }) =>
      gymsApi.updateMemberRole(gymId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'members'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, "Could not update this member's role"), 'error'),
    meta: { toastSuccess: 'Role updated' },
  });
}

export function useGymClasses(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', gymId, 'classes'],
    queryFn: () => gymsApi.listClasses(gymId as string),
    enabled: !!gymId,
  });
}

export function useCreateGymClass(gymId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: NewGymClassEntry) => gymsApi.createClass(gymId, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes'] });
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not post this class'), 'error'),
    meta: { toastSuccess: 'Class posted' },
  });
}

export function useDeleteGymClass(gymId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => gymsApi.deleteClass(gymId, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes'] });
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not delete this class'), 'error'),
    meta: { toastSuccess: 'Class deleted' },
  });
}

export function useGymClassVideos(gymId: string, classId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', gymId, 'classes', classId, 'videos'],
    queryFn: () => gymsApi.listClassVideos(gymId, classId as string),
    enabled: !!classId,
  });
}

export function useCreateGymClassVideo(gymId: string, classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (video: NewGymClassVideo) => gymsApi.createClassVideo(gymId, classId, video),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes', classId, 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not add this video'), 'error'),
    meta: { toastSuccess: 'Video added' },
  });
}

export function useDeleteGymClassVideo(gymId: string, classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => gymsApi.deleteClassVideo(gymId, classId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes', classId, 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not remove this video'), 'error'),
    meta: { toastSuccess: 'Video removed' },
  });
}

export function useGymSchedule(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', gymId, 'schedule'],
    queryFn: () => gymsApi.listSchedule(gymId as string),
    enabled: !!gymId,
  });
}

export function useCreateScheduleEntry(gymId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: NewGymScheduleEntry) => gymsApi.createScheduleEntry(gymId, entry),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'schedule'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not add this schedule slot'), 'error'),
    meta: { toastSuccess: 'Schedule updated' },
  });
}

export function useDeleteScheduleEntry(gymId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => gymsApi.deleteScheduleEntry(gymId, entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'schedule'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not remove this schedule slot'), 'error'),
    meta: { toastSuccess: 'Schedule slot removed' },
  });
}

export function useGymAttendance(gymId: string, classId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', gymId, 'classes', classId, 'attendance'],
    queryFn: () => gymsApi.listAttendance(gymId, classId as string),
    enabled: !!classId,
  });
}

export function useMarkAttendance(gymId: string, classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => gymsApi.markAttendance(gymId, classId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes', classId, 'attendance'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not mark attendance'), 'error'),
  });
}

export function useUnmarkAttendance(gymId: string, classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => gymsApi.unmarkAttendance(gymId, classId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['gyms', gymId, 'classes', classId, 'attendance'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not update attendance'), 'error'),
  });
}
