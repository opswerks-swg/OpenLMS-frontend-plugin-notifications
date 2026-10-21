import React, { useContext } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import NotificationEmptySection from './NotificationEmptySection';
import NotificationRowItem from './NotificationRowItem';
import messages from './messages';
import { notificationsContext } from './context/notificationsContext';
import { useCourseTitleMap, useNotificationList } from './data/hook';

const NotificationSections: React.FC = () => {
  const intl = useIntl();
  const { appName } = useContext(notificationsContext);

  const {
    notifications: notificationList,
    hasMorePages,
    isPending,
    isFetching,
    isFetchingNextPage,
    loadMore,
  } = useNotificationList(appName);
  const courseTitleMap = useCourseTitleMap(notificationList);

  const isSuccess = !isPending && !isFetching;
  const shouldRenderEmptyNotifications = notificationList?.length === 0 && isSuccess;
  // Keep the button in place (disabled) while the next page loads so the list does not jump.
  const shouldRenderLoadMore = hasMorePages && (isSuccess || isFetchingNextPage);

  return (
    <div className="lw-notifications-drawer__section" data-testid="notification-tray-section">
      {notificationList.map((notification) => (
        <NotificationRowItem
          key={notification.id}
          id={notification.id}
          type={notification.notificationType}
          contentUrl={notification.contentUrl}
          content={notification.content}
          contentContext={notification.contentContext}
          courseName={notification.contentContext?.courseName || ''}
          courseTitleMap={courseTitleMap}
          createdAt={notification.created}
          lastRead={notification.lastRead}
        />
      ))}
      {isFetching && !isFetchingNextPage && (
        <div className="lw-notifications-drawer__loading" data-testid="notifications-loading-spinner">
          {intl.formatMessage(messages.loadingNotifications)}
        </div>
      )}
      {shouldRenderLoadMore && (
        <button
          type="button"
          className="lw-notifications-drawer__load-more"
          onClick={loadMore}
          disabled={isFetchingNextPage}
          aria-busy={isFetchingNextPage}
          data-testid="load-more-notifications"
        >
          {intl.formatMessage(
            isFetchingNextPage ? messages.loadingNotifications : messages.loadMoreNotifications,
          )}
        </button>
      )}
      {shouldRenderEmptyNotifications && <NotificationEmptySection />}
    </div>
  );
};

export default React.memo(NotificationSections);
