import React, { RefObject } from 'react';

export interface NotificationDrawerContextValue {
  drawerHeaderRef: RefObject<HTMLElement> | null;
  drawerRef: RefObject<HTMLElement> | null;
}

const notificationDrawerContext = React.createContext<NotificationDrawerContextValue>({
  drawerHeaderRef: null,
  drawerRef: null,
});

export default notificationDrawerContext;
