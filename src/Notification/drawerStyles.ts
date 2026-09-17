import { CSSProperties } from 'react';

/**
 * Structural inline styles for the notification drawer overlay.
 *
 * DO NOT include animated properties (transform, opacity, visibility, transition-*) here.
 * Those live exclusively in SCSS (notification.scss) and are also applied imperatively
 * via refs in index.tsx so React re-renders never overwrite a transition mid-flight.
 */
export function getDrawerBackdropStyle(): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 1040,
    backgroundColor: '#000',
    border: 'none',
    padding: 0,
    margin: 0,
  };
}

export function getDrawerPanelStyle(): CSSProperties {
  return {
    position: 'fixed',
    top: 0,
    right: 0,
    left: 'auto',
    zIndex: 1050,
    display: 'flex',
    flexDirection: 'column',
    width: 430,
    maxWidth: '100%',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };
}
