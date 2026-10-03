"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/session", { method: "DELETE" });
        router.replace("/espace-proprietaire/connexion");
        router.refresh();
      }}
      className="flex min-h-11 cursor-pointer items-center gap-2.5 px-3.5 text-left text-sm font-semibold text-white/78 hover:text-white disabled:opacity-45"
    >
      <Icon name="sign-out" size={18} />
      Se déconnecter
    </button>
  );
}
