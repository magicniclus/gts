"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

type Toast = { id: number; tone: "success" | "error"; text: string };
const Ctx = createContext<(tone: Toast["tone"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-50 grid gap-2"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "flex items-center gap-2.5 rounded-field px-4 py-3 text-sm font-semibold shadow-[0_10px_30px_-12px_rgb(10_26_72/0.35)]",
              t.tone === "success"
                ? "bg-success-bg text-success-fg"
                : "bg-danger-bg text-danger-fg",
            )}
          >
            <Icon name={t.tone === "success" ? "check-circle" : "warning"} size={18} />
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
