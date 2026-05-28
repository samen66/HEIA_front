import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PageTitleContextValue {
  title: string | null;
  setPageTitle: (title: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);

  const setPageTitle = useCallback((next: string | null) => {
    setTitle(next);
  }, []);

  const value = useMemo(
    () => ({ title, setPageTitle }),
    [title, setPageTitle],
  );

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitleContext() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) {
    throw new Error("usePageTitleContext must be used within PageTitleProvider");
  }
  return ctx;
}
