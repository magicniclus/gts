# 05 — Tests

`npm test` lance tout sauf l’e2e. La CI (GitHub Actions) exécute : lint → typecheck → unit → rules → build → e2e → Lighthouse. Une PR ne peut pas être fusionnée si une étape échoue.

## 1. Unitaires (Vitest), `tests/unit/`
- `obligations.test.ts` : **table-driven**, un cas par ligne du tableau §2 de `03-tarifs-et-obligations.md`, plus les cas A à J. On vérifie `id`, `level` et `name`.
- `pricing.test.ts` : cas A à J (montants exacts), arrondi aux 5 €, immeuble → null, ERP → 0, variations des règles (`packMin`, `packPct`, `maison`, `annexe`, `d30`, `d40`), annexes qui ignorent la piscine.
- `city-content.test.ts` : les 252 combinaisons diagnostic × commune produisent un titre ≤ 60 caractères, une description ≤ 155 et une intro non vide. Pas deux intros identiques au sein d’un même secteur.
- `markdown-lite.test.ts` : intertitres, paragraphes, remplacement de `{telephone}`, `{email}` et `{communes}`.
- `slug.test.ts` : accents, apostrophes typographiques (`Berre-l’Étang` → `berre-l-etang`).
- `schemas.test.ts` : zod refuse une commune inconnue, un téléphone invalide, l’absence de consentement ; le honeypot rempli → rejet.
- Couverture exigée : **100 % sur `lib/domain`**, 80 % global.

## 2. Composants (Testing Library + Vitest, jsdom)
- `DevisWizard` : impossible d’avancer sans réponse ; « Location » fait apparaître « Type de location » ; « Travaux » fait apparaître « Nature du chantier » ; décocher un diagnostic met le total à jour ; le badge de remise apparaît au 3ᵉ diagnostic payant.
- `HomeHero` : les réponses passent à `/devis` (via `sessionStorage` ou les paramètres d’URL) et le wizard démarre à l’étape 2.
- `PriceGrid` : modifier une cellule appelle l’action avec la bonne clé et le bon index ; une valeur négative est refusée.
- `ImageUploader` : refuse un fichier non image et un fichier de plus de 5 Mo.
- Accessibilité : `vitest-axe` sur chaque composant de `site/` et `devis/`.

## 3. Règles de sécurité (`@firebase/rules-unit-testing`, émulateur), `tests/rules/`
- Anonyme : lit `settings/site` et les articles publiés ; **ne lit pas** les brouillons ; aucun accès à `leads` (ni lecture ni écriture) ; ne peut pas écrire `settings`.
- Utilisateur connecté **sans** claim admin : mêmes droits qu’un anonyme.
- Admin : lit et écrit tout ; sur `leads`, ne peut modifier que `status` et `notes`.
- Storage : un anonyme ne peut pas envoyer de fichier ; un admin est limité à 5 Mo et à `image/*`.

## 4. Intégration serveur (Vitest + émulateurs)
- `submitLead` : crée un lead avec `ref` séquentielle, **recalcule** le total (un total falsifié envoyé par le client est ignoré), écrit `pricingSnapshot`, déclenche la fonction e-mail (fournisseur d’e-mail simulé).
- Actions admin : refusées sans cookie de session ; `revalidateTag` appelé avec le bon tag.

## 5. End-to-end (Playwright, émulateurs + `next start`), `tests/e2e/`
1. **Parcours devis** : accueil → « Je vends » + Appartement + Marseille 8e → 6 étapes → envoi → confirmation avec référence → le lead apparaît dans l’admin.
2. **Connexion admin** : mauvais mot de passe → message générique ; bon mot de passe → `/espace-proprietaire/demandes` ; accès direct sans session → redirection vers la connexion ; déconnexion.
3. **Tarifs** : l’admin passe DPE < 30 m² à 120 € → la page `/diagnostic-dpe-marseille` affiche « Dès 120 € » (après revalidation) → l’estimation du devis en tient compte.
4. **Hero** : changer le titre → visible sur `/`.
5. **Articles** : créer un brouillon → absent de `/conseils` → le publier → présent dans `/conseils`, dans le sitemap et à `/conseils/[slug]`.
6. **Photos** : envoyer un portrait → affiché dans « Qui suis-je ».
7. **Pages légales** : modifier les CGV → `/cgv` mis à jour, `{telephone}` remplacé.
8. Mobile (iPhone 13) : parcours devis complet.

## 6. Qualité et SEO (CI)
- **Lighthouse CI** sur `/`, `/diagnostic-dpe-marseille`, `/diagnostic-dpe/aubagne`, `/devis`, `/conseils` : Performance ≥ 95, SEO = 100, Accessibilité ≥ 95, Bonnes pratiques ≥ 95.
- Script `scripts/check-seo.ts` : nombre d’URL du sitemap = 9 + 252 + statiques + articles publiés ; titres uniques ; chaque page a un `canonical`, un H1 unique et un JSON-LD valide (validé avec `schema-dts`).
- Liens cassés : `linkinator` sur le build.
