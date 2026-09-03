/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Provider } from 'react-redux';
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from '@env';
import { store } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import ToastHost from './src/components/ToastHost';
import { showToast } from './src/lib/toast';
import type { MutationMeta } from './src/types/reactQuery';

// Sentry.init with an empty dsn is a documented no-op -- same "blank means
// disabled, no separate conditional needed" shape as the backend's
// sentry.dsn: ${SENTRY_DSN:} in application-prod.yml.
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.2 });
}

// Success toasts stay automatic/global -- a call site sets meta.toastSuccess
// to customize the message, or omits it for low-stakes actions where the UI
// itself is feedback enough. Error toasts are the opposite: each mutation
// hook shows its own via an explicit onError (see e.g. useSessions.ts) so
// the failure message lives right next to the mutation it describes, not
// hidden in this global config.
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const meta = mutation.meta as MutationMeta | undefined;
      if (meta?.toastSuccess) showToast(meta.toastSuccess, 'success');
    },
  }),
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <RootNavigator />
          <ToastHost />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default Sentry.wrap(App);
