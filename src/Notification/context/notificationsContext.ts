import React from 'react';

import { DEFAULT_NOTIFICATION_APP } from '../constants';

export interface Pagination {
  numPages?: number,
  currentPage?: number,
  hasMorePages?: boolean,
}

export interface TabsCount {
  count: number,
  [appId: string]: number,
}

export interface NotificationContentContext {
  courseName?: string,
  courseTitle?: string,
  courseUrl?: string,
  dueDate?: string,
  assignedBy?: string,
}

export interface NotificationItem {
  id: number,
  notificationType?: string,
  contentUrl: string,
  content: string,
  contentContext?: NotificationContentContext,
  created: string,
  lastRead?: string | null,
  lastSeen?: string | null,
  [key: string]: unknown,
}

export interface Tour {
  id: number,
  tourName: string,
  enabled?: boolean,
  showTour?: boolean,
}

export interface NotificationContextValue {
  appName: string,
  handleActiveTab: (selectedAppName: string) => void,
}

export const initialState: NotificationContextValue = {
  appName: DEFAULT_NOTIFICATION_APP,
  handleActiveTab: () => {},
};

export const notificationsContext = React.createContext<NotificationContextValue>(initialState);
