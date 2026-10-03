# CLAUDE.md — GTS Diagnostic

Site Next.js 16 + Firebase d’un diagnostiqueur immobilier à Marseille. Toute la spécification est dans `docs/handoff/` : la lire avant chaque tâche.

## Règles permanentes

- TypeScript strict. Aucun `any`, aucun `@ts-ignore`.
- `src/lib/domain/` est **pur** : aucun import React, Next ou Firebase. 100 % de couverture de tests.
- Les maquettes `docs/handoff/design/*.dc.html` sont la référence visuelle et fonctionnelle. Les reproduire fidèlement, **sans copier leur code** : leur logique JS sert seulement de spécification.
- Couleurs, rayons et typographie : uniquement via les tokens de `globals.css` (voir `04-design.md`). Jamais de hex en dur dans un composant.
- Server Components par défaut. `"use client"` seulement là où c’est indispensable (devis, recherche de commune, administration).
- Toute écriture Firestore passe par une Server Action qui vérifie la session admin, valide avec zod, écrit avec l’admin SDK, puis invalide le cache avec `updateTag` (lectures en `"use cache"` + `cacheTag`, jamais `unstable_cache`).
- Le prix d’un devis est **toujours recalculé côté serveur**.
- Aucune URL absolue ni domaine en dur : `NEXT_PUBLIC_SITE_URL`.
- Next 16 : `proxy.ts` (et non `middleware.ts`), `cacheComponents: true`. En cas de doute sur une API, lire `node_modules/next/dist/docs/`.
- Jusqu’à l’étape 11, Firebase tourne uniquement en émulateurs.
- Textes de l’interface en français, typographie française : espaces insécables avant `: ; ? ! €`, apostrophe `’`, guillemets « ».
- Avant de dire qu’une tâche est terminée : `npm run lint && npm run typecheck && npm test` doivent passer.
- Ne jamais ajouter de dépendance sans le justifier dans la PR.
- Petits commits, un sujet par commit, message en français à l’impératif.

## Commandes

- `npm run dev` : Next + émulateurs Firebase (`firebase emulators:start --import=.emulator-data`)
- `npm test` : unitaires + composants + règles · `npm run e2e` : Playwright
- `npm run seed` : remplit l’émulateur avec `docs/handoff/data/settings-defaults.json`
- `npm run lint` · `npm run typecheck` · `npm run format`

@AGENTS.md
