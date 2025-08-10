"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function GlobalThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="w-14 h-14 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
      >
        {theme === "light" ? (
          <Moon className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sun className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover:rotate-12 transition-transform duration-300" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
