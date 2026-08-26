import { Platform, PermissionsAndroid } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { registerDeviceToken, unregisterDeviceToken } from '../api/deviceTokens';
import { showToast } from './toast';

// Firebase only initializes successfully once GoogleService-Info.plist /
// google-services.json (from the Firebase Console) are in place -- see
// backend/docs/push-notifications-setup.md. Until then, every call in this
// module throws natively; every entry point below swallows that so the app
// keeps working without push notifications rather than crashing on launch.

let unsubscribeTokenRefresh: (() => void) | null = null;
let unsubscribeForegroundMessage: (() => void) | null = null;

async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function registerForPushNotifications(): Promise<void> {
  try {
    const messaging = getMessaging();

    if (Platform.OS === 'ios') {
      const status = await requestPermission(messaging);
      const allowed =
        status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
      if (!allowed) return;
    } else {
      const granted = await ensureAndroidPermission();
      if (!granted) return;
    }

    const token = await getToken(messaging);
    await registerDeviceToken(token, Platform.OS === 'ios' ? 'ios' : 'android');

    unsubscribeTokenRefresh?.();
    unsubscribeTokenRefresh = onTokenRefresh(messaging, refreshedToken => {
      registerDeviceToken(refreshedToken, Platform.OS === 'ios' ? 'ios' : 'android').catch(
        () => {},
      );
    });

    unsubscribeForegroundMessage?.();
    unsubscribeForegroundMessage = onMessage(messaging, remoteMessage => {
      const title = remoteMessage.notification?.title;
      const body = remoteMessage.notification?.body;
      if (title || body) {
        showToast([title, body].filter(Boolean).join(' — '), 'success');
      }
    });
  } catch {
    // Firebase not configured yet, or permission/token retrieval failed --
    // push notifications are an enhancement, not a hard requirement.
  }
}

export async function unregisterForPushNotifications(): Promise<void> {
  try {
    unsubscribeTokenRefresh?.();
    unsubscribeTokenRefresh = null;
    unsubscribeForegroundMessage?.();
    unsubscribeForegroundMessage = null;

    const messaging = getMessaging();
    const token = await getToken(messaging);
    await unregisterDeviceToken(token);
  } catch {
    // Best-effort -- signing out should never fail because token cleanup did.
  }
}
