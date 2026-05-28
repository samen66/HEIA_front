import { useNavigate } from "react-router-dom";
import { HeiaLogoMark } from "@/components/HeiaLogo";
import { DemoDataBadge } from "@/components/layout/DemoDataBadge";
import { Button } from "@/components/ui/button";
import { usePageTitleContext } from "@/context/PageTitleContext";
import { useRole } from "@/context/RoleContext";
import {
  getRouteLabel,
  ROLE_BADGE_CLASS,
  ROLE_LABELS,
  type UserRole,
} from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  pathname: string;
  role: UserRole;
}

export function TopNavbar({ pathname, role }: Props) {
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const { title: pageTitle } = usePageTitleContext();

  const displayTitle = pageTitle ?? getRouteLabel(pathname);

  const handleChangeRole = () => {
    clearRole();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex min-h-[3.75rem] flex-col gap-2 px-4 py-2.5 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:py-0 lg:min-h-16">
        <div className="flex min-w-0 items-center gap-3 lg:justify-self-start">
          <HeiaLogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              HEIA
            </p>
            <p className="hidden truncate text-[11px] leading-tight text-slate-500 sm:block sm:max-w-[220px] lg:max-w-[280px] xl:max-w-none">
              Hidden Entrepreneur Intelligence Agent
            </p>
          </div>
        </div>

        <h1 className="truncate text-center text-sm font-semibold text-slate-800 sm:text-base lg:justify-self-center lg:px-4 lg:text-lg">
          {displayTitle}
        </h1>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5 lg:justify-self-end">
          <DemoDataBadge className="order-3 w-full justify-center sm:order-1 sm:w-auto" />
          <span
            className={cn(
              "order-1 rounded-full px-2.5 py-1 text-xs font-semibold sm:order-2",
              ROLE_BADGE_CLASS[role],
            )}
          >
            {ROLE_LABELS[role]}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="order-2 shrink-0 sm:order-3"
            onClick={handleChangeRole}
          >
            Change Role
          </Button>
        </div>
      </div>
    </header>
  );
}
