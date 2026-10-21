import React, { useCallback } from 'react';

import classNames from 'classnames';
import * as timeago from 'timeago.js';
import DOMPurify from 'dompurify';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import timeLocale from '../common/time-locale';
import {
  formatDueDate,
  getCourseTitle,
  getSafeNotificationUrl,
} from './utils';
import { useMarkNotificationRead } from './data/hook';
import { NotificationContentContext } from './context/notificationsContext';
import { getStructuredType, StructuredVariant } from './notificationTypes';

timeago.register('time-locale', timeLocale);

type FormatMessage = ReturnType<typeof useIntl>['formatMessage'];

function structuredBody(
  variant: StructuredVariant,
  courseTitle: string,
  context: NotificationContentContext | undefined,
  formatMessage: FormatMessage,
): string {
  switch (variant) {
    case 'reminder':
      return formatMessage(messages.notificationDueReminderBody, {
        courseTitle,
        days: Math.max(context?.daysUntilDue ?? 1, 0),
      });
    case 'overdue':
      return formatMessage(messages.notificationOverdueBody, { courseTitle });
    case 'completed':
      return formatMessage(messages.notificationCompletedBody, { courseTitle });
    default:
      return formatMessage(messages.notificationAssignedBody, { courseTitle });
  }
}

interface NotificationRowItemProps {
  id: number,
  type?: string,
  contentUrl: string,
  content: string,
  contentContext?: NotificationContentContext,
  courseName: string,
  courseTitleMap?: Record<string, string>,
  createdAt: string,
  lastRead?: string | null,
}

interface NotificationCardLinkProps {
  id: number,
  href: string,
  className: string,
  onClick: (event: React.MouseEvent) => void,
  children: React.ReactNode,
}

const NotificationCardLink: React.FC<NotificationCardLinkProps> = ({
  id, href, className, onClick, children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    onClick={onClick}
    data-testid={`notification-${id}`}
  >
    {children}
  </a>
);

const NotificationRowItem: React.FC<NotificationRowItemProps> = ({
  id,
  type = '',
  contentUrl,
  content,
  contentContext,
  courseName,
  courseTitleMap,
  createdAt,
  lastRead = '',
}) => {
  const intl = useIntl();
  const { mutateAsync: markAsRead } = useMarkNotificationRead();
  const isUnread = !lastRead;
  const relativeTime = timeago.format(createdAt, 'time-locale');
  const safeContentUrl = getSafeNotificationUrl(contentUrl) ?? '#';
  const structured = getStructuredType(type);

  const handleNotificationClick = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    const safeUrl = getSafeNotificationUrl(contentUrl);
    if (!safeUrl) {
      return;
    }
    if (!lastRead) {
      await markAsRead(id);
    }
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  }, [contentUrl, id, lastRead, markAsRead]);

  const cardClassName = classNames('lw-notification-card', {
    'lw-notification-card--structured': structured,
    [`lw-notification-card--${structured?.variant}`]: structured,
    'lw-notification-card--unread': isUnread,
  });

  const cardLinkProps = {
    id,
    href: safeContentUrl,
    className: cardClassName,
    onClick: handleNotificationClick,
  };

  if (structured) {
    const { variant, Icon, title } = structured;
    const courseTitle = getCourseTitle(contentContext, courseName, contentUrl, courseTitleMap);
    const dueDateLabel = formatDueDate(contentContext?.dueDate, intl.locale);
    // The design shows the course provider as the assigning authority; older rows fall back
    // to the admin who assigned the course.
    const assignedBy = variant === 'assigned'
      ? contentContext?.provider || contentContext?.assignedBy
      : undefined;
    const badgeName = variant === 'completed' ? contentContext?.badgeName : undefined;
    const hasCertificate = variant === 'completed' && !!contentContext?.hasCertificate;

    return (
      <NotificationCardLink {...cardLinkProps}>
        <span className="lw-notification-card__accent" aria-hidden="true" />
        <div className="lw-notification-card__content">
          <div className="lw-notification-card__header">
            {isUnread && (
              <span
                className="lw-notification-card__unread-dot"
                data-testid={`unread-notification-${id}`}
                role="img"
                aria-label={intl.formatMessage(messages.notificationUnreadLabel)}
              />
            )}
            <Icon />
            <span className="lw-notification-card__heading" data-testid={`notification-${variant}-title-${id}`}>
              {intl.formatMessage(title)}
            </span>
          </div>
          <p className="lw-notification-card__message" data-testid={`notification-course-${id}`}>
            {structuredBody(variant, courseTitle, contentContext, intl.formatMessage)}
          </p>
          {dueDateLabel && (
            <span data-testid={`notification-due-date-${id}`}>
              {intl.formatMessage(messages.notificationDueDateLabel, { dueDate: dueDateLabel })}
            </span>
          )}
          {assignedBy && (
            <span data-testid={`notification-assigned-by-${id}`}>
              {intl.formatMessage(messages.notificationAssignedByLabel, { assignedBy })}
            </span>
          )}
          {badgeName && (
            <span className="lw-notification-card__award" data-testid={`notification-badge-${id}`}>
              {intl.formatMessage(messages.notificationBadgeEarned, { badgeName })}
            </span>
          )}
          {hasCertificate && (
            <span className="lw-notification-card__award" data-testid={`notification-certificate-${id}`}>
              {intl.formatMessage(messages.notificationCertificateAvailable)}
            </span>
          )}
          <span
            className="lw-notification-card__timestamp"
            data-testid={`notification-created-date-${id}`}
          >
            {relativeTime}
          </span>
        </div>
      </NotificationCardLink>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <NotificationCardLink {...cardLinkProps}>
      <div
        className="lw-notification-card__legacy-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        data-testid={`notification-content-${id}`}
      />
      <div className="lw-notification-card__legacy-footer">
        {courseName && (
          <span data-testid={`notification-course-${id}`}>{courseName}</span>
        )}
        {courseName && (
          <span className="px-1">{intl.formatMessage(messages.fullStop)}</span>
        )}
        <span data-testid={`notification-created-date-${id}`}>{relativeTime}</span>
        {isUnread && (
          <span
            className="lw-notification-card__unread-dot ms-2 d-inline-block"
            data-testid={`unread-notification-${id}`}
            aria-label={intl.formatMessage(messages.notificationUnreadLabel)}
          />
        )}
      </div>
    </NotificationCardLink>
  );
};

export default React.memo(NotificationRowItem);
