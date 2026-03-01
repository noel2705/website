"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemeName } from "@/lib/theme";

const THEME_LABELS: Array<{ value: ThemeName; label: string }> = [
  { value: "opmode", label: "OPMODE (Aktuell)" },
  { value: "dark", label: "Darkmode" },
  { value: "light", label: "Lightmode" },
];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="dashboard-panel">
      <h2>Theme</h2>
      <p>Wähle dein Design für die Website.</p>

      <div className="theme-setting-grid">
        {THEME_LABELS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`theme-option${theme === item.value ? " active" : ""}`}
            onClick={() => setTheme(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
