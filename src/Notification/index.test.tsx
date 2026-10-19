import React from 'react';

import {
  act, fireEvent, screen, waitFor,
} from '@testing-library/react';

import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import * as notificationApi from './data/api';
import {
  NotificationsFromQuery,
  TEST_AUTHENTICATED_USER,
  renderWithProviders,
} from './test-harness';

import './data/__factories__';

const notificationCountsApiUrl = notificationApi.getNotificationsCountApiUrl();
const notificationsListApiUrl = notificationApi.getNotificationsListApiUrl();

let axiosMock: MockAdapter;

async function renderComponent(url = '/', onDrawerMountedChange?: (mounted: boolean) => void) {
  renderWithProviders(
    <NotificationsFromQuery onDrawerMountedChange={onDrawerMountedChange} />,
    { route: url },
  );
}

function mockNotificationApis(
  axios: MockAdapter,
  {
    count = 45,
    showNotificationsTray = true,
    listResults = [],
  }: {
    count?: number,
    showNotificationsTray?: boolean,
    listResults?: unknown[],
  } = {},
) {
  axios.onGet(notificationCountsApiUrl).reply(200, Factory.build('notificationsCount', {
    count,
    showNotificationsTray,
  }));
  axios.onGet(notificationsListApiUrl).reply(200, Factory.build('notificationsList', {
    results: listResults,
  }));
  axios.onPut(/\/api\/notifications\/mark-seen\/.*/).reply(200, { message: 'Notifications marked seen.' });
}

describe('Notification drawer test cases.', () => {
  beforeEach(async () => {
    initializeMockApp({ authenticatedUser: TEST_AUTHENTICATED_USER });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    Factory.resetAll();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function setupMockNotificationCountResponse(
    count = 45,
    showNotificationsTray = true,
    listResults: unknown[] = [],
  ) {
    mockNotificationApis(axiosMock, { count, showNotificationsTray, listResults });
  }

  it.each(['true', 'false', null])(
    'Ensures correct rendering of the notification drawer based on the showNotifications query parameter value %s',
    async (showNotifications) => {
      await setupMockNotificationCountResponse();

      const url = showNotifications ? `/?showNotifications=${showNotifications}` : '/';
      await renderComponent(url);
      await waitFor(() => {
        expect(screen.queryByTestId('notification-bell-icon')).toBeInTheDocument();
        if (showNotifications === 'true') {
          expect(screen.queryByTestId('notification-tray')).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument();
        }
      });
    },
  );

  it.each(['assignments', 'grades'])(
    'Notification drawer resolves app param %s without rendering a flat list',
    async (app) => {
      await setupMockNotificationCountResponse();
      const url = `/?showNotifications=true&app=${app}`;
      await renderComponent(url);
      await waitFor(() => {
        expect(screen.queryByTestId('notification-bell-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('notification-tray')).toBeInTheDocument();
        expect(screen.getByTestId('notifications-empty-list')).toBeInTheDocument();
      });
    },
  );

  it('Renders drawer header with mark all and empty list body', async () => {
    await setupMockNotificationCountResponse(3);
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    await act(async () => {
      fireEvent.click(bellIcon);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
      expect(screen.getByTestId('notification-drawer-count')).toHaveTextContent('3');
      expect(screen.getByTestId('mark-all-read')).toBeInTheDocument();
      expect(screen.getByTestId('notification-drawer-close')).toBeInTheDocument();
      expect(screen.getByTestId('notifications-empty-list')).toBeInTheDocument();
    });
  });

  it.each([
    [3, '3', false],
    [12, '12', true],
    [150, '99+', true],
  ])('Shows %i unread on the bell badge', async (count, label, wide) => {
    await setupMockNotificationCountResponse(count);
    await renderComponent();

    const badge = await screen.findByTestId('notification-bell-count');
    expect(badge).toHaveTextContent(label);
    expect(badge.classList.contains('lw-notification-badge--wide')).toBe(wide);
    expect(screen.getByTestId('notification-bell-icon'))
      .toHaveAttribute('aria-label', `Notifications, ${count} unread`);
  });

  it('Hides the bell badge when nothing is unread', async () => {
    await setupMockNotificationCountResponse(0);
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    expect(screen.queryByTestId('notification-bell-count')).not.toBeInTheDocument();
    expect(bellIcon).toHaveAttribute('aria-label', 'Notification bell icon');
  });

  it('Renders course assigned notifications from the list API', async () => {
    const assignedNotification = Factory.build('courseAssignedNotification', null, {
      createdDate: new Date().toISOString(),
    });
    await setupMockNotificationCountResponse(1, true, [assignedNotification]);
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    await act(async () => {
      fireEvent.click(bellIcon);
    });

    await waitFor(() => {
      expect(screen.getByTestId('notification-assigned-title-1')).toHaveTextContent('New Course Assigned');
      expect(screen.getByTestId('notification-course-1')).toHaveTextContent('Intro to Supply Chain has been assigned to you');
      expect(screen.getByTestId('notification-due-date-1')).toHaveTextContent('Due:');
      expect(screen.getByTestId('notification-assigned-by-1')).toHaveTextContent('Assigned by: Jane Instructor');
    });
  });

  it('Shows bell icon without nav badge regardless of unread count.', async () => {
    await setupMockNotificationCountResponse();
    await renderComponent();

    await waitFor(() => {
      const bellIcon = screen.queryByTestId('notification-bell-icon');

      expect(bellIcon).toBeInTheDocument();
      expect(screen.queryByTestId('notification-count')).not.toBeInTheDocument();
      expect(bellIcon).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('Shows bell icon when unread count is zero.', async () => {
    await setupMockNotificationCountResponse(0);
    await renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('notification-bell-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('notification-count')).not.toBeInTheDocument();
    });
  });

  it('Shows an inert bell when showNotificationsTray is false.', async () => {
    await setupMockNotificationCountResponse(45, false);
    await renderComponent();

    const staticBell = await screen.findByTestId('notification-bell-icon-static');
    expect(screen.queryByTestId('notification-bell-icon')).not.toBeInTheDocument();
    expect(staticBell).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(staticBell);
    expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument();
  });

  it('Successfully opens and closes the drawer from the bell icon.', async () => {
    await setupMockNotificationCountResponse();
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');

    await act(async () => {
      fireEvent.click(bellIcon);
    });
    await waitFor(() => {
      expect(screen.queryByTestId('notification-tray')).toBeInTheDocument();
      expect(bellIcon).toHaveAttribute('aria-expanded', 'true');
    });

    await act(async () => {
      fireEvent.click(bellIcon);
    });
    await waitFor(() => expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument());
    await waitFor(() => expect(bellIcon).toHaveAttribute('aria-expanded', 'false'));
  });

  it('Closes the drawer from the backdrop.', async () => {
    await setupMockNotificationCountResponse();
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    await act(async () => {
      fireEvent.click(bellIcon);
    });

    const backdrop = await screen.findByTestId('notification-drawer-backdrop');
    await act(async () => {
      fireEvent.click(backdrop);
    });
    await waitFor(() => expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument());
  });

  it('Closes the drawer from the close button.', async () => {
    await setupMockNotificationCountResponse();
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    await act(async () => {
      fireEvent.click(bellIcon);
    });

    const closeButton = await screen.findByTestId('notification-drawer-close');
    await act(async () => {
      fireEvent.click(closeButton);
    });
    await waitFor(() => expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument());
  });

  it('Closes the drawer on Escape and returns focus to the bell.', async () => {
    await setupMockNotificationCountResponse();
    await renderComponent();

    const bellIcon = await screen.findByTestId('notification-bell-icon');
    await act(async () => {
      fireEvent.click(bellIcon);
    });
    await waitFor(() => {
      expect(screen.queryByTestId('notification-tray')).toBeInTheDocument();
      expect(bellIcon).toHaveAttribute('aria-expanded', 'true');
    });

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    await waitFor(() => expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument());
    await waitFor(() => expect(document.activeElement).toBe(bellIcon));
  });

  describe('drawer mounted lifecycle', () => {
    it('notifies onDrawerMountedChange when the drawer opens and closes', async () => {
      const onDrawerMountedChange = jest.fn();
      await setupMockNotificationCountResponse();
      await renderComponent('/', onDrawerMountedChange);

      const bellIcon = await screen.findByTestId('notification-bell-icon');
      await act(async () => {
        fireEvent.click(bellIcon);
      });

      await waitFor(() => {
        expect(onDrawerMountedChange).toHaveBeenCalledWith(true);
      });

      await act(async () => {
        fireEvent.click(bellIcon);
      });

      await waitFor(() => expect(screen.queryByTestId('notification-tray')).not.toBeInTheDocument());
      expect(onDrawerMountedChange).toHaveBeenCalledWith(false);
    });

    it('does not mutate document.body styles directly', async () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      await setupMockNotificationCountResponse();
      await renderComponent();

      const bellIcon = await screen.findByTestId('notification-bell-icon');
      await act(async () => {
        fireEvent.click(bellIcon);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('notification-tray')).toBeInTheDocument();
      });

      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.paddingRight).toBe('');
    });
  });

  it.each(['/', '/notification', '/my-post'])(
    'Successfully call getNotificationCounts on URL %s change',
    async (url) => {
      const getNotificationCountsSpy = jest.spyOn(notificationApi, 'getNotificationCounts')
        .mockResolvedValue({} as any);
      await renderComponent(url);
      await waitFor(() => {
        expect(getNotificationCountsSpy).toHaveBeenCalledTimes(1);
      });
    },
  );
});

describe('Course completed toast', () => {
  const latestCompleted = {
    id: 501,
    course_title: 'Database Fundamentals',
    content_url: 'https://apps.local.openedx.io/profile/u/learner',
    created: new Date().toISOString(),
  };

  beforeEach(() => {
    // The suite above stubs getNotificationCounts with jest.spyOn; clearAllMocks doesn't undo it.
    jest.restoreAllMocks();
    initializeMockApp({ authenticatedUser: TEST_AUTHENTICATED_USER });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    Factory.resetAll();
    window.localStorage.clear();
  });

  function mockCounts(latest: typeof latestCompleted | null) {
    axiosMock.onGet(notificationCountsApiUrl).reply(200, Factory.build('notificationsCount', {
      count: 1,
      showNotificationsTray: true,
      latest_completed: latest,
    }));
  }

  it('congratulates the learner once per completion', async () => {
    mockCounts(latestCompleted);
    const { unmount } = renderWithProviders(<NotificationsFromQuery />);

    expect(await screen.findByText('Congratulations! You have completed Database Fundamentals'))
      .toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' }))
      .toHaveAttribute('href', latestCompleted.content_url);

    // The header remounts on every MFE navigation; the same completion is not announced again.
    unmount();
    renderWithProviders(<NotificationsFromQuery />);
    await screen.findByTestId('notification-bell-icon');
    expect(screen.queryByText('Congratulations! You have completed Database Fundamentals'))
      .not.toBeInTheDocument();
  });

  it('shows no toast without a recent completion', async () => {
    mockCounts(null);
    renderWithProviders(<NotificationsFromQuery />);
    await screen.findByTestId('notification-bell-icon');
    expect(screen.queryByText(/Congratulations!/)).not.toBeInTheDocument();
  });
});
