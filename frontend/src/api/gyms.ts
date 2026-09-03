import { apiClient } from './client';
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
} from '../features/gyms/types';

export async function listGyms(): Promise<Gym[]> {
  const { data } = await apiClient.get<Gym[]>('/gyms');
  return data;
}

export async function createGym(gym: NewGym): Promise<Gym> {
  const { data } = await apiClient.post<Gym>('/gyms', gym);
  return data;
}

export async function getGym(gymId: string): Promise<Gym> {
  const { data } = await apiClient.get<Gym>(`/gyms/${gymId}`);
  return data;
}

export async function joinGym(inviteCode: string): Promise<Gym> {
  const { data } = await apiClient.post<Gym>('/gyms/join', {
    invite_code: inviteCode,
  });
  return data;
}

export async function listMembers(gymId: string): Promise<GymMember[]> {
  const { data } = await apiClient.get<GymMember[]>(`/gyms/${gymId}/members`);
  return data;
}

export async function updateMemberRole(
  gymId: string,
  userId: string,
  role: GymRole,
): Promise<GymMember> {
  const { data } = await apiClient.patch<GymMember>(
    `/gyms/${gymId}/members/${userId}`,
    { role },
  );
  return data;
}

export async function listClasses(gymId: string): Promise<GymClassEntry[]> {
  const { data } = await apiClient.get<GymClassEntry[]>(
    `/gyms/${gymId}/classes`,
  );
  return data;
}

export async function createClass(
  gymId: string,
  entry: NewGymClassEntry,
): Promise<GymClassEntry> {
  const { data } = await apiClient.post<GymClassEntry>(
    `/gyms/${gymId}/classes`,
    entry,
  );
  return data;
}

export async function deleteClass(
  gymId: string,
  classId: string,
): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/classes/${classId}`);
}

export async function listClassVideos(
  gymId: string,
  classId: string,
): Promise<GymClassVideo[]> {
  const { data } = await apiClient.get<GymClassVideo[]>(
    `/gyms/${gymId}/classes/${classId}/videos`,
  );
  return data;
}

export async function createClassVideo(
  gymId: string,
  classId: string,
  video: NewGymClassVideo,
): Promise<GymClassVideo> {
  const { data } = await apiClient.post<GymClassVideo>(
    `/gyms/${gymId}/classes/${classId}/videos`,
    video,
  );
  return data;
}

export async function deleteClassVideo(
  gymId: string,
  classId: string,
  videoId: string,
): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/classes/${classId}/videos/${videoId}`);
}

export async function listSchedule(gymId: string): Promise<GymScheduleEntry[]> {
  const { data } = await apiClient.get<GymScheduleEntry[]>(
    `/gyms/${gymId}/schedule`,
  );
  return data;
}

export async function createScheduleEntry(
  gymId: string,
  entry: NewGymScheduleEntry,
): Promise<GymScheduleEntry> {
  const { data } = await apiClient.post<GymScheduleEntry>(
    `/gyms/${gymId}/schedule`,
    entry,
  );
  return data;
}

export async function deleteScheduleEntry(
  gymId: string,
  entryId: string,
): Promise<void> {
  await apiClient.delete(`/gyms/${gymId}/schedule/${entryId}`);
}

export async function listAttendance(
  gymId: string,
  classId: string,
): Promise<GymAttendee[]> {
  const { data } = await apiClient.get<GymAttendee[]>(
    `/gyms/${gymId}/classes/${classId}/attendance`,
  );
  return data;
}

export async function markAttendance(
  gymId: string,
  classId: string,
  userId: string,
): Promise<void> {
  await apiClient.put(`/gyms/${gymId}/classes/${classId}/attendance/${userId}`);
}

export async function unmarkAttendance(
  gymId: string,
  classId: string,
  userId: string,
): Promise<void> {
  await apiClient.delete(
    `/gyms/${gymId}/classes/${classId}/attendance/${userId}`,
  );
}
