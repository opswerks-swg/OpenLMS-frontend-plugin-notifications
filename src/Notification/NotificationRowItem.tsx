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
  isCourseAssignedNotification,
} from './utils';
import { useMarkNotificationRead } from './data/hook';
import { NotificationContentContext } from './context/notificationsContext';
import { NewCourseAssignedIcon } from './icons';

timeago.register('time-locale', timeLocale);

interface NotificationRowItemProps {
  id: number;
  type?: string;
  contentUrl: string;
  content: string;
  contentContext?: NotificationContentContext;
  courseName: string;
  courseTitleMap?: Record<string, string>;
  createdAt: string;
  lastRead?: string | null;
}

interface NotificationCardLinkProps {
  id: number;
  href: string;
  className: string;
  onClick: (event: React.MouseEvent) => void;
  children: React.ReactNode;
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
  const isAssigned = isCourseAssignedNotification(type);

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
    'lw-notification-card--assigned': isAssigned,
    'lw-notification-card--unread': isUnread && !isAssigned,
  });

  const cardLinkProps = {
    id,
    href: safeContentUrl,
    className: cardClassName,
    onClick: handleNotificationClick,
  };

  if (isAssigned) {
    const courseTitle = getCourseTitle(contentContext, courseName, contentUrl, courseTitleMap);
    const dueDateLabel = formatDueDate(contentContext?.dueDate, intl.locale);
    const assignedBy = contentContext?.assignedBy;

    return (
      <NotificationCardLink {...cardLinkProps}>
        <span className="lw-notification-card__accent" aria-hidden="true" />
        <div className="lw-notification-card__content">
          <div className="lw-notification-card__header">
            <NewCourseAssignedIcon />
            <span className="lw-notification-card__heading" data-testid={`notification-assigned-title-${id}`}>
              {intl.formatMessage(messages.notificationAssignedTitle)}
            </span>
          </div>
          <p className="lw-notification-card__message" data-testid={`notification-course-${id}`}>
            {intl.formatMessage(messages.notificationAssignedBody, { courseTitle })}
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
