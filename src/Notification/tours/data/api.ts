import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Tour } from '../../context/notificationsContext';

export const getDiscussionTourUrl = (): string => `${getConfig().LMS_BASE_URL}/api/user_tours/discussion_tours/`;

export async function getNotificationsTours(): Promise<Tour[]> {
  const { data } = await getAuthenticatedHttpClient().get(getDiscussionTourUrl());
  return data;
}

export async function updateNotificationsTour(tourId: number): Promise<Tour> {
  const { data } = await getAuthenticatedHttpClient().put(
    `${getDiscussionTourUrl()}${tourId}`,
    { show_tour: false },
  );
  return data;
}
