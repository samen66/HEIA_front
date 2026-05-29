import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRouteLabelKey, translateRole } from "@/lib/i18nLabels";
import { type UserRole } from "@/lib/roles";

interface Props {
  role: UserRole;
  attemptedPath: string;
}

export function AccessRestricted({ role, attemptedPath }: Props) {
  const { t } = useTranslation();
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const pageName = t(getRouteLabelKey(attemptedPath));

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="max-w-lg border-[var(--color-border)] shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EB001B]/10">
            <ShieldAlert className="h-6 w-6 text-[#EB001B]" aria-hidden />
          </div>
          <CardTitle>{t("common.access_restricted")}</CardTitle>
          <CardDescription>{t("common.access_restricted_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-[var(--color-muted-foreground)]">
          <p>
            {t("common.signed_in_as", {
              role: translateRole(t, role),
              page: pageName,
            })}
          </p>
          <p>{t("common.use_nav_or_change_role")}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => {
              clearRole();
              navigate("/");
            }}
          >
            {t("nav.change_role")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
