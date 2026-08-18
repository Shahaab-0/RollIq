import { apiClient } from './client';
import type {
  Instructional,
  InstructionalProgress,
  InstructionalVideo,
  NewInstructional,
  NewInstructionalVideo,
  ProgressStatus,
} from '../features/instructionals/types';

export async function listInstructionals(): Promise<Instructional[]> {
  const { data } = await apiClient.get<Instructional[]>('/instructionals');
  return data;
}

export async function createInstructional(
  instructional: NewInstructional,
): Promise<Instructional> {
  const { data } = await apiClient.post<Instructional>('/instructionals', instructional);
  return data;
}

export async function listVideos(instructionalId: string): Promise<InstructionalVideo[]> {
  const { data } = await apiClient.get<InstructionalVideo[]>(
    `/instructionals/${instructionalId}/videos`,
  );
  return data;
}

export async function createVideo(
  instructionalId: string,
  video: NewInstructionalVideo,
): Promise<InstructionalVideo> {
  const { data } = await apiClient.post<InstructionalVideo>(
    `/instructionals/${instructionalId}/videos`,
    video,
  );
  return data;
}

export async function listProgress(): Promise<InstructionalProgress[]> {
  const { data } = await apiClient.get<InstructionalProgress[]>('/instructional-progress');
  return data;
}

export async function upsertProgress(
  videoId: string,
  update: { status: ProgressStatus; notes?: string | null },
): Promise<InstructionalProgress> {
  const { data } = await apiClient.put<InstructionalProgress>(
    `/instructional-progress/${videoId}`,
    update,
  );
  return data;
}

export async function deleteProgress(videoId: string): Promise<void> {
  await apiClient.delete(`/instructional-progress/${videoId}`);
}
