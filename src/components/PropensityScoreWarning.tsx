import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PropensityScoreWarning() {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-400/90 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
          aria-hidden
        />
        <p>{t("warnings.propensity")}</p>
      </div>
    </div>
  );
}
