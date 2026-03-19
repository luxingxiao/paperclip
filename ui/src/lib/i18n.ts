import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import zh from "../locales/zh.json";

const STORAGE_KEY = "paperclip.language";

function detectLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    // ignore storage errors
  }
  const lang = navigator.language || "en";
  return lang.startsWith("zh") ? "zh" : "en";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: detectLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export function setLanguage(lang: "en" | "zh") {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
  i18n.changeLanguage(lang);
}

export { i18n };
export default i18n;
