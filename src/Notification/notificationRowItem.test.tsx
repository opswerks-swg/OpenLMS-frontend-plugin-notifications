import React from 'react';

import {
  act, fireEvent, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import NotificationRowItem from './NotificationRowItem';
import { markNotificationAsReadApiUrl } from './data/api';
import { TEST_AUTHENTICATED_USER, renderWithProviders } from './test-harness';

import './data/__factories__';

describe('Course assigned notification card', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        ...TEST_AUTHENTICATED_USER,
        administrator: true,
      },
    });
    Factory.resetAll();
  });

  it('renders course assigned heading, body, due date, assigned by, and relative time', () => {
    renderWithProviders(
      <NotificationRowItem
        id={99}
        type="course_assigned"
        contentUrl="https://local.openedx.io/courses/demo/home"
        content="You have been assigned a new course."
        contentContext={{
          courseTitle: 'Supply Chain Analytics',
          dueDate: '2026-10-15T00:00:00Z',
          assignedBy: 'Jane Instructor',
        }}
        courseName="Supply Chain Analytics"
        createdAt={new Date().toISOString()}
      />,
    );

    expect(screen.getByTestId('notification-assigned-title-99')).toHaveTextContent('New Course Assigned');
    expect(screen.getByTestId('notification-course-99')).toHaveTextContent(
      'Supply Chain Analytics has been assigned to you',
    );
    expect(screen.getByTestId('notification-due-date-99')).toHaveTextContent('Due:');
    expect(screen.getByTestId('notification-assigned-by-99')).toHaveTextContent('Assigned by: Jane Instructor');
    expect(screen.getByTestId('notification-created-date-99')).toBeInTheDocument();
  });

  it('shows the course provider as the assigning authority when it is known', () => {
    renderWithProviders(
      <NotificationRowItem
        id={98}
        type="course_assigned"
        contentUrl="https://local.openedx.io/courses/course-v1:SSED+React+2026/about"
        content=""
        contentContext={{ courseTitle: 'Introduction to React', assignedBy: 'Ada Admin', provider: 'SSED' }}
        courseName=""
        createdAt={new Date().toISOString()}
      />,
    );
    expect(screen.getByTestId('notification-assigned-by-98')).toHaveTextContent('Assigned by: SSED');
  });
});

describe('Assignment lifecycle notification cards', () => {
  beforeEach(() => {
    initializeMockApp({ authenticatedUser: TEST_AUTHENTICATED_USER });
  });

  const renderCard = (type: string, contentContext: Record<string, unknown>, lastRead: string | null = null) => {
    renderWithProviders(
      <NotificationRowItem
        id={7}
        type={type}
        contentUrl="https://local.openedx.io/courses/course-v1:SSED+Demo+2026/about"
        content=""
        contentContext={contentContext}
        courseName=""
        createdAt={new Date().toISOString()}
        lastRead={lastRead}
      />,
    );
    return screen.getByTestId('notification-7');
  };

  it.each([
    [1, 'Figma Fundamentals is due tomorrow'],
    [7, 'Figma Fundamentals is due in 7 days'],
  ])('renders a due date reminder %i day(s) out', (days, body) => {
    const card = renderCard('course_due_reminder', {
      courseTitle: 'Figma Fundamentals', dueDate: '2026-04-23', daysUntilDue: days,
    });
    expect(card).toHaveClass('lw-notification-card--structured', 'lw-notification-card--reminder');
    expect(screen.getByTestId('notification-reminder-title-7')).toHaveTextContent('Due Date Reminder');
    expect(screen.getByTestId('notification-course-7')).toHaveTextContent(body);
    expect(screen.getByTestId('notification-due-date-7')).toHaveTextContent('Due:');
    expect(screen.getByTestId('unread-notification-7')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-assigned-by-7')).not.toBeInTheDocument();
  });

  it('renders an overdue alert with the warning variant', () => {
    const card = renderCard('course_overdue', {
      courseTitle: 'Advanced Typescript', dueDate: '2026-04-21', daysOverdue: 2,
    });
    expect(card).toHaveClass('lw-notification-card--overdue');
    expect(screen.getByTestId('notification-overdue-title-7')).toHaveTextContent('Course Overdue');
    expect(screen.getByTestId('notification-course-7')).toHaveTextContent('Advanced Typescript is now overdue');
  });

  it('renders a completed card that mentions the badge and certificate', () => {
    const card = renderCard('course_completed', {
      courseTitle: 'Database Fundamentals', badgeName: 'SQL Pro', hasCertificate: true,
    });
    expect(card).toHaveClass('lw-notification-card--completed');
    expect(screen.getByTestId('notification-completed-title-7')).toHaveTextContent('Course Completed');
    expect(screen.getByTestId('notification-course-7')).toHaveTextContent(
      'Congratulations! You have completed Database Fundamentals',
    );
    expect(screen.getByTestId('notification-badge-7')).toHaveTextContent('You earned the SQL Pro badge');
    expect(screen.getByTestId('notification-certificate-7')).toHaveTextContent('certificate');
    expect(screen.queryByTestId('notification-due-date-7')).not.toBeInTheDocument();
  });

  it('omits the award lines when the course awards nothing', () => {
    renderCard('course_completed', { courseTitle: 'Database Fundamentals' });
    expect(screen.queryByTestId('notification-badge-7')).not.toBeInTheDocument();
    expect(screen.queryByTestId('notification-certificate-7')).not.toBeInTheDocument();
  });

  it('drops the unread dot once read', () => {
    renderCard('course_overdue', { courseTitle: 'Advanced Typescript' }, '2026-04-22T00:00:00Z');
    expect(screen.queryByTestId('unread-notification-7')).not.toBeInTheDocument();
  });
});

describe('Notification row item integration', () => {
  let axiosMock: MockAdapter;
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        ...TEST_AUTHENTICATED_USER,
        administrator: true,
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPatch(markNotificationAsReadApiUrl()).reply(200, { message: 'Notification marked read.' });
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    axiosMock.reset();
    openSpy.mockRestore();
  });

  it('marks a legacy notification as read on click', async () => {
    renderWithProviders(
      <NotificationRowItem
        id={1}
        type="new_comment"
        contentUrl="https://example.com/1"
        content="<p><strong>User 1</strong> commented</p>"
        courseName="Supply Chain Analytics"
        createdAt={new Date().toISOString()}
      />,
    );

    expect(screen.getByTestId('unread-notification-1')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-1'));
    });

    await waitFor(() => {
      expect(axiosMock.history.patch.length).toBe(1);
    });
    expect(openSpy).toHaveBeenCalledWith('https://example.com/1', '_blank', 'noopener,noreferrer');
  });
});
