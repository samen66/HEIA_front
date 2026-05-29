import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeiaLogoMark } from "@/components/HeiaLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { usePageTitleContext } from "@/context/PageTitleContext";
import { useRole } from "@/context/RoleContext";
import { getRouteLabelKey, translateRole } from "@/lib/i18nLabels";
import { ROLE_BADGE_CLASS, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  pathname: string;
  role: UserRole;
}

export function TopNavbar({ pathname, role }: Props) {
  const { t } = useTranslation();
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const { title: pageTitle } = usePageTitleContext();

  const displayTitle =
    pageTitle ?? t(getRouteLabelKey(pathname));

  const handleChangeRole = () => {
    clearRole();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex min-h-[3.75rem] flex-col gap-2 px-4 py-2.5 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:py-0 lg:min-h-16">
        <div className="flex min-w-0 items-center lg:justify-self-start">
          <HeiaLogoMark className="h-9 w-auto shrink-0 sm:h-10" />
        </div>

        <h1 className="truncate text-center text-sm font-semibold text-slate-800 sm:text-base lg:justify-self-center lg:px-4 lg:text-lg">
          {displayTitle}
        </h1>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5 lg:justify-self-end">
          <LanguageSwitcher />
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              ROLE_BADGE_CLASS[role],
            )}
          >
            {translateRole(t, role)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleChangeRole}
          >
            {t("nav.change_role")}
          </Button>
        </div>
      </div>
    </header>
  );
}
