import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from 'react-intl';
import AppContext from '@edx/frontend-platform/react/AppContext';
import { getConfig } from '@edx/frontend-platform';

import Notifications from './index';
import { useAppNotifications } from './data/hook';
import { createTestQueryClient } from '../setupTest';

export const TEST_AUTHENTICATED_USER = {
  userId: 3,
  username: 'abc123',
  email: 'abc@example.com',
  name: 'Abc User',
  avatar: '',
  administrator: false,
  roles: [],
};

interface NotificationsFromQueryProps {
  onDrawerMountedChange?: (mounted: boolean) => void;
}

export const NotificationsFromQuery: React.FC<NotificationsFromQueryProps> = ({
  onDrawerMountedChange,
}) => {
  const { notificationAppData } = useAppNotifications();
  if (!notificationAppData?.showNotificationsTray) {
    return null;
  }
  return (
    <Notifications
      notificationAppData={notificationAppData}
      onDrawerMountedChange={onDrawerMountedChange}
    />
  );
};

interface RenderWithProvidersOptions {
  route?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/' }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <IntlProvider locale="en" messages={{}}>
          <AppContext.Provider value={{ authenticatedUser: TEST_AUTHENTICATED_USER, config: getConfig() }}>
            {ui}
          </AppContext.Provider>
        </IntlProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
