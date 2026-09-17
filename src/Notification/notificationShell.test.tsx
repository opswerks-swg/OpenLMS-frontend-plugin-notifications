import React from 'react';

import {
  fireEvent, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import {
  getNotificationsCountApiUrl,
  getNotificationsListApiUrl,
  markNotificationAsReadApiUrl,
} from './data/api';
import {
  NotificationsFromQuery,
  TEST_AUTHENTICATED_USER,
  renderWithProviders,
} from './test-harness';

import './data/__factories__';

const notificationCountsApiUrl = getNotificationsCountApiUrl();
const notificationsListApiUrl = getNotificationsListApiUrl();

let axiosMock: MockAdapter;

async function renderComponent() {
  renderWithProviders(<NotificationsFromQuery />);
}

function mockDrawerApis(listResults: unknown[] = []) {
  axiosMock.onGet(notificationCountsApiUrl).reply(200, Factory.build('notificationsCount', {
    count: 3,
    showNotificationsTray: true,
  }));
  axiosMock.onGet(notificationsListApiUrl).reply(200, Factory.build('notificationsList', {
    results: listResults,
  }));
  axiosMock.onPut(/\/api\/notifications\/mark-seen\/.*/).reply(200, { message: 'Notifications marked seen.' });
}

describe('Notification drawer shell', () => {
  beforeEach(async () => {
    initializeMockApp({ authenticatedUser: TEST_AUTHENTICATED_USER });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    Factory.resetAll();
  });

  it('renders an empty list body with header mark-all control', async () => {
    mockDrawerApis([]);

    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByTestId('notifications-empty-list')).toBeInTheDocument();
      expect(screen.getByTestId('mark-all-read')).toHaveTextContent('Mark all as read');
    });
  });

  it('calls mark-all-as-read API from the drawer header button', async () => {
    mockDrawerApis([]);
    axiosMock.onPatch(markNotificationAsReadApiUrl()).reply(200, {});

    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    fireEvent.click(bellIcon);

    const markAllReadButton = await screen.findByTestId('mark-all-read');
    fireEvent.click(markAllReadButton);

    await waitFor(() => {
      expect(axiosMock.history.patch.length).toBeGreaterThan(0);
    });
  });
});
