import { Factory } from 'rosie';

Factory.define('notificationsCount')
  .attr('count', 45)
  .attr('countByAppName', {
    assignments: 12,
    reminders: 10,
    discussion: 20,
    grades: 10,
    authoring: 5,
  })
  .attr('showNotificationsTray', true)
  .attr('isNewNotificationViewEnabled', true)
  .attr('notification_expiry_days', 60);

Factory.define('notification')
  .sequence('id')
  .attr('notification_type', 'new_comment')
  .sequence('content', ['id'], (idx, notificationId) => `<p><strong>User ${idx}</strong> posts <strong>Hello and welcome to SC0x
  ${notificationId}!</strong></p>`)
  .attr('content_context', {
    course_name: 'Supply Chain Analytics',
  })
  .sequence('content_url', (idx) => `https://example.com/${idx}`)
  .attr('last_read', null)
  .attr('last_seen', null)
  .sequence('created', ['createdDate'], (_idx: number, date: string) => date);

Factory.define('courseAssignedNotification')
  .extend('notification')
  .attr('notification_type', 'course_assigned')
  .attr('content', 'You have been assigned a new course.')
  .attr('content_context', {
    course_name: 'Intro to Supply Chain',
    course_title: 'Intro to Supply Chain',
    due_date: '2026-10-15T00:00:00Z',
    assigned_by: 'Jane Instructor',
  })
  .sequence('content_url', (idx) => `https://local.openedx.io/courses/course-v1:edX+DemoX+Demo_Course/${idx}`);

Factory.define('notificationsList')
  .attr('next', null)
  .attr('previous', null)
  .attr('count', null, 2)
  .attr('num_pages', null, 1)
  .attr('current_page', null, 1)
  .attr('start', null, 0)
  .attr('results', ['results'], (results) => results || Factory.buildList('notification', 2, null, { createdDate: new Date().toISOString() }));
