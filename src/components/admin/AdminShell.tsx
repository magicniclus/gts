import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/site/Logo";
import { AdminNav } from "./AdminNav";
import { AdminSidebar } from "./AdminSidebar";
import { LogoutButton } from "./LogoutButton";
import { ToastProvider } from "./Toast";

/** Barre latérale navy de 250 px + contenu sur fond surface. */
export function AdminShell({
  children,
  newLeads,
  logoUrl,
  email,
}: {
  children: ReactNode;
  newLeads: number;
  logoUrl?: string | null;
  email?: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-wrap bg-surface">
      <AdminSidebar
        brand={
          <div className="grid gap-3.5 px-2.5 max-md:flex max-md:items-center max-md:gap-3">
            <Logo tone="white" src={logoUrl} width={96} />
            <span className="text-xs font-bold tracking-[0.16em] text-accent-400 uppercase">
              Espace propriétaire
            </span>
          </div>
        }
      >
        <AdminNav newLeads={newLeads} />
        <span className="flex-1" />
        <div className="grid gap-1">
          {email && <span className="truncate px-3.5 text-xs text-white/60">{email}</span>}
          <LogoutButton />
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2.5 px-3.5 text-sm font-semibold text-white/78 hover:text-white"
          >
            <Icon name="arrow-left" size={18} />
            Retour au site
          </Link>
        </div>
      </AdminSidebar>
      <main id="contenu" className="min-w-0 flex-[1_1_560px] p-[clamp(24px,3.5vw,48px)]">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
