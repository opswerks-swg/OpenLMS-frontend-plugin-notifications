import {
  extractCourseIdFromUrl,
  formatDueDate,
  getCourseTitle,
  humanizeCourseKey,
  isCourseAssignedNotification,
  isCourseKey,
  resolveDefaultAppName,
} from './utils';

describe('Notification utils', () => {
  it('prefers assignments as the default app when available', () => {
    expect(resolveDefaultAppName(['discussion', 'assignments', 'grades'], null)).toBe('assignments');
  });

  it('honors requested app when present', () => {
    expect(resolveDefaultAppName(['discussion', 'assignments'], 'discussion')).toBe('discussion');
  });

  it('falls back to discussion when no apps are returned', () => {
    expect(resolveDefaultAppName([], null)).toBe('discussion');
  });

  it('extracts course title from content context', () => {
    expect(getCourseTitle({ courseTitle: 'Demo Course' })).toBe('Demo Course');
    expect(getCourseTitle({ courseName: 'Legacy Course' })).toBe('Legacy Course');
  });

  it('resolves course keys using the title map and content url', () => {
    const contentUrl = 'https://local.openedx.io/courses/course-v1:Opswerks+CS201+2017_T1/home';
    expect(isCourseKey('course-v1:Opswerks+CS201+2017_T1')).toBe(true);
    expect(extractCourseIdFromUrl(contentUrl)).toBe('course-v1:Opswerks+CS201+2017_T1');
    expect(getCourseTitle(
      { courseTitle: 'course-v1:Opswerks+CS201+2017_T1' },
      '',
      contentUrl,
      { 'course-v1:Opswerks+CS201+2017_T1': 'Computer Science' },
    )).toBe('Computer Science');
  });

  it('humanizes course keys when no display title is available', () => {
    expect(humanizeCourseKey('course-v1:OpenedX+DemoX+DemoCourse')).toBe('DemoCourse');
    expect(getCourseTitle(
      { courseTitle: 'course-v1:OpenedX+DemoX+DemoCourse' },
      '',
      'https://local.openedx.io/courses/course-v1:OpenedX+DemoX+DemoCourse/home',
    )).toBe('DemoCourse');
  });

  it('formats due dates for display', () => {
    expect(formatDueDate('2026-10-15T00:00:00Z', 'en-US')).toMatch(/Oct/);
    expect(formatDueDate(undefined, 'en-US')).toBeNull();
  });

  it('identifies course assigned notifications', () => {
    expect(isCourseAssignedNotification('course_assigned')).toBe(true);
    expect(isCourseAssignedNotification('new_comment')).toBe(false);
  });
});
