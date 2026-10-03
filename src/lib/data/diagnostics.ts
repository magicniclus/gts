// Fichier généré par scripts/generate-data.ts depuis docs/handoff/data. Ne pas modifier à la main.

import type { DiagnosticContent, DiagnosticId } from "./types";

export const DIAGNOSTICS = {
  dpe: {
    name: "DPE",
    long: "Diagnostic de performance énergétique",
    icon: "lightning",
    price: 100,
    valid: "10 ans",
    when: "Vente et location de tout logement",
    local: true,
    lead: "Le DPE classe le logement de A à G selon sa consommation d’énergie et ses émissions de gaz à effet de serre. Opposable depuis 2021, il conditionne désormais la mise en location. Depuis le 1er janvier 2026, le calcul valorise mieux l’électricité (coefficient 1,9 au lieu de 2,3).",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Dès la mise en vente ou en location d’un logement, le DPE doit figurer dans l’annonce. Depuis le 1er janvier 2025, les logements classés G ne peuvent plus être proposés à la location ; les F suivront en 2028, les E en 2034.",
      ],
      [
        "Comment se déroule la visite ?",
        "Relevé des surfaces, des parois, des menuiseries, du chauffage, de l’eau chaude et de la ventilation. Comptez 1 h 30 à 2 h pour un appartement. Préparez vos factures d’énergie et les justificatifs de travaux d’isolation.",
      ],
      [
        "Le DPE en climat méditerranéen",
        "Marseille est en zone climatique H3 : l’hiver pèse moins qu’ailleurs, mais le confort d’été entre dans le calcul. Volets, isolation de toiture et inertie des murs anciens comptent réellement dans la note.",
      ],
    ],
    faq: [
      [
        "Combien de temps le DPE est-il valable ?",
        "10 ans. Les DPE réalisés entre 2013 et 2017 ne sont plus valides, ceux de 2018 à juin 2021 ont expiré au 31 décembre 2024.",
      ],
      [
        "Mon logement est classé G, que faire ?",
        "Le rapport liste des travaux par priorité. Un audit énergétique chiffre ensuite un parcours de rénovation et les aides mobilisables.",
      ],
    ],
  },
  amiante: {
    name: "Amiante",
    long: "Constat de repérage amiante",
    icon: "warning-diamond",
    price: 85,
    valid: "Illimitée si absence",
    when: "Permis de construire avant le 1er juillet 1997",
    local: true,
    lead: "Interdit depuis 1997, l’amiante reste présent dans de nombreux bâtiments : dalles de sol, conduits en fibrociment, flocages, enduits. Le repérage protège l’acheteur, les occupants et les artisans.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "À la vente de tout bien dont le permis de construire a été délivré avant le 1er juillet 1997. En copropriété, le dossier amiante des parties privatives (DAPP) est exigé pour la location. Avant travaux ou démolition, un repérage spécifique s’impose au donneur d’ordre.",
      ],
      [
        "Comment se déroule le repérage ?",
        "Inspection des matériaux des listes A et B, sondages non destructifs et, si nécessaire, prélèvements analysés par un laboratoire accrédité. Le rapport localise chaque matériau et son état de conservation.",
      ],
      [
        "Les matériaux fréquents à Marseille",
        "Les résidences des années 1960-1970 des quartiers nord et est concentrent dalles vinyle-amiante, conduits de vide-ordures et toitures en fibrociment. Les maisons des années 1980 gardent souvent des plaques ondulées sur les annexes.",
      ],
    ],
    faq: [
      [
        "Le constat amiante a-t-il une durée de validité ?",
        "Illimitée lorsqu’il ne révèle pas d’amiante et qu’il a été réalisé après le 1er avril 2013. En présence d’amiante, une évaluation périodique peut être exigée.",
      ],
      [
        "Faut-il un diagnostic amiante avant travaux ?",
        "Oui : le repérage avant travaux est obligatoire pour tout chantier touchant les matériaux d’un bâtiment construit avant juillet 1997, y compris chez un particulier qui fait appel à une entreprise.",
      ],
    ],
  },
  plomb: {
    name: "Plomb",
    long: "Constat de risque d’exposition au plomb (CREP)",
    icon: "paint-roller",
    price: 100,
    valid: "1 an vente · 6 ans location",
    when: "Logement construit avant le 1er janvier 1949",
    local: true,
    lead: "Le CREP mesure la concentration en plomb des peintures et revêtements. Il concerne tous les logements construits avant 1949, très nombreux dans le centre de Marseille et les vieux villages de Provence.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "À la vente et à la location de tout logement construit avant le 1er janvier 1949, ainsi que pour les parties communes des immeubles de cette époque. Sans plomb détecté, le constat n’a pas à être renouvelé.",
      ],
      [
        "Comment se déroule la mesure ?",
        "Les revêtements sont mesurés à l’appareil à fluorescence X, pièce par pièce : portes, fenêtres, plinthes, garde-corps, murs. La mesure est instantanée et ne laisse aucune trace.",
      ],
      [
        "Le plomb dans le bâti marseillais",
        "Le trois-fenêtres marseillais et les immeubles du Panier, de Noailles ou de la Belle de Mai conservent souvent menuiseries et ferronneries d’origine, sous plusieurs couches de peinture au plomb.",
      ],
    ],
    faq: [
      [
        "Combien de temps le CREP est-il valable ?",
        "Un an pour une vente et six ans pour une location lorsqu’il révèle du plomb au-delà du seuil ; illimité si aucun revêtement ne dépasse 1 mg/cm².",
      ],
      [
        "Que se passe-t-il si du plomb est détecté ?",
        "Le rapport indique l’état des revêtements. Au-delà du seuil avec dégradation, le propriétaire doit réaliser des travaux et en informer les occupants.",
      ],
    ],
  },
  electricite: {
    name: "Électricité",
    long: "Diagnostic électricité",
    icon: "plug",
    price: 80,
    valid: "3 ans vente · 6 ans location",
    when: "Installation de plus de 15 ans",
    lead: "Contrôle visuel et fonctionnel de l’installation intérieure : tableau, prise de terre, dispositifs différentiels, liaisons équipotentielles, pièces d’eau.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Pour la vente et la location d’un logement dont l’installation électrique a plus de 15 ans.",
      ],
      [
        "Déroulé",
        "Environ une heure. Le courant est brièvement coupé pour tester les différentiels. Le rapport signale les anomalies et leur niveau de risque.",
      ],
      [
        "Après le diagnostic",
        "Les anomalies ne vous obligent pas à faire des travaux pour vendre, mais elles engagent la responsabilité du bailleur en location.",
      ],
    ],
    faq: [
      [
        "Le diagnostic électricité impose-t-il des travaux ?",
        "Non, il informe. Mais les anomalies graves engagent la responsabilité du bailleur en location.",
      ],
    ],
    local: false,
  },
  gaz: {
    name: "Gaz",
    long: "Diagnostic gaz",
    icon: "fire",
    price: 80,
    valid: "3 ans vente · 6 ans location",
    when: "Installation de plus de 15 ans",
    lead: "Vérification de l’installation intérieure de gaz : tuyauteries, raccordements, ventilation, appareils et évacuation des produits de combustion.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Pour la vente et la location d’un logement dont l’installation gaz a plus de 15 ans.",
      ],
      ["Déroulé", "45 minutes environ. Les appareils doivent être accessibles et alimentés."],
      [
        "Danger grave immédiat",
        "En cas de danger grave, l’alimentation est coupée et le distributeur prévenu, pour votre sécurité.",
      ],
    ],
    faq: [
      [
        "Et si le compteur est coupé ?",
        "Le diagnostic reste possible, mais certains contrôles de fonctionnement ne pourront pas être réalisés.",
      ],
    ],
    local: false,
  },
  carrez: {
    name: "Carrez / Boutin",
    long: "Mesurage loi Carrez ou Boutin",
    icon: "ruler",
    price: 45,
    valid: "Sans limite hors travaux",
    when: "Vente en copropriété · location",
    lead: "Mesure de la superficie privative (Carrez, pour une vente en copropriété) ou de la surface habitable (Boutin, pour une location).",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Carrez pour tout lot de copropriété vendu ; Boutin pour tout logement loué vide ou meublé.",
      ],
      [
        "Pourquoi le confier à un pro ?",
        "Une erreur de plus de 5 % permet à l’acheteur de demander une diminution du prix.",
      ],
      [
        "Ce qui est exclu",
        "Surfaces de moins de 1,80 m de hauteur, murs, cloisons, marches, gaines, embrasures.",
      ],
    ],
    faq: [
      [
        "Carrez et Boutin, quelle différence ?",
        "Boutin exclut en plus les combles non aménagés, caves, garages, balcons et vérandas.",
      ],
    ],
    local: false,
  },
  termites: {
    name: "Termites",
    long: "État relatif à la présence de termites",
    icon: "bug",
    price: 70,
    valid: "6 mois",
    when: "Vente : tout le 13 et l’ouest du Var",
    lead: "Recherche des indices d’infestation par les termites dans le bâti et ses abords.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Pour toute vente dans les Bouches-du-Rhône, déclarées zone termites sur tout le département par arrêté du 19 juillet 2001, et dans les communes varoises desservies (Bandol, Sanary, Saint-Cyr, Le Castellet…).",
      ],
      ["Déroulé", "Examen visuel et sondage des bois, dans le logement et les dépendances."],
      [
        "En cas de présence",
        "Le propriétaire doit déclarer l’infestation en mairie et engager un traitement.",
      ],
    ],
    faq: [
      [
        "Ma commune est-elle concernée ?",
        "Oui : tout le département des Bouches-du-Rhône est classé zone termites, ainsi que les communes varoises de notre zone. Le diagnostic est obligatoire à chaque vente.",
      ],
    ],
    local: false,
  },
  erp: {
    name: "ERP",
    long: "État des risques et pollutions",
    icon: "map-trifold",
    price: 0,
    valid: "6 mois",
    when: "Vente et location, partout",
    lead: "Informe l’acquéreur ou le locataire des risques naturels, miniers, technologiques, sismiques, du radon et du recul du trait de côte.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Pour toute vente et toute location, daté de moins de 6 mois. Il intègre l’information bruit (ENSA) près de l’aéroport Marseille-Provence.",
      ],
      ["Offert", "L’ERP est inclus gratuitement dans tous les packs GTS Diagnostic."],
      [
        "Risques locaux",
        "Incendie de forêt, inondation, submersion marine et séisme concernent de nombreuses communes du secteur.",
      ],
    ],
    faq: [
      [
        "Le littoral est-il concerné ?",
        "Oui : incendie de forêt, submersion marine et séisme concernent de nombreuses communes du secteur.",
      ],
    ],
    local: false,
  },
  audit: {
    name: "Audit énergétique",
    long: "Audit énergétique réglementaire",
    icon: "chart-line-up",
    price: 450,
    valid: "5 ans",
    when: "Vente d’une maison classée E, F ou G",
    lead: "Scénarios de travaux chiffrés pour atteindre une meilleure classe énergétique, obligatoires pour vendre une maison ou un immeuble en monopropriété mal classé.",
    blocks: [
      [
        "Quand est-il obligatoire ?",
        "Pour la vente d’une maison ou d’un immeuble en monopropriété classé F ou G depuis 2023, E depuis 2025.",
      ],
      [
        "Déroulé",
        "Visite approfondie, puis rapport avec deux parcours de travaux, gains et coûts.",
      ],
      [
        "À quoi il sert",
        "Il donne à l’acheteur une base chiffrée pour négocier et planifier ses travaux.",
      ],
    ],
    faq: [
      ["L’audit remplace-t-il le DPE ?", "Non, il le complète. Les deux sont remis à l’acquéreur."],
    ],
    local: false,
  },
} as const satisfies Record<DiagnosticId, DiagnosticContent>;
