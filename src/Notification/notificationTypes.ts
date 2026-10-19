import React from 'react';

import messages from './messages';
import {
  CompletedIcon,
  DueReminderIcon,
  NewCourseAssignedIcon,
  OverdueIcon,
} from './icons';

/**
 * Notification types rendered as a structured card (accent bar, icon, title, body, meta lines).
 * Any other type falls back to the legacy card that renders the server's HTML `content`.
 * Keep in sync with the theme mirror (theme/.../static/js/notifications.js TYPE_CONFIG).
 */
export type StructuredVariant = 'assigned' | 'reminder' | 'overdue' | 'completed';

export interface StructuredTypeConfig {
  variant: StructuredVariant,
  Icon: React.FC,
  title: { id: string, defaultMessage: string, description?: string },
}

export const STRUCTURED_NOTIFICATION_TYPES: Record<string, StructuredTypeConfig> = {
  course_assigned: {
    variant: 'assigned',
    Icon: NewCourseAssignedIcon,
    title: messages.notificationAssignedTitle,
  },
  course_due_reminder: {
    variant: 'reminder',
    Icon: DueReminderIcon,
    title: messages.notificationDueReminderTitle,
  },
  course_overdue: {
    variant: 'overdue',
    Icon: OverdueIcon,
    title: messages.notificationOverdueTitle,
  },
  course_completed: {
    variant: 'completed',
    Icon: CompletedIcon,
    title: messages.notificationCompletedTitle,
  },
};

export function getStructuredType(type?: string): StructuredTypeConfig | null {
  return (type && STRUCTURED_NOTIFICATION_TYPES[type]) || null;
}

export function isStructuredNotification(type?: string): boolean {
  return getStructuredType(type) !== null;
}
