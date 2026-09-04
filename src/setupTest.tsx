import '@testing-library/jest-dom';
import React, { ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from 'react-intl';
import AppContext from '@edx/frontend-platform/react/AppContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResizeObserver from 'resize-observer-polyfill';

(globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = ResizeObserver;

process.env.LMS_BASE_URL = process.env.LMS_BASE_URL || 'http://localhost:18000';
process.env.BASE_URL = process.env.BASE_URL || 'localhost:1992';
process.env.LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:18000/login';
process.env.LOGOUT_URL = process.env.LOGOUT_URL || 'http://localhost:18000/logout';
process.env.REFRESH_ACCESS_TOKEN_ENDPOINT = process.env.REFRESH_ACCESS_TOKEN_ENDPOINT || 'http://localhost:18000/login_refresh';
process.env.ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || 'edx-jwt-cookie-header-payload';
process.env.CSRF_TOKEN_API_PATH = process.env.CSRF_TOKEN_API_PATH || '/csrf/api/v1/token';
process.env.SITE_NAME = process.env.SITE_NAME || 'OpenLMS';

mergeConfig({
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  BASE_URL: process.env.BASE_URL,
  LOGIN_URL: process.env.LOGIN_URL,
  LOGOUT_URL: process.env.LOGOUT_URL,
  REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
  CSRF_TOKEN_API_PATH: process.env.CSRF_TOKEN_API_PATH,
  SITE_NAME: process.env.SITE_NAME,
});

export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0, staleTime: 0 },
    mutations: { retry: false },
  },
});

function render(ui: React.ReactElement, renderOptions: Omit<RenderOptions, 'wrapper'> = {}) {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={{}}>
        <AppContext.Provider value={{ authenticatedUser: null, config: getConfig() }}>
          {children}
        </AppContext.Provider>
      </IntlProvider>
    </QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export { getConfig };
export default render;
