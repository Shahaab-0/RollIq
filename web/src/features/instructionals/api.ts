import { apiClient } from '@/lib/apiClient';
import type {
  Instructional,
  InstructionalProgress,
  InstructionalVideo,
  NewInstructional,
  NewInstructionalVideo,
  ProgressStatus,
} from './types';

export async function listInstructionals(): Promise<Instructional[]> {
  return apiClient.get<Instructional[]>('/instructionals');
}

export async function createInstructional(instructional: NewInstructional): Promise<Instructional> {
  return apiClient.post<Instructional>('/instructionals', instructional);
}

export async function listVideos(instructionalId: string): Promise<InstructionalVideo[]> {
  return apiClient.get<InstructionalVideo[]>(`/instructionals/${instructionalId}/videos`);
}

export async function createVideo(instructionalId: string, video: NewInstructionalVideo): Promise<InstructionalVideo> {
  return apiClient.post<InstructionalVideo>(`/instructionals/${instructionalId}/videos`, video);
}

export async function listProgress(): Promise<InstructionalProgress[]> {
  return apiClient.get<InstructionalProgress[]>('/instructional-progress');
}

export async function upsertProgress(
  videoId: string,
  update: { status: ProgressStatus; notes?: string | null },
): Promise<InstructionalProgress> {
  return apiClient.put<InstructionalProgress>(`/instructional-progress/${videoId}`, update);
}

export async function deleteProgress(videoId: string): Promise<void> {
  await apiClient.delete(`/instructional-progress/${videoId}`);
}
