import { NotificationContentContext, NotificationItem } from './context/notificationsContext';
import {
  DEFAULT_NOTIFICATION_APP,
  LEGACY_NOTIFICATION_APP,
} from './constants';

export interface SplitNotifications {
  today: NotificationItem[];
  earlier: NotificationItem[];
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function sortByCreatedDesc(a: NotificationItem, b: NotificationItem): number {
  return new Date(b.created).getTime() - new Date(a.created).getTime();
}

export const splitNotificationsByTime = (
  notificationList: NotificationItem[],
): SplitNotifications => {
  const splittedData: SplitNotifications = { today: [], earlier: [] };
  if (notificationList.length === 0) {
    return splittedData;
  }

  const currentTime = Date.now();
  const twentyFourHoursAgo = currentTime - TWENTY_FOUR_HOURS_MS;

  notificationList.forEach((notification) => {
    if (!notification) {
      return;
    }
    const objectTime = new Date(notification.created).getTime();
    if (objectTime >= twentyFourHoursAgo && objectTime <= currentTime) {
      splittedData.today.push(notification);
    } else {
      splittedData.earlier.push(notification);
    }
  });
  splittedData.today.sort(sortByCreatedDesc);
  splittedData.earlier.sort(sortByCreatedDesc);
  return splittedData;
};

export function resolveDefaultAppName(
  appsId: string[],
  requestedApp: string | null,
): string {
  if (requestedApp && appsId.includes(requestedApp)) {
    return requestedApp;
  }
  if (appsId.includes(DEFAULT_NOTIFICATION_APP)) {
    return DEFAULT_NOTIFICATION_APP;
  }
  if (appsId.length > 0) {
    return appsId[0];
  }
  return LEGACY_NOTIFICATION_APP;
}

export function isCourseKey(value?: string | null): boolean {
  return !!value && /^course-v1:/i.test(value.trim());
}

export function extractCourseIdFromUrl(contentUrl?: string | null): string | null {
  if (!contentUrl) {
    return null;
  }
  const match = contentUrl.match(/\/courses\/(course-v1:[^/]+)\//i);
  return match?.[1] ?? null;
}

export function humanizeCourseKey(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^course-v1:([^+]+)\+([^+]+)\+([^/?]+)$/i);
  if (!match) {
    return trimmed;
  }

  const run = match[3];
  if (run && !/^\d/.test(run)) {
    return run.replace(/_/g, ' ');
  }

  return match[2].replace(/_/g, ' ');
}

export function getCourseTitle(
  contentContext?: NotificationContentContext,
  fallbackContent?: string,
  contentUrl?: string,
  resolvedTitles?: Record<string, string>,
): string {
  const candidates = [
    contentContext?.courseTitle,
    contentContext?.courseName,
    fallbackContent,
  ].filter((value): value is string => !!value);

  for (const candidate of candidates) {
    if (!isCourseKey(candidate)) {
      return candidate;
    }
    const courseId = extractCourseIdFromUrl(contentUrl) ?? candidate;
    if (resolvedTitles?.[courseId]) {
      return resolvedTitles[courseId];
    }
  }

  const courseId = extractCourseIdFromUrl(contentUrl) ?? candidates.find(isCourseKey);
  if (courseId && resolvedTitles?.[courseId]) {
    return resolvedTitles[courseId];
  }

  const fallbackKey = courseId ?? candidates.find(isCourseKey);
  if (fallbackKey) {
    return humanizeCourseKey(fallbackKey);
  }

  return candidates[0] ?? '';
}

export function formatDueDate(
  dueDate: string | undefined,
  locale: string,
): string | null {
  if (!dueDate) {
    return null;
  }
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export function isCourseAssignedNotification(type?: string): boolean {
  return type === 'course_assigned';
}

/**
 * Returns the URL when it uses an allowed protocol; otherwise null.
 * Prevents javascript: and other unsafe schemes in notification links.
 */
export function getSafeNotificationUrl(url: string | undefined | null): string | null {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}
