import NotificationsTray from './index';

describe('Package exports', () => {
  it('default-exports NotificationsTray for header imports', () => {
    expect(NotificationsTray).toBeDefined();
    expect(typeof NotificationsTray).toBe('function');
  });
});
