# 02 — Firebase

Projet Firebase en offre **Blaze** (nécessaire pour Cloud Functions et App Hosting). Région : **`europe-west4`** (Pays-Bas) pour Firestore, Storage, Functions et App Hosting : c’est la seule région européenne proposée par App Hosting, et elle accepte aussi Firestore et Functions v2.

> Jusqu’à la mise en ligne (étape 11), on travaille **uniquement avec les émulateurs** : les projets Firebase n’existent pas encore.

## Firestore : collections
Les valeurs par défaut de chaque document sont dans `data/settings-defaults.json`. Le script `scripts/seed.ts` les écrit dans l’émulateur et en production.

### `settings/site` (1 document)
```ts
{
  phone: string            // "06 12 34 56 78"
  email: string
  hours: string            // "Lun – sam · 8 h – 19 h"
  adresse: string; siret: string; certification: string; assurance: string   // saisis par Guillaume, injectés dans le footer et les pages légales
  hero: { kicker: string; title: string; highlight: string; intro: string }  // intro peut contenir {communes}
  photos: { portraitUrl: string | null; portraitAlt: string; logoLightUrl: string | null; logoDarkUrl: string | null }
  updatedAt: Timestamp
}
```
> Dans la maquette : `hero.t1` → `title`, `hero.t2` → `highlight`. Logo `null` = logo par défaut du dépôt (`/public/logo-navy.png`, `/public/logo-white.png`).

### `settings/pricing` (1 document)
```ts
{
  bands: ["<30","30-60","60-100","100-150","150+"]
  grid: Record<PriceKey, [number, number, number, number, number]>   // € TTC par tranche
  // PriceKey = dpe | dpet | amiante | raat | plomb | electricite | gaz | carrez | termites | audit
  rules: { maison: number /* % */, annexe: number /* € */, packPct: number, packMin: number, d30: number /* € */, d40: number /* € */ }
  updatedAt: Timestamp
}
```

### `legalPages/{doc}` — `doc` ∈ `mentions-legales | cgv | confidentialite`
```ts
{ title: string; body: string /* markdown-lite : "## " = intertitre, ligne vide = paragraphe, {telephone} {email} {adresse} {siret} {certification} {assurance} remplacés depuis settings/site */; updatedAt: Timestamp }
```

### `articles/{id}`
```ts
{
  slug: string              // unique, index, [a-z0-9-]
  title: string; excerpt: string; body: string   // markdown-lite
  category: "DPE" | "Amiante" | "Plomb" | "Réglementation" | "Conseils vente" | "Conseils location"
  coverUrl: string | null; coverAlt: string
  published: boolean; publishedAt: Timestamp     // date affichée, modifiable
  createdAt: Timestamp; updatedAt: Timestamp
}
```
Index composite : `published ASC, publishedAt DESC`. L’unicité du slug est vérifiée dans la Server Action (requête `where('slug','==',…)` en transaction).

### `leads/{id}`
```ts
{
  ref: string               // "L-1001", "L-1002"… : compteur dans settings/counters (transaction)
  createdAt: Timestamp
  status: "nouveau" | "rappele" | "devis_envoye" | "gagne" | "perdu"
  contact: { nom: string; tel: string; email: string | null; profil: "particulier"|"agence"|"notaire"|"pro" }
  bien: {
    projet: "vente"|"location"|"travaux"|"autre"; loc?: "vide"|"meuble"|"saisonniere"; nature?: "travaux"|"demolition"
    type: "appartement"|"maison"|"local"|"immeuble"; commune: string /* slug */; adresse?: string
    surface: Band; pieces?: string; copro?: "oui"|"non"; annee: "avant1949"|"1949-1997"|"1997-2012"|"apres2012"|"nsp"
    gaz?: string; elec?: string; chauffage?: string; annexes: string[]; egout?: string; classe?: string; deja: string[]
  }
  rdv: { delai: string; creneau?: string; acces?: string }
  message: string
  diagnostics: { id: string; name: string; level: string; price: number | null }[]   // recalculé côté serveur
  estimate: { sub: number; remise: number; deplacement: number; total: number; surDevis: boolean }
  pricingSnapshot: { rules: …; updatedAt: Timestamp }   // pour savoir quel barème a servi
  notes: string             // notes internes de Guillaume
  consent: { at: Timestamp; text: string }
  meta: { ip: string /* HMAC-SHA256(ip, IP_HASH_SALT) */; userAgent: string; source: "site" }
}
```
Index : `status ASC, createdAt DESC` et `createdAt DESC`.

### `settings/counters`
`{ leadSeq: number }`, incrémenté en transaction à la création d’un lead. Absent = 1000 : la première référence est donc **L-1001**.

### `rateLimits/{ipHash}`
```ts
{ count: number; windowStart: Timestamp; expiresAt: Timestamp }   // expiresAt = windowStart + 1 h
```
Limite de débit du formulaire de devis : **5 devis par heure et par IP**. `ipHash` = HMAC-SHA256 de l’IP avec le secret `IP_HASH_SALT`. Lu et écrit uniquement par le serveur (admin SDK), en transaction. Une **règle TTL** Firestore sur `expiresAt` supprime les documents expirés. Aucun accès client (règle par défaut `false`).

### Qui lit et écrit quoi
| Collection | Public (navigateur) | Serveur Next (admin SDK) | Admin connecté (navigateur) |
|---|---|---|---|
| `settings/*` | lecture | lecture | écriture via Server Action |
| `legalPages` | lecture | lecture | écriture via Server Action |
| `articles` | lecture si `published` | lecture | écriture via Server Action |
| `leads` | **aucun accès** | création (devis) | lecture, mise à jour de `status` et `notes` |
| `rateLimits` | aucun accès | lecture / écriture | aucun accès |

Toutes les écritures admin passent par des **Server Actions** qui vérifient le cookie de session et le claim `admin`, valident avec zod, écrivent avec l’admin SDK, puis invalident le cache (`updateTag`, voir `01-architecture.md`). Les règles Firestore (`firestore.rules`) restent une seconde barrière si le SDK client est utilisé.

## Storage
```
/site/portrait.jpg           ≤ 1400 px, JPEG
/site/logo-light.png         ≤ 800 px, PNG (transparence conservée)
/site/logo-dark.png
/articles/{id}/cover.jpg     ≤ 1600 px
```
Écriture réservée à l’admin (`storage.rules`), lecture publique, 5 Mo max, `image/*` uniquement. L’extension *Resize Images* génère les variantes 640 et 1280 en WebP. `next/image` sert le reste.

## Authentification et page de connexion
- **Un seul compte**, créé à la main dans la console. Aucune inscription publique.
- Script `scripts/set-admin.ts <email>` : pose `customClaims: { admin: true }`.
- Flux :
  1. `/espace-proprietaire/connexion` : `signInWithEmailAndPassword` côté client.
  2. Le client envoie l’`idToken` à `POST /api/session`, qui vérifie le token et le claim, puis crée un **cookie de session** (`createSessionCookie`, 5 jours, `httpOnly`, `secure`, `sameSite=lax`).
  3. `proxy.ts` (nom de `middleware.ts` depuis Next 16) redirige vers `/connexion` si le cookie est absent. Le layout `(protege)` vérifie le cookie avec `verifySessionCookie(cookie, true)` (vérification de révocation) et le claim.
  4. Déconnexion : `DELETE /api/session` + `revokeRefreshTokens`.
- Lien « Mot de passe oublié » → `sendPasswordResetEmail`.
- Activer **App Check** et la protection contre l’énumération d’e-mails dans Firebase Auth.
- `robots: noindex` sur toutes les routes admin.

### Maquette de la page de connexion (non dessinée, à faire dans le style du dashboard)
- Fond `--color-surface` (#f2f5fb) plein écran, carte blanche centrée, largeur max 420 px, rayon 20 px, padding 40 px, ombre `0 30px 80px -20px rgba(3,10,40,.25)`.
- Logo navy 96 px en haut, puis kicker « Espace propriétaire » (13 px, 700, capitales, interlettrage 0,18em, `--color-accent`).
- Titre « Connexion » : 28 px, 800, `font-stretch:112%`, couleur `--color-accent-900`.
- Champs E-mail et Mot de passe (mêmes champs que l’admin : 44 px de haut minimum, rayon 10 px), lien « Mot de passe oublié ? », puis bouton primaire pleine largeur de 54 px, « Se connecter ».
- Erreur sous le bouton, fond `#fdecea`, texte `#b42318` : « E-mail ou mot de passe incorrect. » (même message dans tous les cas).
- Lien « ← Retour au site » sous la carte.

## Cloud Functions
- `onLeadCreated` (déclencheur Firestore `leads/{id}`) :
  - e-mail à Guillaume, à l’adresse `settings/site.email` (modifiable dans son espace) : objet `Nouvelle demande L-1001 · Aubagne · 925 €`, récapitulatif complet, bouton vers `${NEXT_PUBLIC_SITE_URL}/espace-proprietaire/demandes?id=…` ;
  - accusé de réception au client si un e-mail a été saisi.
- (Optionnel) `onLeadCreated` → SMS à Guillaume via Twilio.
- Secret dans Secret Manager : `RESEND_API_KEY`. Pas d’e-mail de destination en dur : il est lu dans `settings/site`.
- Expéditeur : tant que le domaine n’est pas choisi, l’adresse de test de Resend `onboarding@resend.dev` (variable `RESEND_FROM`). À remplacer par une adresse du domaine vérifié à la mise en ligne.

## Environnements
- **Émulateurs** (Auth, Firestore, Storage, Functions) pour le développement et tous les tests.
- Deux projets Firebase : `gts-diagnostic-staging` et `gts-diagnostic-prod`. Variables publiques `NEXT_PUBLIC_FIREBASE_*`, service account serveur dans `FIREBASE_SERVICE_ACCOUNT` (App Hosting : Secret Manager).
- Sauvegarde : export Firestore planifié chaque jour vers un bucket GCS.
- Cache Next (`"use cache"`) : en mémoire par instance. `updateTag` n’invalide que l’instance qui traite l’action ; à l’étape 11, soit limiter App Hosting à une instance (`maxInstances: 1`, suffisant pour ce trafic), soit brancher un `cacheHandlers` partagé.

## RGPD
- Fonction planifiée `purgeOldLeads` (cron mensuel) qui **anonymise** : les leads au statut `perdu` **12 mois** après leur `createdAt`, tous les autres **36 mois** après leur `createdAt` (nom, téléphone, e-mail, adresse, message et notes effacés ; statistiques conservées).
- Case de consentement obligatoire (déjà dans la maquette), avec le texte horodaté dans `consent`.
- Bandeau cookies maison, léger : **Accepter / Refuser**, choix mémorisé 6 mois. **Google Consent Mode v2** : `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` à `denied` par défaut, `analytics_storage` passe à `granted` sur « Accepter ». Le bandeau ne sert qu’à GA4.

## Variables d’environnement
`NEXT_PUBLIC_SITE_URL` (URL absolue du site, jamais en dur), `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT`, `IP_HASH_SALT` (secret), `RESEND_API_KEY` (secret), `RESEND_FROM`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. Modèle dans `.env.example`.
