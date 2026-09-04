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
