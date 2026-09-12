import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `onOutsideClick` on any pointerdown outside the element `ref`
 * points to. Used by GroupPicker to close its dropdown (a controlled
 * `open` state, not a native <details>) when the user clicks elsewhere.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
): void {
  // Stashed in a ref so the listener effect below doesn't need
  // `onOutsideClick` in its dependency array — callers can pass a fresh
  // inline function every render without re-attaching the listener each
  // time. Written from its own effect (not during render) since mutating
  // a ref while rendering isn't safe under React's concurrent rendering.
  const callbackRef = useRef(onOutsideClick);
  useEffect(() => {
    callbackRef.current = onOutsideClick;
  });

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        callbackRef.current();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref]);
}
