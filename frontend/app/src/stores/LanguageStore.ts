import { create } from "zustand";

export interface Language {
  name: string;
}

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language | string) => void;
  getLanguage: () => Language;
}

export const useLanguageStore = create<LanguageState>()((set, get) => ({
  language: { name: "JavaScript" },

  setLanguage: (lang) =>
    set({ language: typeof lang === "string" ? { name: lang } : lang }),

  getLanguage: () => get().language,
}));

export const useLanguageName = () => useLanguageStore((s) => s.language.name);

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
  C: "c",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
  Kotlin: "kotlin",
  Swift: "swift",
  Ruby: "ruby",
  PHP: "php",
  Scala: "scala",
  Dart: "dart",
};

export const toMonacoLanguage = (name: string) =>
  MONACO_LANGUAGE_MAP[name] ?? name.toLowerCase();

export const useMonacoLanguage = () =>
  useLanguageStore((s) => toMonacoLanguage(s.language.name));