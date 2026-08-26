export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080/api/v1';

export interface AuthResponseDto {
  user: { id: string; email: string };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}
