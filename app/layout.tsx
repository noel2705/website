import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import NavigationBar from "@/components/NavigationBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OPHUB",
  description: "Du brauchst Informationen über aktuelle Auktionen oder Marktpreise?" +
      " Oder du möchtest deine Shards immer im Überblick haben? Dann ist diese Seite Perfekt für dich",
    icons: {
        icon: "/ghost.png",
    },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `(() => {
    const key = "${THEME_STORAGE_KEY}";
    const fallback = "${DEFAULT_THEME}";
    const allowed = ["opmode", "dark", "light"];
    const stored = window.localStorage.getItem(key);
    const theme = allowed.includes(stored || "") ? stored : fallback;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.setAttribute("data-theme", theme);
  })();`;

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider>
          <NavigationBar />
          {children}
      </ThemeProvider>
      </body>
    </html>
  );
}
