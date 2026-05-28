import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeiaLogoMark } from "@/components/HeiaLogo";
import { DemoDataBadge } from "@/components/layout/DemoDataBadge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/context/RoleContext";
import { getDefaultRouteForRole, ROLE_CARDS } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function RoleSelectionPage() {
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
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <DemoDataBadge />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <header className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <HeiaLogoMark />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EB001B]">
            Mastercard | Powered by ML
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hidden Entrepreneur Intelligence Agent
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Select your role to access a tailored HEIA workspace. Each view surfaces
            the insights most relevant to your function.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ROLE_CARDS.map(({ role, title, description, icon: Icon }) => (
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
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          HEIA · Mastercard Kazakhstan · Demo environment
        </p>
      </div>
    </div>
  );
}
