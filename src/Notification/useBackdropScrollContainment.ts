import { RefObject, useEffect } from 'react';

const SCROLL_CONTAIN_OPTS: AddEventListenerOptions = { passive: false };

function preventScroll(event: Event) {
  event.preventDefault();
}

/**
 * Blocks background scroll via the full-screen backdrop without mutating html/body styles.
 */
export function useBackdropScrollContainment(
  backdropRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!enabled || !backdrop) {
      return undefined;
    }

    backdrop.addEventListener('wheel', preventScroll, SCROLL_CONTAIN_OPTS);
    backdrop.addEventListener('touchmove', preventScroll, SCROLL_CONTAIN_OPTS);

    return () => {
      backdrop.removeEventListener('wheel', preventScroll);
      backdrop.removeEventListener('touchmove', preventScroll);
    };
  }, [backdropRef, enabled]);
}
