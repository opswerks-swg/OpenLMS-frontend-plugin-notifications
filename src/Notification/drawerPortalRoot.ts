/**
 * Portal target for the notification drawer overlay.
 * Backdrop and drawer mount as direct children of document.body (same as LMS theme JS)
 * so position:fixed children stay viewport-relative.
 */
export function getNotificationDrawerPortalTarget(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('document is not available');
  }
  return document.body;
}
