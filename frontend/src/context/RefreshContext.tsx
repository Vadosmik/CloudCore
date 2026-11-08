import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type RefreshContextValue = {
  versions: Record<string, number>;
  invalidate: (key: string) => void;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<Record<string, number>>({});

  const invalidate = useCallback((key: string) => {
    setVersions((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }, []);

  return (
    <RefreshContext.Provider value={{ versions, invalidate }}>
      {children}
    </RefreshContext.Provider>
  );
}

function useRefreshContext() {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error("useRefresh must be used inside RefreshProvider");
  return ctx;
}

export function useVersion(key: string): number {
  return useRefreshContext().versions[key] ?? 0;
}

export function useInvalidate() {
  return useRefreshContext().invalidate;
}