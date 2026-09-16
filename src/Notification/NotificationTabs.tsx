import React, { useContext } from 'react';

import { Tab, Tabs } from '@openedx/paragon';

import NotificationSections from './NotificationSections';
import { notificationsContext } from './context/notificationsContext';
import { NotificationAppData } from './data/hook';

interface NotificationTabsProps {
  notificationAppData: NotificationAppData,
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({ notificationAppData }) => {
  const { appName, handleActiveTab } = useContext(notificationsContext);
  const { appsId, tabsCount } = notificationAppData;

  return (
    appsId.length > 1
      ? (
          <Tabs
            variant="tabs"
            defaultActiveKey={appName}
            onSelect={handleActiveTab}
            className="lw-notifications-drawer__tabs text-primary-500"
          >
            {appsId.map((app) => (
              <Tab
                key={app}
                eventKey={app}
                title={app}
                notification={tabsCount[app]}
                tabClassName="pt-0 py-2 px-2.5 d-flex border-top-0 mb-0 align-items-center line-height-24 text-capitalize"
                data-testid={`notification-tab-${app}`}
              >
                {appName === app && <NotificationSections />}
              </Tab>
            ))}
          </Tabs>
        )
      : <NotificationSections />
  );
};

export default React.memo(NotificationTabs);
