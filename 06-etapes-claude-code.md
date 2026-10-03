# 06 — Ordre à suivre dans Claude Code

Une **session Claude Code par étape** (ou `/clear` entre deux étapes). Chaque étape se termine par des tests verts et un commit. Copiez le prompt tel quel.

---

## Étape 0 : préparation (vous, sans Claude)
1. Créez un dépôt GitHub vide `gts-diagnostic`, clonez-le, ouvrez un terminal dedans.
2. Copiez ce dossier dans `docs/handoff/` et `docs/handoff/CLAUDE.md` à la racine du dépôt.
3. Console Firebase : créez `gts-diagnostic-staging` (offre Blaze), activez Authentication (e-mail/mot de passe), Firestore (europe-west1), Storage et App Check.
4. Installez les outils : Node 20+, `npm i -g firebase-tools`, puis `firebase login`.
5. Rien à récupérer avant le développement : Guillaume saisira lui-même, depuis son espace, ses tarifs, son portrait, ses coordonnées (e-mail de réception des demandes compris), son SIRET, son adresse, sa certification, son assurance et le médiateur (onglet Pages légales, CGV).
6. Lancez `claude` à la racine.

---

## Étape 1 : socle du projet
```
Lis CLAUDE.md et tout docs/handoff/ (README puis 01 à 05). Ne code rien encore : résume l’architecture en 15 lignes et liste tes questions.
```
Répondez aux questions, puis :
```
Initialise le projet selon docs/handoff/01-architecture.md : Next.js 15 App Router, TypeScript strict, Tailwind v4, ESLint, Prettier, Vitest + Testing Library, Playwright, next/font Archivo (axes wdth et wght). Crée l’arborescence vide de src/, déclare les tokens de 04-design.md dans globals.css (@theme), ajoute les scripts npm de CLAUDE.md, et une CI GitHub Actions (lint, typecheck, test, build). Commit.
```

## Étape 2 : données statiques
```
Génère src/lib/data/communes.ts et diagnostics.ts, typés, à partir de docs/handoff/data/communes.json et diagnostics.json. Ajoute src/lib/data/devis-options.ts avec toutes les options du formulaire (objet L dans renderVals() de design/Devis.dc.html : libellés, icônes, indications). Ajoute slug.ts et ses tests. Commit.
```

## Étape 3 : logique métier (tests d’abord)
```
Implémente src/lib/domain/obligations.ts et pricing.ts selon docs/handoff/03-tarifs-et-obligations.md, en portant fidèlement diagList() et le bloc « devis » de design/Devis.dc.html. Commence par écrire les tests (cas A à J, plus chaque ligne du tableau §2), vérifie qu’ils échouent, puis implémente. Couverture 100 % sur lib/domain. Commit.
```
```
Porte cityPage() et diagPage() de design/Diagnostic-Ville.dc.html dans src/lib/domain/city-content.ts (fonctions pures qui prennent une commune, un diagnostic et un prix « dès »). Ajoute markdown-lite.ts. Écris les tests de 05-tests.md §1. Commit.
```

## Étape 4 : bibliothèque de composants
```
Crée les composants de src/components/ui et src/components/site listés dans 01-architecture.md, fidèles à design/Accueil.dc.html et 04-design.md. Props de variante, aucun hex en dur, focus visible, zones cliquables ≥ 44 px. Ajoute une page /dev/composants (exclue de la prod et du sitemap) qui montre chaque composant dans toutes ses variantes. Tests axe sur chaque composant. Commit.
```
Vérifiez visuellement `/dev/composants` en comparant avec les maquettes avant de continuer.

## Étape 5 : Firebase, émulateurs et règles
```
Configure Firebase selon docs/handoff/02-firebase.md : firebase.json (émulateurs Auth, Firestore, Storage, Functions), firestore.rules et storage.rules (copiés depuis docs/handoff), firestore.indexes.json, src/lib/firebase/{client,admin}.ts, les repos typés de src/lib/repos avec unstable_cache et des tags, et scripts/seed.ts qui écrit settings-defaults.json (renomme hero.t1 → title, hero.t2 → highlight). Écris les tests de règles de 05-tests.md §3. Commit.
```

## Étape 6 : pages publiques
```
Construis le layout (site) et les pages publiques : /, /diagnostic-[type]-marseille, /diagnostic-[type]/[commune] (generateStaticParams sur les 252 combinaisons), /zones-intervention, /conseils, /conseils/[slug], et /mentions-legales, /cgv, /confidentialite. Fidélité pixel aux maquettes design/*.dc.html. Données réglables lues dans Firestore via les repos. generateMetadata, JSON-LD (ProfessionalService, Service, FAQPage, BreadcrumbList, Article), sitemap.ts et robots.ts. Commit page par page.
```

## Étape 7 : formulaire de devis
```
Construis /devis : DevisWizard en 6 étapes, fidèle à design/Devis.dc.html (stepper, tuiles, questions conditionnelles, panneau d’estimation collant). Il utilise lib/domain pour les obligations et l’estimation en direct. La carte du hero de l’accueil transmet ses réponses et le wizard démarre à l’étape 2. Server Action submitLead selon 03 §6 : zod, honeypot, App Check, limite de débit, prix recalculé, ref séquentielle en transaction, pricingSnapshot. Écran de confirmation avec la référence. Tests composants et intégration de 05-tests.md. Commit.
```
```
Ajoute la Cloud Function onLeadCreated (functions/) : e-mail à Guillaume et accusé de réception au client via Resend, secrets dans Secret Manager. Teste-la avec l’émulateur et un fournisseur simulé. Commit.
```

## Étape 8 : authentification admin
```
Implémente l’authentification de 02-firebase.md : page /espace-proprietaire/connexion (maquette décrite dans 02), POST/DELETE /api/session (cookie de session), middleware.ts, garde dans le layout (protege) avec verifySessionCookie(checkRevoked) et le claim admin, scripts/set-admin.ts, mot de passe oublié, noindex. Tests e2e : connexion, refus, redirection, déconnexion. Commit.
```

## Étape 9 : espace propriétaire (un onglet par session)
Utilisez ce prompt **7 fois**, en remplaçant `<ONGLET>` par, dans l’ordre : **Demandes, Tarifs, Page d’accueil, Coordonnées, Photos & logos, Articles, Pages légales**.
```
Construis l’onglet <ONGLET> de l’espace propriétaire, fidèle à design/Espace-proprietaire.dc.html et 04-design.md. Formulaire react-hook-form + zod, bouton Enregistrer explicite, toast, Server Action protégée, puis revalidateTag sur les pages concernées. Images : envoi vers Storage selon 02-firebase.md. Ajoute le test e2e correspondant de 05-tests.md §5. Commit.
```

## Étape 10 : qualité
```
Lance l’ensemble des tests de 05-tests.md. Ajoute Lighthouse CI avec les seuils indiqués, scripts/check-seo.ts et linkinator dans la CI. Corrige tout ce qui échoue. Vérifie les budgets de performance de 01-architecture.md et le responsive à 360, 768 et 1280 px. Commit.
```

## Étape 11 : mise en ligne
```
Prépare le déploiement Firebase App Hosting : apphosting.yaml, secrets, variables d’environnement staging et prod, export Firestore quotidien, fonction planifiée purgeOldLeads (RGPD). Rédige docs/deploiement.md avec les commandes. Mets à jour l’hébergeur dans les mentions légales par défaut. Commit.
```
Ensuite, à faire par vous :
- `npm run seed` en production (valeurs par défaut) ;
- `set-admin` sur le compte de Guillaume, puis il remplit son espace : Tarifs, Coordonnées, Photos, Pages légales ;
- branchement du domaine ;
- Google Search Console (envoi du sitemap) ;
- fiche Google Business Profile avec exactement le même nom, la même adresse et le même téléphone.

---

### Conseils
- Si Claude s’écarte de la maquette : « Compare ton rendu avec design/X.dc.html section Y et liste les écarts avant de corriger. »
- Si une étape devient trop longue, demandez d’abord un plan : « Fais un plan en étapes numérotées, attends ma validation. »
- Gardez `docs/handoff/` à jour si une règle métier change (tarifs, obligations), puis demandez la mise à jour des tests avant celle du code.
