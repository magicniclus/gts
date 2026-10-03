import Link from "next/link";
import { Kicker } from "@/components/ui/Kicker";
import { Icon } from "@/components/ui/Icon";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/site/Logo";

/** Page de connexion (maquette décrite dans 02-firebase.md). */
export default function ConnexionPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-(--gutter) py-10">
      <div className="w-full max-w-[420px]">
        <div className="rounded-hero bg-white p-10 shadow-login max-sm:p-7">
          <Logo tone="navy" width={96} priority />
          <div className="mt-6">
            <Kicker>Espace propriétaire</Kicker>
          </div>
          <h1 className="mt-3 mb-0 font-heading text-[28px] font-extrabold text-accent-900 stretch-112">
            Connexion
          </h1>
          <LoginForm />
        </div>
        <Link
          href="/"
          className="mt-5 flex min-h-11 items-center justify-center gap-2 text-sm font-semibold"
        >
          <Icon name="arrow-left" size={16} />
          Retour au site
        </Link>
      </div>
    </main>
  );
}
