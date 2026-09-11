import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `onOutsideClick` on any pointerdown outside the element `ref`
 * points to. Built for closing a native <details> disclosure — which has
 * no built-in "click outside to close" behaviour — by setting its `open`
 * property to false from the callback, without lifting that state into
 * React and fighting the browser's own toggle handling.
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
