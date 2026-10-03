# Déploiement sur Netlify

Le site est un Next.js 16 relié au projet Firebase `gtsimmo-de105`. Netlify construit le site à chaque
envoi sur la branche `main`.

## Avant le premier déploiement (une seule fois)

Ces étapes se font depuis votre ordinateur, avec le fichier `.env.local` (voir le README des commandes) :

1. Console Firebase : Authentication (e-mail / mot de passe) activé, base **Firestore** créée.
2. Règles et index : `npx firebase deploy --only firestore:rules,firestore:indexes --project gtsimmo-de105`
   (ajouter `,storage` une fois Storage activé, pour l’envoi des photos).
3. Contenus par défaut : `node --env-file=.env.local --import tsx scripts/seed.ts`
4. Compte administrateur : créer l’utilisateur dans Authentication, puis
   `node --env-file=.env.local --import tsx scripts/set-admin.ts votre@email.fr`

## Créer le site sur Netlify

1. Netlify → **Add new site** → **Import an existing project** → GitHub → dépôt `gts`, branche `main`.
   Netlify lit `netlify.toml` : rien à changer dans les réglages de build.
2. Avant de lancer le déploiement, **Site configuration → Environment variables** :

| Variable | Valeur | Secret |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<votre-site>.netlify.app` (puis votre domaine) | non |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `gtsimmo-de105` | non |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza…` (config web Firebase) | non |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `gtsimmo-de105.firebaseapp.com` | non |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `gtsimmo-de105.firebasestorage.app` | non |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:750839840299:web:…` | non |
| `NEXT_PUBLIC_USE_EMULATORS` | `false` | non |
| `FIREBASE_CLIENT_EMAIL` | champ `client_email` du fichier JSON du compte de service | oui |
| `FIREBASE_PRIVATE_KEY` | champ `private_key` du même fichier, **entre les guillemets**, tel quel (avec les `\n`) | oui |
| `IP_HASH_SALT` | longue chaîne aléatoire (la même qu’en local, ou une nouvelle) | oui |

Cocher **Contains secret values** pour les trois secrets. On utilise `FIREBASE_CLIENT_EMAIL` +
`FIREBASE_PRIVATE_KEY` plutôt que le JSON complet : les fonctions Netlify limitent l’ensemble des
variables à 4 Ko.

3. **Deploy**. Le build lit Firestore (tarifs, textes, articles) : les variables Firebase doivent être
   présentes dès le premier build.

## Après la mise en ligne

- Vérifier : accueil, une page ville, le formulaire de devis (envoyer une demande de test),
  `/espace-proprietaire` (connexion, modification d’un tarif puis affichage sur la page DPE).
- Espace propriétaire → Pages légales → Mentions légales : remplacer l’hébergeur (Vercel) par Netlify.
- Domaine : Netlify → **Domain management**, puis mettre à jour `NEXT_PUBLIC_SITE_URL` et redéployer.
- Google Search Console : envoyer `https://<domaine>/sitemap.xml`.

Les e-mails de notification (Cloud Function `onLeadCreated`) ne sont pas déployés : les demandes
s’affichent dans l’onglet **Demandes** de l’espace propriétaire.
