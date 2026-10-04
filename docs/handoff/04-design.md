# 04 — Design

Haute fidélité. Ouvrir les maquettes de `design/` à côté du code pendant l’intégration. Valeurs ci-dessous relevées dans le `<style>` d’en-tête et les styles inline des maquettes.

## Tokens
```css
--color-bg: #ffffff;        --color-surface: #f2f5fb;   --color-text: #0d1733;   --color-divider: #dde3ef;
--color-accent: #2156e3;    /* bleu du logo */
--color-accent-100: #eaf0fe; --color-accent-200: #d3e0fd; --color-accent-300: #a9c2fb; --color-accent-400: #7fa3f7;
--color-accent-500: #4d7df0; --color-accent-600: #1b47c4; --color-accent-700: #16389c; --color-accent-800: #0f2766;
--color-accent-900: #0a1a48; /* navy du logo : hero, sections sombres, barre latérale admin */
--color-accent-2: #f5b841;   /* jaune : remise, badge de demandes, très ponctuel */
--footer-bg: #070f2c;
--success-bg: #e3f4ea; --success-fg: #146c3a;  --warning-bg: #fdf0d3; --warning-fg: #7a5200;
--danger-bg: #fdecea;  --danger-fg: #b42318;   --neutral-fg: #4a5370;
/* Échelle DPE */ A #009c6d · B #52b153 · C #a5cc74 · D #f4e70f · E #f0b40f · F #eb8235 · G #d7221f
```
- Texte atténué : `color-mix(in srgb, var(--color-text) 65–80 %, transparent)` ; sur fond navy : `#fff` à 72–88 %.
- **Rayons** : 10 px (champs, boutons admin), 12 px (tuiles du devis, boutons du hero), 14–16 px (cartes), 20 px (carte devis du hero, portrait), 24 px (bandeau CTA), 999 px (pastilles).
- **Ombre** : seulement la carte devis du hero, `0 30px 80px -20px rgba(3,10,40,.55)`.
- **Conteneur** : `max-width: 1240px`, padding horizontal `clamp(20px, 4vw, 48px)`. Sections : `clamp(64px, 8vw, 112px)` en vertical.

## Typographie : Archivo (largeur variable)
| Rôle | Taille | Graisse | Autres |
|---|---|---|---|
| H1 hero | `clamp(38px, 5.2vw, 68px)` | 800 | `font-stretch:118%`, interligne 1.02, interlettrage −0,025em, `text-wrap:balance` |
| H1 pages | `clamp(32px, 4.2vw, 52–58px)` | 800 | stretch 115–118 % |
| H2 section | `clamp(30px, 3.6vw, 46px)` | 800 | stretch 115 %, −0,02em, interligne 1.06 |
| H2 carte / bloc | 19–24 px | 800 | stretch 108–112 % |
| Kicker | 13 px | 700 | capitales, 0,18em, trait 28 × 2 px devant |
| Corps | 15–17 px (article : 17 px, interligne 1.75) | 400 | `text-wrap: pretty` |
| Chiffres clés | `clamp(28px, 3vw, 38px)` | 800 | stretch 120 % |
| Petits libellés | 12–14 px | 600–700 | |

## Icônes
Phosphor **duotone**, couleur `--color-accent` (ou `--color-accent-400` sur fond navy). 18–20 px en ligne, 24–30 px dans les pastilles carrées de 46 px (fond `accent-100`, rayon 12).

## États
- Survol des tuiles et puces : bordure `--color-accent`. Sélection : bordure accent 1,5 px, fond `accent-100`, texte `accent-800`.
- Liens : `--color-accent`, survol `--color-accent-600`. Sur fond sombre : blanc à 72 %, puis blanc au survol.
- Focus clavier : `outline: 2px solid var(--color-accent); outline-offset: 2px` sur tous les éléments interactifs.
- Désactivé : opacité 45 %. Le bouton « Continuer » du devis reste désactivé tant que l’étape n’est pas valide.
- Zones cliquables ≥ 44 px de haut.

## Écrans
**Commun (site public)** : barre utilitaire navy 13 px (certification, horaires, « −15 % dès 3 diagnostics · ERP offert », textes liés aux réglages) → header collant blanc à 94 % avec flou d’arrière-plan (logo 52 px, téléphone avec pastille, bouton « Devis gratuit » ; aucun menu sur ordinateur, et sous 768 px un bouton « trois traits » qui ouvre un panneau plein écran glissant depuis la droite — liens principaux, diagnostics, bouton d’appel — page bloquée derrière, fermé par la croix, Échap ou un lien ; le téléphone de l’en-tête y est remplacé par un bouton d’appel flottant rond en bas à droite) → contenu → bandeau CTA navy arrondi (sauf sur `/devis`) → footer `#070f2c` (logo blanc, nom, téléphone, e-mail, 4 colonnes de liens SEO, ligne basse avec liens légaux, « Conseils & articles » et « Espace propriétaire »).

**Accueil** : hero navy à dégradé radial bleu en haut à droite, en 2 colonnes (texte éditable + 3 chiffres + 3 garanties | carte blanche « Devis gratuit en 2 min » avec l’étape 1 : 4 tuiles projet, puces type de bien, liste des communes, bouton qui ouvre `/devis` à l’étape 2 avec les réponses conservées) → bande de 4 garanties → diagnostics (3 cartes vedettes navy, bleu et clair, puis cartes blanches minimalistes en grille de 3) → échelle DPE → déroulé en 4 étapes → « Qui suis-je » (portrait 4:5 + certifications) → zones (recherche + secteurs) → FAQ.

**Diagnostic / Ville** : hero navy (fil d’Ariane, H1 en deux parties, intro, CTA), rangée de 4 faits, 3 blocs numérotés 01–03, FAQ, liens connexes, communes voisines (ville) ou les 84 communes (diagnostic).

**Devis** : fond `surface`. Stepper de 6 étapes (Projet, Le bien, Construction, Diagnostics, Rendez-vous, Coordonnées), carte blanche à gauche, panneau navy collant à droite (récapitulatif, obligations déduites, estimation, badge de remise), puis encart téléphone. Écran de confirmation après l’envoi.

**Articles** : hero navy court, grille de cartes (couverture 16:9 ou icône de catégorie sur navy, catégorie et date en capitales bleues, titre 21 px, résumé). **Article** : colonne de 780 px, fil d’Ariane, kicker catégorie et date, H1, chapeau 20 px, couverture, corps, bandeau brouillon si non publié, « À lire aussi » (3 cartes).

**Pages légales** : colonne de 820 px, H1, intertitres 20 px, paragraphes 16 px / 1.7.

**Espace propriétaire** : barre latérale navy de 250 px (logo blanc, « Espace propriétaire », 7 onglets avec icône, badge jaune du nombre de nouvelles demandes, « Retour au site » en bas), contenu sur `surface` avec cartes blanches de rayon 14–16.
- **Demandes** : 3 statistiques, lignes repliables (nom, date, référence, commune, projet, nombre de diagnostics, total, menu de statut coloré). Détail : 6 faits, pastilles des diagnostics, message, boutons Appeler, E-mail et Supprimer.
- **Articles** : liste (vignette, titre, catégorie et date, statut Publié ou Brouillon, Modifier), éditeur sur 2 colonnes (titre, adresse, catégorie, date, résumé, contenu | couverture, case Publié, Voir, Supprimer).
- **Page d’accueil** : 4 champs + aperçu navy en direct.
- **Tarifs** : tableau 10 × 5, règles de calcul, bouton « Rétablir les tarifs par défaut ».
- **Photos & logos** : 3 cartes (portrait 4:5, logo fond clair, logo fond foncé), Remplacer et Retirer.
- **Coordonnées** : téléphone, e-mail (aussi destinataire des demandes), horaires, adresse, SIRET, certification, assurance RC Pro.
- **Pages légales** : onglets en pastilles, titre et contenu, « Voir la page publiée ».
- Indicateur « Enregistré à hh:mm » en haut à droite. En production : bouton **Enregistrer** explicite par formulaire, plus un toast.

## Responsive
Toutes les grilles sont en `repeat(auto-fit|auto-fill, minmax(min(100%, Npx), 1fr))`, sans point de rupture fixe. Sous 640 px : le hero passe sur une colonne, la carte devis sous le texte, et la barre latérale admin passe au-dessus du contenu (prévoir un menu tiroir).

## Assets
`design/assets/gts-logo-navy.png` (fond clair), `gts-logo-white.png` (fond sombre), `gts-logo.jpg` (original). Portrait de Guillaume : à fournir. Icônes : Phosphor.
