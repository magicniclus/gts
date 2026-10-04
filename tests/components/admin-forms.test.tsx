import { render, screen, waitFor, within } from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

const router = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() };
let pathname = "/espace-proprietaire/tarifs";
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => pathname }));

const auth = { signIn: vi.fn(), reset: vi.fn(), signOut: vi.fn() };
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...a: unknown[]) => auth.signIn(...a),
  sendPasswordResetEmail: (...a: unknown[]) => auth.reset(...a),
  signOut: (...a: unknown[]) => auth.signOut(...a),
}));
vi.mock("@/lib/firebase/client", () => ({ clientAuth: () => ({}) }));

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ArticleList } from "@/components/admin/ArticleList";
import { ContactForm } from "@/components/admin/ContactForm";
import { HeroEditor } from "@/components/admin/HeroEditor";
import { LeadList } from "@/components/admin/LeadList";
import { LegalEditor } from "@/components/admin/LegalEditor";
import { LoginForm } from "@/components/admin/LoginForm";
import { PhotoCards } from "@/components/admin/PhotoCards";
import { ToastProvider } from "@/components/admin/Toast";
import { DEFAULT_SITE } from "@/lib/defaults";
import type { ActionResult } from "@/lib/admin/result";
import type { LeadView } from "@/lib/repos/leads";
import type { Article } from "@/lib/schemas/content";

const user = userEvent.setup();
const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const ok = <T,>(data: T): ActionResult<T> => ({
  ok: true,
  savedAt: "2026-10-03T12:05:00.000Z",
  data,
});
const fail = (error: string, fieldErrors?: Record<string, string>): ActionResult<never> => ({
  ok: false,
  error,
  fieldErrors,
});

beforeEach(() => {
  vi.clearAllMocks();
  pathname = "/espace-proprietaire/tarifs";
});

describe("navigation de l’espace propriétaire", () => {
  it("onglet actif, badge des nouvelles demandes, menu tiroir", async () => {
    const { container } = render(
      <AdminShell newLeads={3} email="admin@exemple.fr">
        <h1>Contenu</h1>
      </AdminShell>,
    );
    const nav = screen.getByRole("navigation", { name: "Espace propriétaire" });
    expect(within(nav).getByRole("link", { name: /Tarifs/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: /Demandes/ })).toHaveTextContent("3");
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    await user.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("onglet d’une sous-page (pages légales)", () => {
    pathname = "/espace-proprietaire/pages-legales/cgv";
    render(<AdminNav newLeads={0} />);
    expect(screen.getByRole("link", { name: /Pages légales/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Demandes/ })).not.toHaveTextContent(/\d/);
  });

  it("déconnexion", async () => {
    const fetchMock = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminShell newLeads={0}>x</AdminShell>);
    await user.click(screen.getByRole("button", { name: "Se déconnecter" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/session", { method: "DELETE" });
    expect(router.replace).toHaveBeenCalledWith("/espace-proprietaire/connexion");
    vi.unstubAllGlobals();
  });
});

describe("LoginForm", () => {
  it("connexion réussie : cookie de session puis redirection", async () => {
    auth.signIn.mockResolvedValue({ user: { getIdToken: async () => "jeton" } });
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(
      null,
      "",
      "/espace-proprietaire/connexion?next=%2Fespace-proprietaire%2Ftarifs",
    );
    const { container } = render(<LoginForm />);
    expect(await axe(container)).toHaveNoViolations();
    await user.type(screen.getByLabelText("E-mail"), "admin@exemple.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "secret");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ idToken: "jeton" }) }),
    );
    expect(auth.signOut).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/espace-proprietaire/tarifs");
    vi.unstubAllGlobals();
  });

  it("échec : message générique ; mot de passe oublié", async () => {
    auth.signIn.mockRejectedValue(new Error("auth/wrong-password"));
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Mot de passe oublié ?" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saisissez votre e-mail");
    await user.type(screen.getByLabelText("E-mail"), "admin@exemple.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "x");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou mot de passe incorrect.");
    auth.reset.mockRejectedValue(new Error("auth/user-not-found"));
    await user.click(screen.getByRole("button", { name: "Mot de passe oublié ?" }));
    expect(screen.getByRole("status")).toHaveTextContent("Si un compte existe");
  });

  it("erreurs précises : trop de tentatives, compte sans accès", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.signIn.mockRejectedValueOnce(new FirebaseError("auth/too-many-requests", "bloqué"));
    render(<LoginForm />);
    await user.type(screen.getByLabelText("E-mail"), "admin@exemple.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "x");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Trop de tentatives");

    auth.signIn.mockResolvedValue({ user: { getIdToken: async () => "jeton" } });
    const body = JSON.stringify({
      error: "Ce compte n’a pas encore accès à l’espace propriétaire.",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(body, { status: 403 })),
    );
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("n’a pas encore accès"),
    );
    vi.unstubAllGlobals();
    quiet.mockRestore();
  });
});

const lead: LeadView = {
  id: "L-1042",
  ref: "L-1042",
  createdAt: "2026-10-02T15:42:00.000Z",
  status: "nouveau",
  nom: "Sophie Marchetti",
  tel: "06 21 44 87 10",
  email: "s.m@exemple.fr",
  profil: "Particulier",
  commune: "Aubagne",
  adresse: "",
  projet: "Je vends mon bien",
  bien: "Maison · 100 – 150 m²",
  annee: "1949 – juin 1997",
  rdv: "Cette semaine · Matin",
  diagnostics: ["DPE", "Amiante"],
  total: 925,
  surDevis: false,
  message: "Compromis fin octobre",
  notes: "",
};

describe("LeadList", () => {
  const actions = () => ({
    setStatus: vi.fn(async () => ok(undefined)),
    setNotes: vi.fn(async () => ok(undefined)),
    remove: vi.fn(async () => ok(undefined)),
  });

  it("statistiques, détail, statut, notes et suppression", async () => {
    const a = actions();
    const { container } = wrap(
      <LeadList
        leads={[lead, { ...lead, id: "L-1", ref: "L-1", status: "gagne", total: 0 }]}
        actions={a}
      />,
    );
    expect(screen.getByText("Nouvelles demandes").previousSibling).toHaveTextContent("1");
    expect(screen.getByText("Sur devis")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Sophie Marchetti.*L-1042/ }));
    expect(screen.getByText("« Compromis fin octobre »")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    await user.selectOptions(screen.getByLabelText("Statut de L-1042"), "rappele");
    expect(a.setStatus).toHaveBeenCalledWith({ id: "L-1042", status: "rappele" });
    expect(await screen.findByText("Statut enregistré.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Notes internes"), "Rappeler");
    await user.click(screen.getByRole("button", { name: "Enregistrer les notes" }));
    expect(a.setNotes).toHaveBeenCalledWith({ id: "L-1042", notes: "Rappeler" });

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(a.remove).toHaveBeenCalledWith({ id: "L-1042" });
    expect(await screen.findByText("Demande supprimée.")).toBeInTheDocument();
  });

  it("statut refusé : retour à l’ancien statut", async () => {
    const a = {
      ...actions(),
      setStatus: vi.fn(async () => fail("Session expirée : reconnectez-vous.")),
    };
    wrap(<LeadList leads={[lead]} initialOpen="L-1042" actions={a} />);
    await user.selectOptions(screen.getByLabelText("Statut de L-1042"), "perdu");
    expect(await screen.findByText("Session expirée : reconnectez-vous.")).toBeInTheDocument();
    expect(screen.getByLabelText("Statut de L-1042")).toHaveValue("nouveau");
  });

  it("aucune demande", () => {
    wrap(<LeadList leads={[]} actions={actions()} />);
    expect(screen.getByText("Aucune demande pour le moment.")).toBeInTheDocument();
  });
});

describe("formulaires de réglages", () => {
  it("HeroEditor : aperçu en direct et enregistrement", async () => {
    const save = vi.fn(async () => ok(undefined));
    const { container } = wrap(
      <HeroEditor initial={DEFAULT_SITE.hero} updatedAt={null} communes={69} save={save} />,
    );
    expect(screen.getByRole("region", { name: "Aperçu" })).toHaveTextContent("dans 69 communes");
    await user.clear(screen.getByLabelText("Titre"));
    await user.type(screen.getByLabelText("Titre"), "Nouveau titre,");
    expect(screen.getByRole("region", { name: "Aperçu" })).toHaveTextContent("Nouveau titre,");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: "Nouveau titre," }));
    expect(await screen.findByText(/Enregistré à/)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ContactForm : erreurs de validation et du serveur", async () => {
    const save = vi.fn(async () =>
      fail("Vérifiez les champs signalés.", { siret: "Le SIRET compte 14 chiffres." }),
    );
    const { phone, email, hours, adresse, siret, certification, assurance } = DEFAULT_SITE;
    wrap(
      <ContactForm
        initial={{ phone, email, hours, adresse, siret, certification, assurance }}
        updatedAt={null}
        save={save}
      />,
    );
    await user.clear(screen.getByLabelText("Téléphone"));
    await user.type(screen.getByLabelText("Téléphone"), "123");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).not.toHaveBeenCalled();
    expect(await screen.findByText("Numéro de téléphone invalide.")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Téléphone"));
    await user.type(screen.getByLabelText("Téléphone"), "06 12 34 56 78");
    await user.type(screen.getByLabelText("SIRET"), "12345678901234");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).toHaveBeenCalled();
    expect(await screen.findByText("Le SIRET compte 14 chiffres.")).toBeInTheDocument();
  });

  it("LegalEditor : onglets et enregistrement", async () => {
    const save = vi.fn(async () => ok(undefined));
    const { container } = wrap(
      <LegalEditor
        doc="cgv"
        initial={{ title: "CGV", body: "## Devis" }}
        updatedAt={null}
        save={save}
      />,
    );
    expect(screen.getByRole("link", { name: "CGV" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Voir la page publiée/ })).toHaveAttribute(
      "href",
      "/cgv",
    );
    await user.type(screen.getByLabelText("Titre de la page"), " 2026");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).toHaveBeenCalledWith({ doc: "cgv", title: "CGV 2026", body: "## Devis" });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PhotoCards", () => {
  it("retirer, logo d’origine et description du portrait", async () => {
    const remove = vi.fn(async () => ok(undefined));
    const saveAlt = vi.fn(async () => ok(undefined));
    const photos = {
      ...DEFAULT_SITE.photos,
      portraitUrl: "https://x.test/p.jpg",
      logoLightUrl: "https://x.test/l.png",
    };
    const { container } = wrap(
      <PhotoCards
        initial={photos}
        updatedAt={null}
        upload={vi.fn()}
        remove={remove}
        saveAlt={saveAlt}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(
      within(screen.getByRole("region", { name: "Portrait de Guillaume" })).getByRole("button", {
        name: "Retirer",
      }),
    );
    expect(remove).toHaveBeenCalledWith({ slot: "portrait" });
    expect(await screen.findByText("Photo retirée.")).toBeInTheDocument();
    await user.click(
      within(screen.getByRole("region", { name: "Logo, fond clair" })).getByRole("button", {
        name: "Logo d’origine",
      }),
    );
    expect(remove).toHaveBeenCalledWith({ slot: "logoLight" });
    await user.type(screen.getByLabelText("Description de la photo (référencement)"), " à Aubagne");
    await user.click(screen.getByRole("button", { name: "Enregistrer la description" }));
    expect(saveAlt).toHaveBeenCalledWith({
      portraitAlt: `${DEFAULT_SITE.photos.portraitAlt} à Aubagne`,
    });
  });
});

const article: Article = {
  id: "a9",
  slug: "nouvel-article-a9",
  title: "Nouvel article",
  excerpt: "",
  body: "",
  category: "Conseils vente",
  coverUrl: null,
  coverAlt: "",
  published: false,
  publishedAt: "2026-10-03",
  createdAt: null,
  updatedAt: null,
};

describe("articles", () => {
  it("liste : statut et lien Modifier", async () => {
    const { container } = render(
      <ArticleList
        articles={[
          article,
          {
            ...article,
            id: "b",
            title: "Publié",
            published: true,
            coverUrl: "https://x.test/c.jpg",
          },
        ]}
      />,
    );
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Modifier « Publié »" })).toHaveAttribute(
      "href",
      "/espace-proprietaire/articles/b",
    );
    expect(await axe(container)).toHaveNoViolations();
    render(<ArticleList articles={[]} />);
    expect(screen.getByText("Aucun article pour le moment.")).toBeInTheDocument();
  });

  it("éditeur : l’adresse suit le titre, publication, couverture, suppression", async () => {
    const save = vi.fn(async () => ok(undefined));
    const remove = vi.fn(async () => ok(undefined));
    const removeCover = vi.fn(async () => ok(undefined));
    const { container } = wrap(
      <ArticleEditor
        article={{ ...article, coverUrl: "https://x.test/c.jpg" }}
        save={save}
        remove={remove}
        uploadCover={vi.fn()}
        removeCover={removeCover}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.clear(screen.getByLabelText("Titre"));
    await user.type(screen.getByLabelText("Titre"), "Amiante : où chercher ?");
    expect(screen.getByLabelText("Adresse de la page")).toHaveValue("amiante-ou-chercher");
    await user.click(screen.getByRole("checkbox", { name: "Publié sur le site" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).toHaveBeenCalledWith({
      id: "a9",
      article: expect.objectContaining({
        title: "Amiante : où chercher ?",
        slug: "amiante-ou-chercher",
        published: true,
      }),
    });
    expect(await screen.findByRole("link", { name: /Voir l’article/ })).toHaveAttribute(
      "href",
      "/conseils/amiante-ou-chercher",
    );

    await user.clear(screen.getByLabelText("Adresse de la page"));
    await user.type(screen.getByLabelText("Adresse de la page"), "Mon Adresse");
    expect(screen.getByLabelText("Adresse de la page")).toHaveValue("mon-adresse");

    await user.click(
      within(screen.getByRole("region", { name: "Image de couverture" })).getByRole("button", {
        name: "Retirer",
      }),
    );
    expect(removeCover).toHaveBeenCalledWith({ id: "a9" });

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Supprimer l’article" }));
    expect(remove).toHaveBeenCalledWith({ id: "a9" });
  });

  it("éditeur : brouillon → lien d’aperçu, adresse invalide refusée", async () => {
    const save = vi.fn(async () => ok(undefined));
    wrap(
      <ArticleEditor
        article={{ ...article, slug: "deja-choisie" }}
        save={save}
        remove={vi.fn()}
        uploadCover={vi.fn()}
        removeCover={vi.fn()}
      />,
    );
    expect(screen.getByRole("link", { name: /Voir l’aperçu/ })).toHaveAttribute(
      "href",
      "/espace-proprietaire/articles/a9/apercu",
    );
    await user.clear(screen.getByLabelText("Titre"));
    await user.type(screen.getByLabelText("Titre"), "Autre titre");
    expect(screen.getByLabelText("Adresse de la page")).toHaveValue("deja-choisie");
    await user.clear(screen.getByLabelText("Adresse de la page"));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).not.toHaveBeenCalled();
  });
});
