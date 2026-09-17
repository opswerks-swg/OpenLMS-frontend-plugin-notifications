import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Notifications from './Notification';
import { useAppNotifications } from './Notification/data/hook';

interface NotificationsTrayProps {
  margins?: string,
  onDrawerMountedChange?: (mounted: boolean) => void,
  onDrawerOpenChange?: (open: boolean) => void,
}

const NotificationsTrayInner: React.FC<NotificationsTrayProps> = (props) => {
  const { notificationAppData } = useAppNotifications();
  if (!notificationAppData?.showNotificationsTray) {
    return null;
  }
  return (
    <Notifications notificationAppData={notificationAppData} {...props} />
  );
};

/**
 * Header-slot entry for OpenLMS MFEs (@edx/frontend-platform hosts).
 * Owns a QueryClient so learning/profile (no host provider) still work.
 */
const NotificationsTray: React.FC<NotificationsTrayProps> = (props) => {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 30_000,
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsTrayInner {...props} />
    </QueryClientProvider>
  );
};

export default NotificationsTray;
