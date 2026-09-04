import { useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { camelCaseObject } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import {
  getCourseTitles,
  getNotificationCounts,
  getNotificationsList,
  markAllNotificationRead,
  markNotificationRead,
  markNotificationSeen,
} from './api';
import type { NotificationItem, Pagination, TabsCount } from '../context/notificationsContext';
import { extractCourseIdFromUrl, humanizeCourseKey, isCourseKey } from '../utils';

export interface NotificationAppData {
  tabsCount: TabsCount;
  appsId: string[];
  apps: Record<string, string[]>;
  showNotificationsTray: boolean;
  notificationExpiryDays: number;
  isNewNotificationViewEnabled: boolean;
}

interface CountsResponseCamel {
  count: number;
  countByAppName: Record<string, number>;
  showNotificationsTray: boolean;
  notificationExpiryDays?: number;
  isNewNotificationViewEnabled: boolean;
}

interface ListPageCamel {
  next: string | null;
  previous: string | null;
  count: number;
  numPages: number;
  currentPage: number;
  start: number;
  results: NotificationItem[];
}

export const QK = {
  all: ['notifications'] as const,
  appData: () => [...QK.all, 'appData'] as const,
  list: (appName: string) => [...QK.all, 'list', appName] as const,
  listRoot: () => [...QK.all, 'list'] as const,
  tours: () => [...QK.all, 'tours'] as const,
};

function normalizeAppData(input: CountsResponseCamel): NotificationAppData {
  const { countByAppName, count, ...rest } = input;
  const appsId = Object.keys(countByAppName);
  const apps = appsId.reduce<Record<string, string[]>>((acc, id) => {
    acc[id] = [];
    return acc;
  }, {});
  return {
    tabsCount: { count, ...countByAppName },
    appsId,
    apps,
    showNotificationsTray: rest.showNotificationsTray,
    notificationExpiryDays: rest.notificationExpiryDays ?? 0,
    isNewNotificationViewEnabled: rest.isNewNotificationViewEnabled,
  };
}

export function useAppNotifications() {
  const { authenticatedUser } = useContext(AppContext);
  const location = useLocation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QK.appData(),
    queryFn: async (): Promise<NotificationAppData> => {
      const data = await getNotificationCounts();
      return normalizeAppData(camelCaseObject(data) as CountsResponseCamel);
    },
    enabled: !!authenticatedUser,
  });

  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (authenticatedUser) {
      queryClient.invalidateQueries({ queryKey: QK.appData() });
    }
  }, [authenticatedUser, location.pathname, queryClient]);

  return {
    notificationAppData: query.data,
  };
}

export interface UseNotificationListResult {
  notifications: NotificationItem[];
  pagination: Pagination;
  hasMorePages: boolean;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  loadMore: () => void;
}

export function useNotificationList(appName: string): UseNotificationListResult {
  const query = useInfiniteQuery<ListPageCamel>({
    queryKey: QK.list(appName),
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;
      const data = await getNotificationsList(appName, page);
      return camelCaseObject(data) as ListPageCamel;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.next ? lastPage.currentPage + 1 : undefined),
    enabled: !!appName,
    placeholderData: keepPreviousData,
  });

  const notifications = useMemo<NotificationItem[]>(
    () => query.data?.pages.flatMap((p) => p.results) ?? [],
    [query.data],
  );

  const lastPage = query.data?.pages[query.data.pages.length - 1];
  const pagination: Pagination = {
    numPages: lastPage?.numPages,
    currentPage: lastPage?.currentPage,
    hasMorePages: !!query.hasNextPage,
  };

  return {
    notifications,
    pagination,
    hasMorePages: !!query.hasNextPage,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    loadMore: () => {
      query.fetchNextPage();
    },
  };
}

function collectCourseIdsForTitleResolution(notifications: NotificationItem[]): string[] {
  const courseIds = new Set<string>();

  notifications.forEach((notification) => {
    if (notification.notificationType !== 'course_assigned') {
      return;
    }

    const context = notification.contentContext;
    const candidates = [context?.courseTitle, context?.courseName].filter(Boolean) as string[];
    const needsResolution = candidates.some(isCourseKey) || !!extractCourseIdFromUrl(notification.contentUrl);

    if (!needsResolution) {
      return;
    }

    const courseIdFromUrl = extractCourseIdFromUrl(notification.contentUrl);
    if (courseIdFromUrl) {
      courseIds.add(courseIdFromUrl);
    }

    candidates.filter(isCourseKey).forEach((courseId) => {
      courseIds.add(courseId);
    });
  });

  return Array.from(courseIds);
}

interface CourseTitleResultCamel {
  courseId: string;
  courseTitle: string;
}

export function useCourseTitleMap(notifications: NotificationItem[]): Record<string, string> {
  const courseIds = useMemo(
    () => collectCourseIdsForTitleResolution(notifications),
    [notifications],
  );

  const query = useQuery({
    queryKey: [...QK.all, 'courseTitles', courseIds.join('|')],
    queryFn: async () => {
      const data = await getCourseTitles(courseIds);
      return camelCaseObject(data) as { results: CourseTitleResultCamel[] };
    },
    enabled: courseIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    const titleMap: Record<string, string> = {};
    courseIds.forEach((courseId) => {
      titleMap[courseId] = humanizeCourseKey(courseId);
    });
    query.data?.results?.forEach(({ courseId, courseTitle }) => {
      if (courseTitle && !isCourseKey(courseTitle)) {
        titleMap[courseId] = courseTitle;
      }
    });
    return titleMap;
  }, [courseIds, query.data]);
}

export function useMarkNotificationSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) => markNotificationSeen(appName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.appData() });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: ({ id }) => {
      const lastRead = new Date().toISOString();
      queryClient.setQueriesData<InfiniteData<ListPageCamel>>(
        { queryKey: QK.listRoot() },
        (old) => {
          if (!old) {
            return old;
          }
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((r) => (r.id === id ? { ...r, lastRead } : r)),
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: QK.appData() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) => markAllNotificationRead(appName),
    onSuccess: (_data, appName) => {
      const lastRead = new Date().toISOString();
      queryClient.setQueryData<InfiniteData<ListPageCamel>>(
        QK.list(appName),
        (old) => {
          if (!old) {
            return old;
          }
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((r) => ({ ...r, lastRead })),
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: QK.appData() });
    },
  });
}
