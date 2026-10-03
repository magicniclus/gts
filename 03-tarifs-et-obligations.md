# 03 — Obligations légales et algorithme de prix

Source de vérité : la méthode `diagList(f)` et le bloc `// devis` de `renderVals()` dans `design/Devis.dc.html`. À porter **à l’identique** dans `src/lib/domain/obligations.ts` et `src/lib/domain/pricing.ts`, en fonctions pures, avec les cas de test ci-dessous.

> ⚠️ Les montants de `settings-defaults.json` sont des valeurs de départ. Guillaume saisit ses vrais tarifs depuis l’onglet Tarifs. Les tests utilisent le barème par défaut figé dans `tests/fixtures/pricing.ts`.

## 1. Entrées
```ts
type Answers = {
  projet: "vente"|"location"|"travaux"|"autre"; loc?: "vide"|"meuble"|"saisonniere"; nature?: "travaux"|"demolition"
  type: "appartement"|"maison"|"local"|"immeuble"; commune: Commune; surface: "<30"|"30-60"|"60-100"|"100-150"|"150+"
  copro?: "oui"|"non"; annee: "avant1949"|"1949-1997"|"1997-2012"|"apres2012"|"nsp"
  gaz?: "aucun"|"moins15"|"plus15"; elec?: "moins15"|"plus15"|"nsp"; annexes: ("cave"|"garage"|"parking"|"jardin"|"combles"|"piscine")[]
  egout?: "oui"|"non"|"nsp"; classe?: "ad"|"efg"|"aucun"|"nsp"; deja: ("dpe"|"amiante"|"plomb"|"elec"|"gaz")[]
}
```
Dérivés : `hab = type !== "local"` · `vl = projet ∈ {vente, location}` · `sais = projet === "location" && loc === "saisonniere"` · `unk = annee ∈ {nsp, vide}` · `pre97 = annee ∈ {avant1949, 1949-1997}` · `pre49 = annee === "avant1949"`.

## 2. Obligations : `diagList(answers) → { id, priceKey, name, level, reason }[]`
`level` ∈ `Obligatoire | À vérifier | Conseillé | Optionnel | Déjà valide | Non requis | Info`.
**Cochés par défaut : `Obligatoire` et `À vérifier`.** Le client peut cocher ou décocher les autres (sauf `Info`).

| Diagnostic (priceKey) | Condition | Niveau |
|---|---|---|
| **DPE** (`dpe`, ou `dpet` si local) | `vl` | Obligatoire (Déjà valide si `deja ∋ dpe`) ; motif « meublé de tourisme » si `sais` |
| | `projet = autre` | Optionnel |
| **Amiante avant travaux / démolition** (`raat`) | `projet = travaux` et (`pre97` ou `unk`) | Obligatoire, ou À vérifier si `unk` |
| **Amiante vente** (`amiante`) | `vente` et (`pre97` ou `unk`) | Obligatoire / À vérifier / Déjà valide (`deja ∋ amiante`) |
| **Amiante DAPP** (`amiante`) | `location`, non `sais`, `hab`, (`pre97` ou `unk`), et (`copro = oui` ou appartement) | idem |
| **Plomb CREP** (`plomb`) | `hab`, `vl`, non `sais`, (`pre49` ou `unk`) | Obligatoire / À vérifier / Déjà valide |
| **Plomb avant travaux** | `hab`, `travaux`, (`pre49` ou `unk`) | Conseillé |
| **Électricité** | `hab`, `vl`, non `sais`, `elec ≠ moins15` | Obligatoire si `plus15`, sinon À vérifier ; Déjà valide si `deja ∋ elec` |
| **Gaz** | `hab`, `vl`, non `sais`, `gaz = plus15` | Obligatoire / Déjà valide |
| **Carrez** (`carrez`) | `vente` et `copro = oui` | Obligatoire |
| **Boutin** (`carrez`) | `location`, `hab`, non `sais` | Obligatoire si vide ; Conseillé si meublé |
| **Mesurage de surface** (`carrez`) | `vente`, `copro = non`, `hab` | Optionnel |
| **Termites** | `vente` (tout le 13 + communes du Var desservies) | Obligatoire |
| **ERP** | `vl`, non `sais` | Obligatoire ; motif ENSA (bruit aéroport) si `commune.peb` |
| **Audit énergétique** | `vente`, type maison ou immeuble, `copro ≠ oui` | Obligatoire si `classe = efg`, Non requis si `ad`, sinon À vérifier |
| **Assainissement (SPANC)** | `vente`, maison, `egout ∈ {non, nsp}` | Info, non chiffré (« Par le SPANC ») |

Communes PEB (bruit aéroport) : champ `peb` de `data/communes.json`.
Étape « Construction » : la question `classe` n’apparaît que si l’audit est possible ; la question `egout` seulement pour une maison à vendre.

## 3. Prix : `priceOf(priceKey, answers, pricing) → number | null`
```ts
const BANDS = ["<30","30-60","60-100","100-150","150+"]
function priceOf(pk, a, P): number | null {
  if (pk === "erp") return 0                               // toujours offert
  if (!(pk in P.grid)) return null                         // spanc → « Par le SPANC »
  if (a.type === "immeuble") return null                   // immeuble entier → « Sur devis »
  const si = Math.max(0, BANDS.indexOf(a.surface))
  let v = P.grid[pk][si]
  if (a.type === "maison" && ["dpe","amiante","plomb","electricite","termites"].includes(pk))
    v = v * (100 + P.rules.maison) / 100                   // +15 % par défaut
  const nAnnexes = a.annexes.filter(x => x !== "piscine").length
  if (["amiante","termites","raat"].includes(pk)) v += P.rules.annexe * nAnnexes   // +10 € par annexe
  return Math.round(v / 5) * 5                             // arrondi aux 5 € les plus proches
}
```
> Faire le calcul en entiers (`× (100+maison) / 100`) et non en `× 1.15`, pour éviter les erreurs d’arrondi flottant.

## 4. Estimation : `estimate(rows, commune, pricing)`
```ts
const selected = rows.filter(r => r.on)
const paid     = selected.filter(r => r.price !== null && r.price > 0)
const surDevis = selected.some(r => r.price === null && r.id !== "spanc")
const sub      = sum(paid.map(r => r.price))
const pack     = paid.length >= P.rules.packMin            // 3 par défaut ; l’ERP gratuit ne compte pas
const remise   = pack ? Math.round(sub * P.rules.packPct / 100 / 5) * 5 : 0   // 15 %
const deplacement = commune.km > 40 ? P.rules.d40 : commune.km > 30 ? P.rules.d30 : 0   // 30 € / 20 € / inclus
const total    = sub - remise + deplacement
```
Affichage : `Offert` si 0, `Sur devis` si null, sinon `X €`. Le panneau latéral montre sous-total, remise (badge « Pack −15 % »), déplacement (« Inclus » si 0) et total. Le prix « dès » des pages diagnostic et ville = `grid[pk][0]`.

## 5. Cas de test (barème par défaut)
| # | Réponses | Diagnostics cochés → prix | Sous-total | Remise | Dépl. | **Total** |
|---|---|---|---|---|---|---|
| A | Vente · appartement · 30–60 m² · avant 1949 · copro oui · élec +15 · gaz +15 · Marseille 8e | DPE 115, Amiante 95, Plomb 115, Élec 90, Gaz 85, Carrez 55, Termites 80, ERP 0 | 635 | 95 | 0 | **540** |
| B | Vente · maison · 100–150 m² · 1949–1997 · copro non · élec +15 · pas de gaz · garage + piscine · classe EFG · tout-à-l’égout · Aubagne (17 km) | DPE 180, Amiante 165, Élec 125, Termites 135, ERP 0, Audit 590 (mesurage Optionnel, non coché) | 1195 | 180 | 0 | **1015** |
| C | Comme A, à La Ciotat (32 km) | idem A | 635 | 95 | 20 | **560** |
| D | Comme A, à Istres (45 km) | idem A ; motif ERP « bruit aéroport » | 635 | 95 | 30 | **570** |
| E | Vente · immeuble · 150+ · avant 1949 | tous « Sur devis », ERP Offert | 0 | 0 | 0 | `surDevis = true` |
| F | Location vide · appartement · 30–60 · 1949–1997 · copro oui · élec −15 · pas de gaz · Marseille 1er | DPE 115, Amiante DAPP 95, Boutin 55, ERP 0 | 265 | 40 | 0 | **225** |
| G | Location saisonnière · appartement · 30–60 · avant 1949 | DPE 115 seul (motif meublé de tourisme), pas d’ERP | 115 | 0 | 0 | **115** |
| H | Comme A avec `deja = [dpe]` | DPE en « Déjà valide », non coché | 520 | 80 | 0 | **440** |
| I | Vente · appartement · 30–60 · année « Je ne sais pas » · copro oui · élec nsp | Amiante, Plomb et Électricité en « À vérifier » (cochés) | — | — | — | vérifier les niveaux |
| J | Vente · maison · garage + cave · 60–100 · 1949–1997 | Amiante = round5(115 × 1,15 + 20) = round5(152,25) = **150** ; Termites = round5(95 × 1,15 + 20) = **130** | — | — | — | vérifier les lignes |

Tests à ajouter aussi : `packMin = 4` désactive la remise du cas F ; `packPct = 0` ; changer `maison` à 0 ; local pro → `dpet` utilisé ; travaux + démolition → libellé « Amiante avant démolition ».

## 6. Côté serveur
`submitLead(answers, contact)` :
1. valider avec zod (communes : slug présent dans `communes.ts`) ;
2. charger `settings/pricing` ;
3. `diagList` → appliquer les cases que le client a cochées ou décochées (on reçoit seulement la liste des `id` cochés, jamais de prix) ;
4. `estimate` ;
5. écrire le lead avec `pricingSnapshot` ;
6. renvoyer `{ ref, total }` pour l’écran de confirmation.
