import {
  EnvironmentTypes,
  SiteConfig,
} from '@openedx/frontend-base';

import notificationsApp from './src/app';
import { devApp } from './dev';

/**
 * Standalone plugin playground. Do not load frontend-base headerApp/footerApp —
 * this package is a tray widget, not a site, and headerApp pulls
 * @edx/frontend-component-header (not a dependency here).
 */
const siteConfig: SiteConfig = {
  siteId: 'notifications-dev',
  siteName: 'Notifications Dev',
  baseUrl: 'http://apps.local.openedx.io:1992',
  basename: '/notifications',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  loginUrl: 'http://local.openedx.io:8000/login',
  logoutUrl: 'http://local.openedx.io:8000/logout',

  environment: EnvironmentTypes.DEVELOPMENT,
  apps: [
    notificationsApp,
    devApp,
  ],
  externalRoutes: [
    {
      role: 'org.openedx.frontend.role.account',
      url: 'http://apps.local.openedx.io:1997/account/',
    },
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
};

export default siteConfig;
