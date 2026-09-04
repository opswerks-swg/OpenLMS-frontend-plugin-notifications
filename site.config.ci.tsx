import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

import notificationsApp from './src/app';

const siteConfig: SiteConfig = {
  siteId: 'notifications-ci',
  siteName: 'Notifications (CI)',
  baseUrl: 'http://apps.local.openedx.io',
  lmsBaseUrl: 'http://local.openedx.io',
  loginUrl: 'http://local.openedx.io/login',
  logoutUrl: 'http://local.openedx.io/logout',

  environment: EnvironmentTypes.PRODUCTION,
  apps: [
    notificationsApp,
  ],
};

export default siteConfig;
