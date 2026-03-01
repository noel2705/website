export const THEMES = ["opmode", "dark", "light"] as const;

export type ThemeName = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeName = "opmode";
export const THEME_STORAGE_KEY = "opdash-theme";

export function isThemeName(value: string): value is ThemeName {
  return THEMES.includes(value as ThemeName);
}
