"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";

export type MenuLink = { href: string; label: string };

/**
 * Menu mobile (sous 768 px) : bouton « trois traits », panneau plein écran qui glisse depuis
 * la droite, page bloquée derrière, fermeture par la croix, Échap ou un lien.
 */
const noopSubscribe = () => () => {};

export function MobileMenu({
  logo,
  main,
  diagnostics,
  footer,
}: {
  logo: ReactNode;
  main: readonly MenuLink[];
  diagnostics: readonly MenuLink[];
  footer: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // Le panneau est rendu dans <body> : le flou de l’en-tête (backdrop-filter) piégerait
  // sinon ses positions « fixed » dans l’en-tête.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // Une navigation referme le menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) openButton.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={openButton}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
        className="grid size-11 flex-none cursor-pointer place-items-center rounded-field text-accent-900 hover:bg-accent-100 md:hidden"
      >
        <span aria-hidden className="grid w-[22px] gap-[5px]">
          <span className="h-0.5 rounded-pill bg-current" />
          <span className="h-0.5 rounded-pill bg-current" />
          <span className="h-0.5 rounded-pill bg-current" />
        </span>
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              aria-hidden
              onClick={close}
              className={cx(
                "fixed inset-0 z-40 bg-accent-900/50 transition-opacity duration-300 md:hidden",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />
            <div
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              inert={!open}
              className={cx(
                "fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-[440px] flex-col bg-white transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden",
                open ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex items-center justify-between border-b border-divider px-(--gutter) py-2.5">
                <Link
                  href="/"
                  onClick={close}
                  aria-label="GTS Diagnostic, accueil"
                  className="block"
                >
                  {logo}
                </Link>
                <button
                  ref={closeButton}
                  type="button"
                  aria-label="Fermer le menu"
                  onClick={close}
                  className="relative grid size-11 cursor-pointer place-items-center rounded-field text-accent-900 hover:bg-accent-100"
                >
                  <span
                    aria-hidden
                    className="absolute h-0.5 w-6 rotate-45 rounded-pill bg-current"
                  />
                  <span
                    aria-hidden
                    className="absolute h-0.5 w-6 -rotate-45 rounded-pill bg-current"
                  />
                </button>
              </div>

              <nav
                aria-label="Menu principal"
                className="flex-1 overflow-y-auto overscroll-contain px-(--gutter) py-6"
              >
                <ul className="m-0 grid list-none gap-1 p-0">
                  {main.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={close}
                        aria-current={pathname === l.href ? "page" : undefined}
                        className="flex min-h-12 items-center text-[22px] font-extrabold text-accent-900 stretch-108 hover:text-accent aria-[current=page]:text-accent"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 mb-2 text-[13px] font-bold tracking-[0.18em] text-accent uppercase">
                  Nos diagnostics
                </p>
                <ul className="m-0 grid list-none grid-cols-2 gap-x-4 p-0">
                  {diagnostics.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={close}
                        className="flex min-h-11 items-center text-[15px] font-semibold text-text hover:text-accent"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-divider px-(--gutter) pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
