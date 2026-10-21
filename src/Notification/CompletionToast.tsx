import React, { useEffect, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Toast } from '@openedx/paragon';

import type { LatestCompleted } from './data/hook';
import messages from './messages';
import { getSafeNotificationUrl } from './utils';

const TOASTED_STORAGE_KEY = 'lw-notifications-toasted';
const MAX_REMEMBERED_TOASTS = 20;

function readToastedIds(): number[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TOASTED_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberToasted(id: number): void {
  try {
    const ids = [id, ...readToastedIds().filter((value) => value !== id)];
    window.localStorage.setItem(
      TOASTED_STORAGE_KEY,
      JSON.stringify(ids.slice(0, MAX_REMEMBERED_TOASTS)),
    );
  } catch {
    // Storage blocked (private mode): the toast may show again on the next page.
  }
}

/**
 * "Congratulations!" toast for a course completed in the last day. Shown once per notification
 * (remembered in localStorage, since the header remounts on every MFE navigation); the
 * notification itself stays unread in the Notification Centre.
 */
const CompletionToast: React.FC<{ latestCompleted?: LatestCompleted | null }> = ({
  latestCompleted,
}) => {
  const intl = useIntl();
  const [toast, setToast] = useState<LatestCompleted | null>(null);

  useEffect(() => {
    if (!latestCompleted || readToastedIds().includes(latestCompleted.id)) {
      return;
    }
    rememberToasted(latestCompleted.id);
    setToast(latestCompleted);
  }, [latestCompleted]);

  if (!toast) {
    return null;
  }

  const href = getSafeNotificationUrl(toast.contentUrl);
  return (
    <Toast
      show
      onClose={() => setToast(null)}
      closeLabel={intl.formatMessage(messages.notificationToastClose)}
      action={href ? { label: intl.formatMessage(messages.notificationToastView), href } : undefined}
      delay={8000}
      data-testid="notification-completed-toast"
    >
      {intl.formatMessage(messages.notificationCompletedBody, { courseTitle: toast.courseTitle })}
    </Toast>
  );
};

export default CompletionToast;
