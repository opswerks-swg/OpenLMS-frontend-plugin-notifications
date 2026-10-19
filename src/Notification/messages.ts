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
  notificationBellUnreadAltMessage: {
    id: 'notification.bell.icon.unread.alt.message',
    defaultMessage: 'Notifications, {count} unread',
    description: 'Alt message for the notification bell when it shows an unread count badge',
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
  notificationDueReminderTitle: {
    id: 'notification.due.reminder.title',
    defaultMessage: 'Due Date Reminder',
    description: 'Heading for due-date reminder notification cards',
  },
  notificationDueReminderBody: {
    id: 'notification.due.reminder.body',
    defaultMessage: '{courseTitle} is due {days, plural, =0 {today} one {tomorrow} other {in # days}}',
    description: 'Body text for due-date reminder cards; days is the number of days left',
  },
  notificationOverdueTitle: {
    id: 'notification.overdue.title',
    defaultMessage: 'Course Overdue',
    description: 'Heading for overdue course notification cards',
  },
  notificationOverdueBody: {
    id: 'notification.overdue.body',
    defaultMessage: '{courseTitle} is now overdue',
    description: 'Body text for overdue course notification cards',
  },
  notificationCompletedTitle: {
    id: 'notification.completed.title',
    defaultMessage: 'Course Completed',
    description: 'Heading for course completed notification cards',
  },
  notificationCompletedBody: {
    id: 'notification.completed.body',
    defaultMessage: 'Congratulations! You have completed {courseTitle}',
    description: 'Body text for course completed notification cards and the completion toast',
  },
  notificationBadgeEarned: {
    id: 'notification.completed.badge',
    defaultMessage: 'You earned the {badgeName} badge. View it on your profile.',
    description: 'Shown on a course completed card when the course awarded a badge',
  },
  notificationCertificateAvailable: {
    id: 'notification.completed.certificate',
    defaultMessage: 'Your certificate is available on your profile.',
    description: 'Shown on a course completed card when the course awards a certificate',
  },
  notificationToastView: {
    id: 'notification.completed.toast.view',
    defaultMessage: 'View',
    description: 'Action label on the course completed toast',
  },
  notificationToastClose: {
    id: 'notification.completed.toast.close',
    defaultMessage: 'Dismiss',
    description: 'Close button label on the course completed toast',
  },
});

export default messages;
