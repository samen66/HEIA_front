import { useEffect, type ReactNode } from "react";
import { usePageTitleContext } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PageShell({ title, description, children, className }: Props) {
  const { setPageTitle } = usePageTitleContext();

  useEffect(() => {
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl min-w-0 space-y-6 px-4 py-6 sm:px-6 sm:py-8 xl:px-8",
        className,
      )}
    >
      {description && (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
