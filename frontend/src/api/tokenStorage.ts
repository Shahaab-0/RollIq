import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'rolliq.accessToken';
const REFRESH_TOKEN_KEY = 'rolliq.refreshToken';
const EXPIRES_AT_KEY = 'rolliq.expiresAt';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await AsyncStorage.setMany({
    [ACCESS_TOKEN_KEY]: tokens.accessToken,
    [REFRESH_TOKEN_KEY]: tokens.refreshToken,
    [EXPIRES_AT_KEY]: tokens.expiresAt,
  });
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function getStoredTokens(): Promise<StoredTokens | null> {
  const entries = await AsyncStorage.getMany([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    EXPIRES_AT_KEY,
  ]);
  const accessToken = entries[ACCESS_TOKEN_KEY];
  const refreshToken = entries[REFRESH_TOKEN_KEY];
  const expiresAt = entries[EXPIRES_AT_KEY];
  if (!accessToken || !refreshToken || !expiresAt) return null;
  return { accessToken, refreshToken, expiresAt };
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeMany([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    EXPIRES_AT_KEY,
  ]);
}
