import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';

import Notifications from './Notification';
import { useAppNotifications } from './Notification/data/hook';
import { NotificationHeadingIcon } from './Notification/icons';
import messages from './Notification/messages';

interface NotificationsTrayProps {
  margins?: string,
  onDrawerMountedChange?: (mounted: boolean) => void,
  onDrawerOpenChange?: (open: boolean) => void,
}

// Bell shown while the tray is unavailable (loading, or the notifications API
// is not deployed yet). Same markup/classes as the live bell so the header
// layout does not shift, but clicking it does nothing.
const StaticBell: React.FC<{ margins?: string }> = ({ margins }) => {
  const intl = useIntl();
  return (
    <div className={`lw-notification-btn-wrapper${margins ? ` ${margins}` : ''}`}>
      <button
        type="button"
        className="lw-notification-btn"
        aria-label={intl.formatMessage(messages.notificationBellIconAltMessage)}
        aria-disabled="true"
        data-testid="notification-bell-icon-static"
      >
        <NotificationHeadingIcon />
      </button>
    </div>
  );
};

export const NotificationsTrayInner: React.FC<NotificationsTrayProps> = (props) => {
  const { notificationAppData } = useAppNotifications();
  if (!notificationAppData?.showNotificationsTray) {
    return <StaticBell margins={props.margins} />;
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
