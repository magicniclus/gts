# 01 — Architecture

## Stack
| Rôle | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 16, App Router**, `cacheComponents: true`, TypeScript strict | Pages SEO pré-rendues (`"use cache"` + `cacheTag`), Server Actions pour le devis |
| Style | **Tailwind CSS v4** avec les tokens de `04-design.md` déclarés en variables CSS (`@theme`) | Composants personnalisables par props, aucune feuille de style par page |
| Police | `next/font/google` : **Archivo** (axes `wdth` 62–125, `wght` 300–900), sous-ensemble latin, `display: swap` | Une seule police, à largeur variable (`font-stretch` 108–120 % sur les titres) |
| Icônes | `@phosphor-icons/react`, graisse **duotone**, importées une par une | Arbre JS minimal |
| Base de données | **Cloud Firestore** | Réglages, tarifs, articles, pages légales, leads |
| Fichiers | **Firebase Storage** + extension *Resize Images* | Portrait, logos, couvertures d’articles |
| Authentification | **Firebase Auth** (e-mail + mot de passe) + *custom claim* `admin` + cookie de session | Un seul compte propriétaire |
| Back-end | Server Actions Next.js avec `firebase-admin` ; **Cloud Functions v2** pour les e-mails | La création d’un lead ne passe jamais par le client Firestore |
| E-mails | **Resend** (ou extension Firebase *Trigger Email*) | Notification à Guillaume et accusé de réception au client |
| Anti-spam | Honeypot + **Firebase App Check** (reCAPTCHA Enterprise) + limite de débit par IP (5 devis / heure, collection `rateLimits`) | Formulaire public |
| Validation | **zod** (schémas partagés client/serveur) | |
| Formulaires admin | `react-hook-form` + zod | |
| Tests | **Vitest**, **Testing Library**, `@firebase/rules-unit-testing`, **Playwright**, Lighthouse CI | Voir `05-tests.md` |
| Hébergement | **Firebase App Hosting** (Next.js natif), région `europe-west4` | Tout dans le même projet Google. Mettre à jour l’hébergeur dans les mentions légales. |
| Analytics | GA4 via `@next/third-parties`, après consentement (bandeau maison Accepter / Refuser + Google Consent Mode v2) | Événement `generate_lead` à l’envoi du devis |

## Arborescence
```
.
├─ CLAUDE.md
├─ docs/handoff/                  ← ce dossier
├─ firebase.json  firestore.rules  storage.rules  firestore.indexes.json
├─ functions/                     ← Cloud Functions (e-mails sur nouveau lead)
│  └─ src/index.ts
├─ src/
│  ├─ app/
│  │  ├─ (site)/                  ← layout public : barre utilitaire + header + footer
│  │  │  ├─ page.tsx                                   /
│  │  │  ├─ diagnostic/[type]/page.tsx                 9 pages   ← servies en /diagnostic-{type}-marseille (rewrite)
│  │  │  ├─ diagnostic/[type]/[commune]/page.tsx       252 pages ← servies en /diagnostic-{type}/{commune} (rewrite)
│  │  │  ├─ zones-intervention/page.tsx
│  │  │  ├─ devis/page.tsx  devis/actions.ts           Server Action submitLead
│  │  │  ├─ conseils/page.tsx  conseils/[slug]/page.tsx
│  │  │  └─ (legal)/[doc]/page.tsx                     mentions-legales | cgv | confidentialite
│  │  ├─ espace-proprietaire/
│  │  │  ├─ connexion/page.tsx                         public
│  │  │  └─ (protege)/layout.tsx                       AdminShell + garde de session
│  │  │     ├─ page.tsx                                → redirige vers /demandes
│  │  │     ├─ demandes/page.tsx
│  │  │     ├─ articles/page.tsx  articles/[id]/page.tsx
│  │  │     ├─ accueil/page.tsx  tarifs/page.tsx  photos/page.tsx
│  │  │     ├─ coordonnees/page.tsx  pages-legales/[doc]/page.tsx
│  │  ├─ api/session/route.ts                          crée/supprime le cookie de session
│  │  ├─ sitemap.ts  robots.ts  opengraph-image.tsx
│  │  └─ layout.tsx  globals.css
│  ├─ components/
│  │  ├─ ui/          ← primitives sans logique métier
│  │  ├─ site/        ← blocs du site public
│  │  ├─ devis/       ← formulaire multi-étapes
│  │  └─ admin/       ← espace propriétaire
│  ├─ lib/
│  │  ├─ domain/      ← LOGIQUE PURE, 100 % testée, aucun import React ni Firebase
│  │  │  ├─ obligations.ts       diagList(answers, commune) → Obligation[]
│  │  │  ├─ pricing.ts           priceOf(), estimate()
│  │  │  ├─ city-content.ts      textes générés des pages ville
│  │  │  ├─ markdown-lite.ts     parse « ## » + paragraphes
│  │  │  └─ slug.ts
│  │  ├─ data/        ← communes.ts, diagnostics.ts, devis-options.ts (générés depuis docs/handoff/data)
│  │  ├─ firebase/    ← client.ts (navigateur), admin.ts (serveur), session.ts
│  │  ├─ repos/       ← settings.ts, pricing.ts, articles.ts, legal.ts, leads.ts (lecture/écriture typées + cache)
│  │  ├─ schemas/     ← schémas zod partagés
│  │  └─ seo/         ← metadata.ts, jsonld.ts
│  └─ proxy.ts        ← (ex-middleware, renommé en Next 16) protège /espace-proprietaire (hors /connexion)
├─ tests/
│  ├─ unit/  rules/  e2e/
└─ scripts/seed.ts    ← remplit l’émulateur et la prod avec settings-defaults.json
```

## Principes
1. **Le domaine est pur.** `lib/domain/*` ne connaît ni React ni Firebase. Les tarifs arrivent en paramètre. C’est ce qui rend l’algorithme testable et réutilisable côté serveur.
2. **Le prix est recalculé côté serveur.** Le client affiche une estimation, mais `submitLead` recalcule obligations et prix à partir des réponses et des tarifs Firestore. On n’enregistre jamais un montant envoyé par le navigateur.
3. **Les contenus SEO sont statiques.** Communes et fiches diagnostic sont dans le dépôt (`lib/data`). Seuls les réglages éditables par Guillaume vivent dans Firestore.
4. **Revalidation à la demande.** Les repos lisent Firestore dans des fonctions `"use cache"` avec `cacheLife('max')` et `cacheTag()` : `settings`, `pricing`, `articles`, `legal:{doc}`. Chaque écriture admin (Server Action) invalide ces tags avec `updateTag()` (lecture de ses propres écritures, l’équivalent Next 16 de `revalidateTag` dans une Server Action) ; hors Server Action (route handler, script), on utilise `revalidateTag(tag, 'max')`.
5. **Server Components par défaut.** Seuls ces composants sont client : formulaire de devis, recherche de commune (zones), accordéons FAQ (ou `<details>` natif, préférable), et toute l’administration.
6. **URL publiques et rewrites.** Next n’accepte pas de segment dynamique partiel (`diagnostic-[type]-marseille`). Les URL publiques restent `/diagnostic-{type}-marseille` et `/diagnostic-{type}/{commune}` ; `next.config.ts` les réécrit vers `/diagnostic/[type]` et `/diagnostic/[type]/[commune]`. Les chemins internes `/diagnostic/*` ne sont jamais liés et redirigent (301) vers l’URL publique.
7. **URL du site.** Le domaine n’est pas encore choisi : toute URL absolue (canonical, sitemap, Open Graph, JSON-LD, e-mails) part de `NEXT_PUBLIC_SITE_URL`, jamais en dur.

## Composants réutilisables
Chaque composant expose des **props de variante** plutôt que des copies. Les noms correspondent aux blocs visibles dans les maquettes.

### `ui/` (primitives)
| Composant | Props principales | Utilisé dans |
|---|---|---|
| `Button` | `variant: primary \| secondary \| ghost \| outlineOnDark`, `size: md \| lg`, `icon`, `iconPosition`, `asChild` (lien) | partout |
| `Tag` / `StatusPill` | `tone: accent \| navy \| success \| warning \| neutral` | obligations, statuts de lead, articles |
| `Kicker` | `tone: onLight \| onDark` (trait de 28 px + capitales espacées) | en-têtes de section |
| `SectionHeading` | `kicker`, `title`, `highlight` (fin du titre en bleu), `as: h1 \| h2`, `tone` | toutes les sections |
| `OptionTile` | `icon`, `label`, `hint`, `selected`, `layout: card \| pill \| row` | formulaire de devis (accueil + étapes) |
| `Checkbox`, `Field`, `Input`, `Select`, `Textarea` | `label`, `hint`, `error` | devis, admin |
| `Accordion` | base `<details>` | FAQ |
| `Breadcrumbs` | `items[]` + JSON-LD `BreadcrumbList` automatique | pages diagnostic, ville, article |
| `RichText` | `source` (markdown-lite) | articles, pages légales |
| `ImageFrame` | `ratio`, `fallbackIcon`, `src` | portrait, couvertures |

### `site/`
`UtilityBar` (certif., horaires, promo pack), `SiteHeader` (logo + téléphone + bouton devis ; **pas de menu**), `SiteFooter` (colonnes de liens SEO, liens légaux, lien Espace propriétaire), `HomeHero` (texte éditable + carte devis étape 1), `TrustStrip`, `DiagnosticCard` (`theme: navy | blue | light`, `featured`), `DiagnosticGrid`, `DpeScale`, `HowItWorks`, `AboutOwner`, `CityLinkGrid`, `SectorList`, `CommuneSearch`, `ContentHero` (pages diagnostic/ville), `FactsRow`, `NumberedBlocks`, `FaqSection`, `RelatedLinks`, `CtaBand`, `ArticleCard`, `ArticleGrid`.

### `devis/`
`DevisWizard` (état + navigation), `Stepper`, `StepProjet`, `StepBien`, `StepConstruction`, `StepDiagnostics`, `StepRendezVous`, `StepCoordonnees`, `EstimatePanel` (récap, obligations retenues, total, badge remise), `DevisSuccess`.

### `admin/`
`AdminShell` (barre latérale navy 250 px + contenu), `AdminNav`, `PageHeader` (titre, sous-titre, indicateur « Enregistré à hh:mm »), `StatCard`, `LeadList`, `LeadRow` (ligne repliable + `StatusSelect`), `HeroEditor` (+ aperçu en direct), `PriceGrid` (tableau 10 × 5 de champs numériques), `RulesForm`, `ImageUploader` (`ratio`, `maxSize`, `keepTransparency`), `ArticleList`, `ArticleEditor`, `LegalEditor`, `ContactForm`.

**Personnalisation :** toutes les couleurs passent par les tokens. Un composant n’a jamais de hex en dur. Les textes viennent des props ou de Firestore, jamais du composant.

## SEO
- `generateMetadata` par route : titre ≤ 60 caractères, description ≤ 155, `canonical` absolu, Open Graph. Les modèles de titre sont dans les maquettes (`metaTitle`, `metaDesc` dans `cityPage()` et `diagPage()`).
- JSON-LD : `ProfessionalService` (global), `Service` + `Offer` (pages diagnostic et ville), `FAQPage`, `BreadcrumbList`, `Article` (conseils). Téléphone et e-mail lus dans `settings/site`.
- Pages ville : texte généré à partir des attributs réels de la commune (`bati`, `km`, `secteur`), avec trois variantes d’accroche choisies par un hash du nom (voir `cityPage()` dans la maquette). À porter tel quel dans `lib/domain/city-content.ts`.
- Maillage : une page ville renvoie vers les 2 autres diagnostics de la même commune et 8 communes voisines du même secteur ; une page diagnostic renvoie vers les 84 communes.
- `sitemap.ts` : toutes les routes statiques, les 252 pages ville et les articles publiés (`lastModified` = `updatedAt`).
- Pas de `noindex` sauf sur `/espace-proprietaire/*` et `/devis?…`.

## Performance (budgets)
LCP < 1,8 s en 4G, CLS < 0,05, JS < 90 ko gzip sur l’accueil (hors formulaire, chargé en îlot), images en AVIF/WebP via `next/image`, aucune police tierce en plus d’Archivo.

> Mesures de l’étape 10 (Lighthouse mobile, 4G simulée) : performance 96 à 99, CLS 0, LCP 2,3 à 2,8 s (texte du H1 repeint au chargement d’Archivo, 88 ko). Le socle Next 16 + React 19 pèse à lui seul environ 195 ko gzip : le budget de 90 ko n’est pas atteignable avec l’App Router ; notre code ajoute 6 ko sur l’accueil et 17 ko sur `/devis`. `scripts/quality.sh` bloque toute page au-delà de 215 ko gzip.
