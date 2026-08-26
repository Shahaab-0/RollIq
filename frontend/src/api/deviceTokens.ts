import { apiClient } from './client';

export type DevicePlatform = 'ios' | 'android';

export async function registerDeviceToken(
  token: string,
  platform: DevicePlatform,
): Promise<void> {
  await apiClient.post('/device-tokens', { token, platform });
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  await apiClient.delete(`/device-tokens/${token}`);
}
