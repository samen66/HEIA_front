import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeiaLogoMark } from "@/components/HeiaLogo";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/context/RoleContext";
import { translateRole, translateRoleDescription } from "@/lib/i18nLabels";
import { getDefaultRouteForRole, ROLE_CARDS } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function RoleSelectionPage() {
  const { t } = useTranslation();
  const { setRole, clearRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    clearRole();
  }, [clearRole]);

  const handleSelect = (role: (typeof ROLE_CARDS)[number]["role"]) => {
    setRole(role);
    navigate(getDefaultRouteForRole(role), { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <header className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <HeiaLogoMark className="h-auto max-h-32 w-auto max-w-full sm:max-h-36" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EB001B]">
            {t("common.brand_tagline")}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {t("roles.select_title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            {t("roles.select_subtitle")}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
            {t("roles.select_hint")}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ROLE_CARDS.map(({ role, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleSelect(role)}
              className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB001B] focus-visible:ring-offset-2 rounded-lg"
            >
              <Card
                className={cn(
                  "h-full transition-all hover:border-[#F79E1B]/60 hover:shadow-md",
                  "group-hover:-translate-y-0.5",
                  role === "judge_demo" &&
                    "border-[#F79E1B]/40 bg-gradient-to-br from-white to-orange-50/50",
                )}
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white group-hover:bg-[#0A1628]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    {translateRole(t, role)}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {translateRoleDescription(t, role)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          {t("common.footer_tagline")}
        </p>
      </div>
    </div>
  );
}
