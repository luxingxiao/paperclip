import { useTranslation } from "react-i18next";
import { setLanguage } from "../lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  function toggle() {
    setLanguage(current === "zh" ? "en" : "zh");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={toggle}
      aria-label={current === "zh" ? "Switch to English" : "切换为中文"}
      title={current === "zh" ? "Switch to English" : "切换为中文"}
    >
      <span className="text-xs font-medium leading-none select-none">
        {current === "zh" ? "EN" : "中"}
      </span>
    </Button>
  );
}
