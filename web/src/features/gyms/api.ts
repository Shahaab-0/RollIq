import { apiClient } from '@/lib/apiClient';
import type {
  Gym,
  GymAttendee,
  GymClassEntry,
  GymClassVideo,
  GymMember,
  GymRole,
  GymScheduleEntry,
  NewGym,
  NewGymClassEntry,
  NewGymClassVideo,
  NewGymScheduleEntry,
} from './types';

export async function listGyms(): Promise<Gym[]> {
  return apiClient.get<Gym[]>('/gyms');
}

export async function createGym(gym: NewGym): Promise<Gym> {
  return apiClient.post<Gym>('/gyms', gym);
}

export async function getGym(gymId: string): Promise<Gym> {
  return apiClient.get<Gym>(`/gyms/${gymId}`);
}

export async function joinGym(inviteCode: string): Promise<Gym> {
  return apiClient.post<Gym>('/gyms/join', { invite_code: inviteCode });
}

export async function listMembers(gymId: string): Promise<GymMember[]> {
  return apiClient.get<GymMember[]>(`/gyms/${gymId}/members`);
}

export async function updateMemberRole(gymId: string, userId: string, role: GymRole): Promise<GymMember> {
  return apiClient.patch<GymMember>(`/gyms/${gymId}/members/${userId}`, { role });
}

export async function listClasses(gymId: string): Promise<GymClassEntry[]> {
  return apiClient.get<GymClassEntry[]>(`/gyms/${gymId}/classes`);
}

export async function createClass(gymId: string, entry: NewGymClassEntry): Promise<GymClassEntry> {
  return apiClient.post<GymClassEntry>(`/gyms/${gymId}/classes`, entry);
}

export async function deleteClass(gymId: string, classId: string): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/classes/${classId}`);
}

export async function listClassVideos(gymId: string, classId: string): Promise<GymClassVideo[]> {
  return apiClient.get<GymClassVideo[]>(`/gyms/${gymId}/classes/${classId}/videos`);
}

export async function createClassVideo(
  gymId: string,
  classId: string,
  video: NewGymClassVideo,
): Promise<GymClassVideo> {
  return apiClient.post<GymClassVideo>(`/gyms/${gymId}/classes/${classId}/videos`, video);
}

export async function deleteClassVideo(gymId: string, classId: string, videoId: string): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/classes/${classId}/videos/${videoId}`);
}

export async function listSchedule(gymId: string): Promise<GymScheduleEntry[]> {
  return apiClient.get<GymScheduleEntry[]>(`/gyms/${gymId}/schedule`);
}

export async function createScheduleEntry(gymId: string, entry: NewGymScheduleEntry): Promise<GymScheduleEntry> {
  return apiClient.post<GymScheduleEntry>(`/gyms/${gymId}/schedule`, entry);
}

export async function deleteScheduleEntry(gymId: string, entryId: string): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/schedule/${entryId}`);
}

export async function listAttendance(gymId: string, classId: string): Promise<GymAttendee[]> {
  return apiClient.get<GymAttendee[]>(`/gyms/${gymId}/classes/${classId}/attendance`);
}

export async function markAttendance(gymId: string, classId: string, userId: string): Promise<void> {
  await apiClient.put(`/gyms/${gymId}/classes/${classId}/attendance/${userId}`);
}

export async function unmarkAttendance(gymId: string, classId: string, userId: string): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/classes/${classId}/attendance/${userId}`);
}
