import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export interface NotificationCountsResponse {
  count: number;
  count_by_app_name: Record<string, number>;
  show_notifications_tray: boolean;
  notification_expiry_days?: number;
  is_new_notification_view_enabled: boolean;
}

export interface NotificationRaw {
  id: number;
  notification_type?: string;
  content_url: string;
  content: string;
  content_context?: {
    course_name?: string;
    course_title?: string;
    course_url?: string;
    due_date?: string;
    assigned_by?: string;
  };
  created: string;
  last_read?: string | null;
  last_seen?: string | null;
}

export interface NotificationsListResponse {
  next: string | null;
  previous: string | null;
  count: number;
  num_pages: number;
  current_page: number;
  start: number;
  results: NotificationRaw[];
}

export interface MarkNotificationResponse {
  message?: string;
}

export interface CourseTitleResult {
  course_id: string;
  course_title: string;
}

export interface CourseTitlesResponse {
  results: CourseTitleResult[];
  invalid_course_ids?: string[];
}

export const getUnreadNotificationsCountApiUrl = (): string => `${getConfig().LMS_BASE_URL}/api/openlms/notifications/unread-count/`;
/** @deprecated Use getUnreadNotificationsCountApiUrl — edx count API tracks unseen (last_seen), not unread. */
export const getNotificationsCountApiUrl = getUnreadNotificationsCountApiUrl;
export const getNotificationsListApiUrl = (): string => `${getConfig().LMS_BASE_URL}/api/notifications/`;
export const getCourseTitlesApiUrl = (): string => `${getConfig().LMS_BASE_URL}/api/course_assignments/v1/course-titles/`;
export const markNotificationsSeenApiUrl = (appName: string): string => `${getConfig().LMS_BASE_URL}/api/notifications/mark-seen/${appName}/`;
export const markNotificationAsReadApiUrl = (): string => `${getConfig().LMS_BASE_URL}/api/notifications/read/`;

export async function getNotificationsList(
  appName: string,
  page: number,
  pageSize = 10,
  trayOpened = true,
): Promise<NotificationsListResponse> {
  const params = snakeCaseObject({
    appName, page, pageSize, trayOpened,
  });
  const { data } = await getAuthenticatedHttpClient().get(getNotificationsListApiUrl(), { params });
  return data;
}

export async function getNotificationCounts(): Promise<NotificationCountsResponse> {
  const { data } = await getAuthenticatedHttpClient().get(getNotificationsCountApiUrl());
  return data;
}

export async function getCourseTitles(courseIds: string[]): Promise<CourseTitlesResponse> {
  const params = new URLSearchParams();
  courseIds.forEach((courseId) => {
    params.append('course_id', courseId);
  });
  const { data } = await getAuthenticatedHttpClient().get(getCourseTitlesApiUrl(), { params });
  return data;
}

export async function markNotificationSeen(appName: string): Promise<MarkNotificationResponse> {
  const { data } = await getAuthenticatedHttpClient().put(`${markNotificationsSeenApiUrl(appName)}`);
  return data;
}

export async function markAllNotificationRead(appName: string): Promise<MarkNotificationResponse> {
  const params = snakeCaseObject({ appName });
  const { data } = await getAuthenticatedHttpClient().patch(markNotificationAsReadApiUrl(), params);
  return data;
}

export async function markNotificationRead(
  notificationId: number,
): Promise<{ data: MarkNotificationResponse; id: number }> {
  const params = snakeCaseObject({ notificationId });
  const { data } = await getAuthenticatedHttpClient().patch(markNotificationAsReadApiUrl(), params);
  return { data, id: notificationId };
}
