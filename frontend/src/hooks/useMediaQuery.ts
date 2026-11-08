import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}

export const MOBILE_QUERY = "(max-width: 768px)";

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

export type Device = "mobile" | "desktop";

export function useDevice(): Device {
  return useIsMobile() ? "mobile" : "desktop";
}