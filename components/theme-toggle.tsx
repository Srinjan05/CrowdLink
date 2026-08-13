"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme-provider";

function emptySubscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {!mounted ? (
        <Sun className="h-4 w-4" />
      ) : (
        <>
          <Sun
            className={`h-4 w-4 transition-all ${
              theme === "light" ? "scale-100 rotate-0" : "scale-0 -rotate-90"
            } absolute`}
          />
          <Moon
            className={`h-4 w-4 transition-all ${
              theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"
            } absolute`}
          />
        </>
      )}
    </button>
  );
}
