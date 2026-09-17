import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notificationTitle: {
    id: 'notification.title',
    defaultMessage: 'Notifications',
    description: 'Notifications',
  },
  notificationTodayHeading: {
    id: 'notification.today.heading',
    defaultMessage: 'Last 24 hours',
    description: 'Today Notifications',
  },
  notificationEarlierHeading: {
    id: 'notification.earlier.heading',
    defaultMessage: 'Earlier',
    description: 'Earlier Notifications',
  },
  notificationMarkAsRead: {
    id: 'notification.mark.as.read',
    defaultMessage: 'Mark all as read',
    description: 'Mark all Notifications as read',
  },
  fullStop: {
    id: 'notification.fullStop',
    defaultMessage: '•',
    description: 'Fullstop shown to users to indicate who edited a post.',
  },
  loadMoreNotifications: {
    id: 'notification.load.more.notifications',
    defaultMessage: 'Load more notifications',
    description: 'Load more button to load more notifications',
  },
  loadingNotifications: {
    id: 'notification.loading.message',
    defaultMessage: 'Loading…',
    description: 'Loading state while notifications are fetched',
  },
  allRecentNotificationsMessage: {
    id: 'notification.recent.all.message',
    defaultMessage: 'That’s all of your recent notifications!',
    description: 'Message visible when all notifications are loaded',
  },
  expiredNotificationsDeleteMessage: {
    id: 'notification.expired.delete.message',
    defaultMessage: 'Notifications are automatically cleared after {days} days',
    description: 'Message showing that expired notifications will be deleted',
  },
  noNotificationsYetMessage: {
    id: 'notification.no.message',
    defaultMessage: 'No notifications yet',
    description: 'Message visible when there is no notification in the notification tray',
  },
  noNotificationHelpMessage: {
    id: 'notification.no.help.message',
    defaultMessage: 'When you receive notifications they’ll show up here',
    description: 'Message showing that when you receive notifications they’ll show up here',
  },
  notificationBellIconAltMessage: {
    id: 'notification.bell.icon.alt.message',
    defaultMessage: 'Notification bell icon',
    description: 'Alt message for notification bell icon',
  },
  notificationCloseButtonAltMessage: {
    id: 'notification.close.button.alt.message',
    defaultMessage: 'Close notifications',
    description: 'Alt message for drawer close button',
  },
  notificationAssignedTitle: {
    id: 'notification.assigned.title',
    defaultMessage: 'New Course Assigned',
    description: 'Heading for course assigned notification cards',
  },
  notificationAssignedBody: {
    id: 'notification.assigned.body',
    defaultMessage: '{courseTitle} has been assigned to you',
    description: 'Body text for course assigned notification cards',
  },
  notificationDueDateLabel: {
    id: 'notification.due.date.label',
    defaultMessage: 'Due: {dueDate}',
    description: 'Due date label for course assigned notifications',
  },
  notificationAssignedByLabel: {
    id: 'notification.assigned.by.label',
    defaultMessage: 'Assigned by: {assignedBy}',
    description: 'Assigned by label for course assigned notifications',
  },
  notificationUnreadLabel: {
    id: 'notification.unread.label',
    defaultMessage: 'Unread notification',
    description: 'Screen reader label for unread notification indicator',
  },
});

export default messages;
