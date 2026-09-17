import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { NotificationsNone } from '@openedx/paragon/icons';

import messages from './messages';

const EmptyNotifications = () => {
  const intl = useIntl();

  return (
    <div
      className="lw-notifications-drawer__empty"
      data-testid="notifications-empty-list"
    >
      <Icon
        src={NotificationsNone}
        className="lw-notifications-drawer__empty-icon"
        data-testid="notification-empty-bell-icon"
        screenReaderText={intl.formatMessage(messages.notificationBellIconAltMessage)}
      />
      <div className="lw-notifications-drawer__empty-title">
        {intl.formatMessage(messages.noNotificationsYetMessage)}
      </div>
      <div className="lw-notifications-drawer__empty-help">
        {intl.formatMessage(messages.noNotificationHelpMessage)}
      </div>
    </div>
  );
};

export default React.memo(EmptyNotifications);
