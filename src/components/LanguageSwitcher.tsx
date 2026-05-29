import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "ru", flag: "🇷🇺", label: "RU" },
  { code: "kk", flag: "🇰🇿", label: "KK" },
  { code: "en", flag: "🇬🇧", label: "EN" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) ?? "ru";

  const setLanguage = (lang: string) => {
    localStorage.setItem("heis_language", lang);
    void i18n.changeLanguage(lang);
  };

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map(({ code, flag, label }) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className={cn(
              "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-colors sm:gap-1 sm:px-2 sm:py-1 sm:text-xs",
              active
                ? "bg-[#EB001B] text-white"
                : "border border-transparent bg-transparent text-slate-600 hover:bg-slate-50",
            )}
            aria-pressed={active}
            aria-label={label}
          >
            <span aria-hidden>{flag}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
