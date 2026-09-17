import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import { NotificationAppData, useMarkAllNotificationsRead } from './data/hook';
import NotificationSections from './NotificationSections';
import NotificationTour from './tours/NotificationTour';
import messages from './messages';
import { notificationsContext, NotificationContextValue } from './context/notificationsContext';
import notificationDrawerContext from './context/notificationDrawerContext';
import { DEFAULT_NOTIFICATION_APP, DRAWER_CLOSE_MS, DRAWER_OPEN_MS } from './constants';
import { getNotificationDrawerPortalTarget } from './drawerPortalRoot';
import { getDrawerBackdropStyle, getDrawerPanelStyle } from './drawerStyles';
import { NotificationCloseIcon, NotificationHeadingIcon } from './icons';
import GoogleSansFlexFonts from './GoogleSansFlexFonts';
import { resolveDefaultAppName } from './utils';
import { useBackdropScrollContainment } from './useBackdropScrollContainment';
import { useDrawerEscapeKey } from './useDrawerEscapeKey';

import './notification.scss';

interface NotificationsProps {
  notificationAppData?: NotificationAppData,
  margins?: string,
  onDrawerMountedChange?: (mounted: boolean) => void,
  onDrawerOpenChange?: (open: boolean) => void,
}

const defaultNotificationAppData: NotificationAppData = {
  apps: {},
  tabsCount: { count: 0 },
  appsId: [],
  isNewNotificationViewEnabled: false,
  notificationExpiryDays: 0,
  showNotificationsTray: false,
};

const Notifications: React.FC<NotificationsProps> = ({
  notificationAppData = defaultNotificationAppData,
  margins = 'mx-1.5',
  onDrawerMountedChange,
  onDrawerOpenChange,
}) => {
  const intl = useIntl();
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const [searchParams] = useSearchParams();
  const bellWrapperRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAnimateOpenRef = useRef(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [appName, setAppName] = useState(DEFAULT_NOTIFICATION_APP);
  const [openFlag, setOpenFlag] = useState(false);

  const { tabsCount, appsId } = notificationAppData;
  const { mutateAsync: markAllAsRead } = useMarkAllNotificationsRead();
  const unreadCount = tabsCount?.count ?? 0;

  const openDrawer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsDrawerOpen(false);
    setIsDrawerMounted(true);
    shouldAnimateOpenRef.current = true;
  }, []);

  const clearDrawerAnimationInlineStyles = useCallback(() => {
    const animatedProps = [
      'transform',
      'visibility',
      'opacity',
      'pointer-events',
      'transition-property',
      'transition-timing-function',
    ];
    animatedProps.forEach((prop) => {
      backdropRef.current?.style.removeProperty(prop);
      drawerRef.current?.style.removeProperty(prop);
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    backdropRef.current?.style.setProperty('transition-duration', `${DRAWER_CLOSE_MS}ms`);
    drawerRef.current?.style.setProperty('transition-duration', `${DRAWER_CLOSE_MS}ms`);
    closeTimerRef.current = setTimeout(() => {
      setIsDrawerMounted(false);
      closeTimerRef.current = null;
      clearDrawerAnimationInlineStyles();
      backdropRef.current?.style.removeProperty('transition-duration');
      drawerRef.current?.style.removeProperty('transition-duration');
      bellWrapperRef.current?.querySelector('button')?.focus();
    }, DRAWER_CLOSE_MS);
  }, [clearDrawerAnimationInlineStyles]);

  const toggleNotificationTray = useCallback(() => {
    if (isDrawerOpen || isDrawerMounted) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [closeDrawer, isDrawerMounted, isDrawerOpen, openDrawer]);

  useLayoutEffect(() => {
    if (!isDrawerMounted || isDrawerOpen || !shouldAnimateOpenRef.current) {
      return undefined;
    }

    shouldAnimateOpenRef.current = false;
    clearDrawerAnimationInlineStyles();

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setIsDrawerOpen(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) {
        cancelAnimationFrame(raf2);
      }
    };
  }, [clearDrawerAnimationInlineStyles, isDrawerMounted, isDrawerOpen]);

  useEffect(() => {
    if (openFlag || appsId.length === 0) {
      return;
    }
    const requestedApp = searchParams.get('app');
    setAppName(resolveDefaultAppName(appsId, requestedApp));
    if (searchParams.get('showNotifications') === 'true') {
      openDrawer();
    }
    setOpenFlag(true);
  }, [appsId, openDrawer, openFlag, searchParams]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    onDrawerMountedChange?.(isDrawerMounted);
  }, [isDrawerMounted, onDrawerMountedChange]);

  useLayoutEffect(() => {
    if (isDrawerMounted) {
      onDrawerOpenChange?.(isDrawerOpen);
    }
  }, [isDrawerOpen, isDrawerMounted, onDrawerOpenChange]);

  useEffect(() => {
    if (isDrawerOpen) {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
  }, [isDrawerOpen]);

  // Match LMS notifications.js: only set transition-duration imperatively.
  // Transform/opacity/visibility are driven exclusively by the --open CSS class
  // so close animations are not snapped by React inline style updates.
  useEffect(() => {
    const duration = isDrawerOpen ? `${DRAWER_OPEN_MS}ms` : `${DRAWER_CLOSE_MS}ms`;
    backdropRef.current?.style.setProperty('transition-duration', duration);
    drawerRef.current?.style.setProperty('transition-duration', duration);
  }, [isDrawerOpen]);

  useBackdropScrollContainment(backdropRef, isDrawerOpen);
  useDrawerEscapeKey(isDrawerOpen, closeDrawer);

  const handleActiveTab = useCallback((selectedAppName: string) => {
    setAppName(selectedAppName);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    if (!appName) {
      return;
    }
    markAllAsRead(appName);
  }, [appName, markAllAsRead]);

  const notificationContextValue = useMemo<NotificationContextValue>(() => ({
    appName,
    handleActiveTab,
  }), [appName, handleActiveTab]);

  const drawerContextValue = useMemo(() => ({
    drawerHeaderRef: headerRef,
    drawerRef,
  }), []);

  const drawerPortal = isDrawerMounted && typeof document !== 'undefined'
    ? ReactDOM.createPortal(
        <>
          <button
            ref={backdropRef}
            type="button"
            className={classNames('lw-notifications-drawer__backdrop', {
              'lw-notifications-drawer__backdrop--open': isDrawerOpen,
            })}
            style={getDrawerBackdropStyle()}
            aria-hidden="true"
            tabIndex={-1}
            data-testid="notification-drawer-backdrop"
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            id="lw-notifications-drawer"
            className={classNames('lw-notifications-drawer', {
              'lw-notifications-drawer--open': isDrawerOpen,
            })}
            style={getDrawerPanelStyle()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lw-notifications-drawer-title"
            data-testid="notification-tray"
          >
            <div ref={headerRef} className="lw-notifications-drawer__header">
              <div className="lw-notifications-drawer__heading">
                <NotificationHeadingIcon className="lw-notifications-drawer__heading-icon" />
                <h2 id="lw-notifications-drawer-title" className="lw-notifications-drawer__title">
                  {intl.formatMessage(messages.notificationTitle)}
                </h2>
                <span
                  className={classNames('lw-notifications-drawer__count-badge', {
                    'lw-notifications-drawer__count-badge--wide': unreadCount >= 10,
                  })}
                  data-testid="notification-drawer-count"
                >
                  {unreadCount >= 100 ? '99+' : unreadCount}
                </span>
              </div>
              <div className="lw-notifications-drawer__header-actions">
                <button
                  type="button"
                  className="lw-notifications-drawer__mark-all"
                  onClick={handleMarkAllAsRead}
                  data-testid="mark-all-read"
                >
                  {intl.formatMessage(messages.notificationMarkAsRead)}
                </button>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="lw-notifications-drawer__close"
                  onClick={closeDrawer}
                  aria-label={intl.formatMessage(messages.notificationCloseButtonAltMessage)}
                  data-testid="notification-drawer-close"
                >
                  <NotificationCloseIcon />
                </button>
              </div>
            </div>
            <div className="lw-notifications-drawer__list">
              <notificationDrawerContext.Provider value={drawerContextValue}>
                <NotificationSections />
              </notificationDrawerContext.Provider>
            </div>
          </div>
        </>,
        getNotificationDrawerPortalTarget(),
      )
    : null;

  return (
    <notificationsContext.Provider value={notificationContextValue}>
      <GoogleSansFlexFonts />
      <div ref={bellWrapperRef} className={classNames('lw-notification-btn-wrapper', margins)}>
        <button
          type="button"
          className="lw-notification-btn"
          onClick={toggleNotificationTray}
          aria-label={intl.formatMessage(messages.notificationBellIconAltMessage)}
          aria-expanded={isDrawerOpen}
          aria-controls={isDrawerMounted ? 'lw-notifications-drawer' : undefined}
          data-testid="notification-bell-icon"
        >
          <NotificationHeadingIcon />
        </button>
      </div>
      {drawerPortal}
      <NotificationTour />
    </notificationsContext.Provider>
  );
};

export default Notifications;
