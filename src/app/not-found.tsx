import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="container-site section-y text-center">
      <p className="m-0 text-sm font-bold tracking-[0.18em] text-accent uppercase">Erreur 404</p>
      <h1 className="mt-4 mb-0 font-heading text-[clamp(32px,4.2vw,52px)] font-extrabold text-accent-900 stretch-115">
        Cette page n’existe pas.
      </h1>
      <p className="mx-auto mt-4 max-w-[48ch] text-lg text-text/75">
        Le lien est peut-être ancien. Les diagnostics et les communes desservies sont accessibles
        depuis l’accueil.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="secondary" icon="arrow-left" iconPosition="start">
          Retour à l’accueil
        </Button>
        <Button href="/devis" icon="arrow-right">
          Devis gratuit
        </Button>
      </div>
    </main>
  );
}
