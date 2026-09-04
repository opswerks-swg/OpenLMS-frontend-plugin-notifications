// Header-plugin entry for OpenLMS MFEs (frontend-platform).
// Standalone frontend-base app export lives in ./app — do not re-export here
// or webpack will pull site.config into every MFE that mounts the tray.
export { default as NotificationsTray } from './NotificationsTray';
export { default } from './NotificationsTray';
