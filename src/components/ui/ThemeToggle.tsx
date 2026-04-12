"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"; // 👈

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="bg-[#ffff] fixed bottom-6 right-6 z-50 p-3 rounded-full border border-border bg-card hover:border-gold shadow-lg transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-gold" />
      ) : (
        <Moon className="w-5 h-5 text-gold" />
      )}
    </button>
  );
}
