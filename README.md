# Handoff : site GTS Diagnostic (Marseille)

Site vitrine et générateur de leads pour **GTS Diagnostic**, diagnostiqueur immobilier indépendant (Guillaume Tilliet), à Marseille et dans un rayon de 50 km. Objectifs : référencement local fort (pages par diagnostic × commune), formulaire de devis en 6 étapes qui déduit les diagnostics obligatoires et estime le prix, et espace propriétaire pour gérer les demandes, les tarifs, les textes, les photos, les articles et les pages légales.

## À propos des fichiers de design
Les fichiers de `design/` sont des **maquettes HTML de référence** : ils montrent l’apparence et le comportement attendus. Ce n’est **pas** du code de production à copier. Il faut **les recréer** en Next.js + Firebase selon l’architecture décrite ici. La logique métier (obligations, tarifs) est déjà écrite en JavaScript dans la classe `Component` en bas de chaque fichier : elle sert de **référence fonctionnelle** à porter en TypeScript, avec des tests.

Pour ouvrir les maquettes : servez le dossier `design/` en local (`npx serve design`) puis ouvrez `Accueil.dc.html`. Les pages sont reliées par de vrais liens.

## Fidélité
**Haute fidélité.** Couleurs, typographie, espacements, textes et interactions sont définitifs. Les tarifs par défaut, le portrait et les informations légales (SIRET, adresse, certification, assurance, médiateur) sont des valeurs de départ : Guillaume les saisit lui-même depuis son espace propriétaire après la mise en ligne.

## Sommaire
| Fichier | Contenu |
|---|---|
| `01-architecture.md` | Stack, arborescence, routes, composants réutilisables, SEO et performance |
| `02-firebase.md` | Firestore (collections, champs), règles de sécurité, Storage, Auth, page de connexion admin, Cloud Functions |
| `03-tarifs-et-obligations.md` | Algorithme des obligations légales et algorithme de prix, avec des cas de test chiffrés |
| `04-design.md` | Tokens (couleurs, typo, rayons), descriptions des écrans et des états |
| `05-tests.md` | Stratégie de test : unitaires, composants, règles Firestore, e2e, Lighthouse |
| `06-etapes-claude-code.md` | **L’ordre à suivre**, avec un prompt prêt à coller pour chaque étape |
| `CLAUDE.md` | À copier à la racine du dépôt : règles permanentes pour Claude Code |
| `firestore.rules`, `storage.rules` | Règles de sécurité prêtes à l’emploi |
| `data/` | `communes.json` (84 communes), `diagnostics.json` (contenus), `settings-defaults.json` (réglages, tarifs, articles et textes légaux par défaut), `leads-exemples.json` |
| `design/` | Les 12 maquettes + logos |

## Écrans (maquettes → routes de production)
| Maquette | Route Next.js | Rendu |
|---|---|---|
| `Accueil.dc.html` | `/` | SSG + revalidation à la demande |
| `Diagnostic.dc.html?d=dpe` | `/diagnostic-[type]-marseille` (9) | SSG |
| `Diagnostic-Ville.dc.html?d=dpe&ville=aubagne` | `/diagnostic-[type]/[commune]` (3 × 84 = 252) | SSG + ISR |
| `Zones.dc.html` | `/zones-intervention` | SSG |
| `Devis.dc.html` | `/devis` | SSG + composant client |
| `Articles.dc.html` | `/conseils` | SSG + revalidation à la demande |
| `Article.dc.html?a=slug` | `/conseils/[slug]` | SSG + revalidation à la demande |
| `Mentions-legales`, `CGV`, `Confidentialite` | `/mentions-legales`, `/cgv`, `/confidentialite` | SSG + revalidation à la demande |
| `Espace-proprietaire.dc.html` | `/espace-proprietaire/*` | Dynamique, protégé |
| *(non maquettée)* | `/espace-proprietaire/connexion` | Voir `02-firebase.md` |
| `Architecture-SEO.dc.html` | — | Fiche technique, pas une page publique |

## Démarrage rapide
1. Lire `06-etapes-claude-code.md` et suivre les étapes **dans l’ordre**, une session Claude Code par étape.
2. Copier ce dossier dans le dépôt sous `docs/handoff/`, et `CLAUDE.md` à la racine.
3. Ne jamais passer à l’étape suivante tant que les tests de l’étape en cours ne sont pas verts.
