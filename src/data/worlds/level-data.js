"use strict";
// Généré depuis data/levels/*.json par tools/level_files.py ; ne pas éditer.
const LEVEL_FILES = (typeof window !== "undefined" && window.__LEVEL_FILES) || {
  "w1-tuto": {
    "id": "w1-tuto",
    "name": "TUTORIEL",
    "type": "tuto",
    "threat": 1,
    "tuto": true,
    "bg": "horizon",
    "reward": {
      "clear": 10,
      "first": 20
    },
    "world": "w1",
    "schemaVersion": 2,
    "goal": {},
    "waves": [],
    "events": [],
    "spawnClock": "mission",
    "spawns": [],
    "intro": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 1,
      "seconds": 90
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "tutorial": {
      "steps": {
        "moveNeed": 420,
        "satTarget": 12,
        "bossWait": 3.6,
        "maxMove": 30,
        "maxShoot": 90
      },
      "sats": {
        "hp": 30,
        "speedMin": 60,
        "speedMax": 105,
        "slowSpeed": 55,
        "drift": 22,
        "score": 25,
        "contactDmg": 10,
        "spawnCdStart": 1500,
        "spawnCdEnd": 650,
        "rampTime": 40,
        "capBase": 3,
        "capExtra": 3,
        "capEvery": 14
      },
      "debris": {
        "min": 5,
        "max": 8,
        "dmg": 7,
        "speedMin": 75,
        "speedMax": 150
      },
      "boss": {
        "hp": 700,
        "p2": 0.66,
        "p3": 0.33,
        "contactDmg": 15,
        "killScore": 500,
        "aimCd": 1500,
        "aimCd3": 1100,
        "aimDmg": 9,
        "aimSpeed": 230,
        "ringCd": 4200,
        "ringCount": 16,
        "ringGap": 2,
        "ringDmg": 8,
        "ringSpeed": 135,
        "rainCd": 1700,
        "rainDmg": 8,
        "rainSpeed": 265,
        "spiralCd": 140,
        "spiralDmg": 7,
        "spiralSpeed": 150
      },
      "comp": {
        "sats": 30,
        "boss": 35,
        "win": 15,
        "clean": 20,
        "hitPenalty": 0.25
      },
      "rewards": {
        "m25": 5,
        "m50": 10,
        "m75": 15,
        "m100": 40
      }
    }
  },
  "w1-l1": {
    "id": "w1-l1",
    "name": "PERTURBATIONS LOCALES",
    "type": "survive",
    "threat": 1,
    "bg": "debris",
    "goal": {
      "seconds": 60
    },
    "intro": "earth",
    "spawns": [],
    "finalBoss": "meteo",
    "reward": {
      "clear": 20,
      "first": 40
    },
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "sat",
        "at": 2,
        "count": 4,
        "spacing": 0.6,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "satgun",
        "at": 7,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 35,
        "y": 0,
        "alert": 1
      },
      {
        "type": "shooter",
        "at": 12,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "drone",
        "at": 18,
        "count": 3,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "satgun",
        "at": 23,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "sat",
        "at": 28,
        "count": 4,
        "spacing": 0.6,
        "formation": "column",
        "spread": 100,
        "x": 25,
        "y": 0,
        "alert": 1
      },
      {
        "type": "turret",
        "at": 34,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 72,
        "y": 0,
        "alert": 1
      },
      {
        "type": "shooter",
        "at": 35,
        "count": 3,
        "spacing": 0.7,
        "formation": "column",
        "spread": 90,
        "x": 28,
        "y": 0,
        "alert": 1
      },
      {
        "type": "drone",
        "at": 41,
        "count": 5,
        "spacing": 0,
        "formation": "star",
        "spread": 170,
        "x": 60,
        "y": 0,
        "alert": 3
      },
      {
        "type": "satgun",
        "at": 47,
        "count": 2,
        "spacing": 0.7,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "shooter",
        "at": 49,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "sat",
        "at": 54,
        "count": 3,
        "spacing": 0.5,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 1
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 28,
        "duration": 4,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.33,
      "end": 0.955,
      "seconds": 54
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Le signal de l'antenne a réveillé le réseau météo. Votre ordre de nettoyage reste valable."
      ],
      "boss": [
        "La station météo vous classe comme une perturbation locale. Elle prépare le traitement."
      ],
      "progress": [
        "Les patrouilles protègent les installations déclarées abandonnées.",
        "Le réseau météo coordonne encore la défense du secteur.",
        "Le poste de contrôle météo répond toujours. Il faudra le mettre hors service."
      ],
      "banter": [
        "Le matériel est abandonné sur les formulaires. Sur place, il conserve ses habitudes.",
        "Vous êtes autorisé à nettoyer. Eux ne semblent pas avoir reçu la copie."
      ],
      "lowhp": [
        "Votre coque se dégrade. Évitez de fournir des déchets supplémentaires."
      ],
      "win": [
        "Réseau météo neutralisé. Les machines de récupération restent actives dans le secteur voisin."
      ],
      "lose": [
        "Intervention interrompue. Le réseau météo conserve votre classification : intrusion."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w1-l1-targeting",
          "when": "time",
          "at": 24,
          "text": "Ils partagent leurs données de ciblage. Les déchets font preuve d'un bel esprit d'équipe."
        },
        {
          "id": "w1-l1-owner",
          "when": "time",
          "at": 45,
          "text": "Météo et patrouilles : même propriétaire. Les consignes de défense n'ont pas été annulées."
        },
        {
          "id": "w1-l1-boss",
          "when": "bossStart",
          "text": "La station météo vous classe comme une perturbation locale. Elle prépare le traitement."
        },
        {
          "id": "w1-l1-report",
          "when": "win",
          "text": "Réseau météo neutralisé. Les machines de récupération restent actives dans le secteur voisin."
        }
      ]
    }
  },
  "w1-l2": {
    "id": "w1-l2",
    "name": "RECUPERATION PRIORITAIRE",
    "type": "survive",
    "threat": 1,
    "bg": "station",
    "goal": {
      "seconds": 75
    },
    "spawns": [],
    "finalBoss": "araignee",
    "reward": {
      "clear": 25,
      "first": 50
    },
    "events": [
      {
        "kind": "crystal",
        "at": 31,
        "duration": 4,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "sat",
        "at": 2,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "bras",
        "at": 7,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1,
        "tier": 1
      },
      {
        "type": "shooter",
        "at": 13,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "tank",
        "at": 18,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 65,
        "y": 0,
        "alert": 1
      },
      {
        "type": "bras",
        "at": 22,
        "count": 2,
        "spacing": 0,
        "formation": "line",
        "spread": 140,
        "x": 50,
        "y": 0,
        "alert": 1,
        "tier": 1
      },
      {
        "type": "healer",
        "at": 24,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "sat",
        "at": 31,
        "count": 4,
        "spacing": 0.5,
        "formation": "column",
        "spread": 100,
        "x": 27,
        "y": 0,
        "alert": 1
      },
      {
        "type": "tank",
        "at": 37,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 60,
        "y": 0,
        "alert": 1
      },
      {
        "type": "bras",
        "at": 41,
        "count": 3,
        "spacing": 0,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 1,
        "tier": 2
      },
      {
        "type": "healer",
        "at": 43,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "shooter",
        "at": 48,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "bras",
        "at": 55,
        "count": 2,
        "spacing": 0,
        "formation": "line",
        "spread": 150,
        "x": 50,
        "y": 0,
        "alert": 2,
        "tier": 2
      },
      {
        "type": "tank",
        "at": 57,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 70,
        "y": 0,
        "alert": 1
      },
      {
        "type": "healer",
        "at": 59,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "shooter",
        "at": 63,
        "count": 3,
        "spacing": 0.6,
        "formation": "column",
        "spread": 100,
        "x": 28,
        "y": 0,
        "alert": 2
      },
      {
        "type": "sat",
        "at": 66,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 1
      }
    ],
    "spawnClock": "mission",
    "intro": null,
    "boss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.31,
      "end": 0.91,
      "seconds": 67.5
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Les machines récupèrent les débris avant nous. Leur mise hors service figure pourtant au dossier."
      ],
      "boss": [
        "L'Araignée de tri refuse le démantèlement. Ses outils sont toujours sous tension."
      ],
      "progress": [
        "Les robots de récupération sont encore alimentés.",
        "Les unités de maintenance prolongent le travail des autres. Le vôtre aussi.",
        "Le tri continue. Approchez du poste central."
      ],
      "banter": [
        "La mise hors service était signée. L'exécution semble avoir été confiée à personne.",
        "Le propriétaire récupère ses pièces. L'AGP récupérera votre rapport."
      ],
      "lowhp": [
        "Ne restez pas devant les presses. La camionnette n'est pas une pièce à compacter."
      ],
      "win": [
        "Le propriétaire a signé leur mise hors service. Nos ordres sont corrects. Son matériel est moins coopératif."
      ],
      "lose": [
        "Intervention interrompue. Les machines ont repris le tri de votre secteur."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w1-l2-repair",
          "when": "time",
          "at": 25,
          "text": "Ce robot répare les autres. Vous pouvez continuer ainsi longtemps, ou commencer par lui."
        },
        {
          "id": "w1-l2-machines",
          "when": "time",
          "at": 47,
          "text": "Les débris repartent vers la récupération. Aucun ordre d'arrêt n'a atteint les machines."
        },
        {
          "id": "w1-l2-boss",
          "when": "bossStart",
          "text": "L'Araignée de tri refuse le démantèlement. Ses outils sont toujours sous tension."
        },
        {
          "id": "w1-l2-report",
          "when": "win",
          "text": "Le propriétaire a signé leur mise hors service. Nos ordres sont corrects. Son matériel est moins coopératif."
        }
      ]
    }
  },
  "w1-l3": {
    "id": "w1-l3",
    "name": "MISE HORS TENSION",
    "type": "survive",
    "threat": 2,
    "bg": "cristaux",
    "goal": {
      "seconds": 90
    },
    "intro": null,
    "spawns": [],
    "finalBoss": "reacteur",
    "reward": {
      "clear": 30,
      "first": 60
    },
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "satgun",
        "at": 2,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "pilleur",
        "at": 8,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 40,
        "y": 0,
        "alert": 1
      },
      {
        "type": "turret",
        "at": 14,
        "count": 2,
        "spacing": 1.2,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "healer",
        "at": 20,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "pilleur",
        "at": 28,
        "count": 2,
        "spacing": 0.9,
        "formation": "line",
        "spread": 160,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "shooter",
        "at": 36,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "tank",
        "at": 44,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "healer",
        "at": 48,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "turret",
        "at": 55,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 200,
        "x": 30,
        "y": 0,
        "alert": 1
      },
      {
        "type": "pilleur",
        "at": 62,
        "count": 2,
        "spacing": 0.6,
        "formation": "line",
        "spread": 150,
        "x": 60,
        "y": 0,
        "alert": 2
      },
      {
        "type": "drone",
        "at": 70,
        "count": 6,
        "spacing": 0,
        "formation": "star",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "tank",
        "at": 78,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 30,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0.1,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 65,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0.2,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.1,
    "dmgMul": 1,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.3,
      "end": 0.9,
      "seconds": 80
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Le réacteur alimente toujours le secteur. Sa coupure est indispensable pour poursuivre."
      ],
      "boss": [
        "Le Réacteur bascule en régime critique. Évitez les émissions d'énergie directe."
      ],
      "progress": [
        "L'alimentation de la zone baisse progressivement.",
        "Des pilleurs de cristaux tentent d'absorber l'énergie résiduelle.",
        "Le noyau du réacteur est désormais sans protection."
      ],
      "banter": [
        "Interrompre une source d'énergie active annule notre assurance incendie.",
        "Le propriétaire réclame la suspension de l'intervention. Demande rejetée."
      ],
      "lowhp": [
        "Alerte surcharge thermique. Les tirs ennemis endommagent les régulateurs."
      ],
      "win": [
        "Installation désormais hors service. Les documents ont enfin raison."
      ],
      "lose": [
        "Coupure manquée. Le réacteur a rétabli l'alimentation des lignes de défense."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w1-l3-claim",
          "when": "time",
          "at": 32,
          "text": "Le propriétaire est joignable. Il a attendu que vous touchiez à son alimentation."
        },
        {
          "id": "w1-l3-instability",
          "when": "time",
          "at": 60,
          "text": "Maintenance instable détectée. La zone devient électriquement hostile."
        },
        {
          "id": "w1-l3-boss",
          "when": "bossStart",
          "text": "Le Réacteur bascule en régime critique. Évitez les émissions d'énergie directe."
        },
        {
          "id": "w1-l3-report",
          "when": "win",
          "text": "Installation désormais hors service. Les documents ont enfin raison."
        }
      ]
    }
  },
  "w1-l4": {
    "id": "w1-l4",
    "name": "ACCES REFUSE",
    "type": "survive",
    "threat": 3,
    "bg": "patrouille",
    "goal": {
      "seconds": 100
    },
    "intro": null,
    "spawns": [],
    "finalBoss": "anneau",
    "reward": {
      "clear": 35,
      "first": 70
    },
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "diver",
        "at": 2,
        "count": 3,
        "spacing": 0.5,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "ghost",
        "at": 9,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 160,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "eclaireur",
        "at": 16,
        "count": 4,
        "spacing": 0.4,
        "formation": "column",
        "spread": 100,
        "x": 30,
        "y": 0,
        "alert": 1,
        "tier": 2
      },
      {
        "type": "elite",
        "at": 24,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "bomber",
        "at": 32,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 200,
        "x": 40,
        "y": 0,
        "alert": 1
      },
      {
        "type": "diver",
        "at": 40,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "ghost",
        "at": 48,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 170,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "elite",
        "at": 56,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 70,
        "y": 0,
        "alert": 2
      },
      {
        "type": "shieldedGrunt",
        "at": 58,
        "count": 2,
        "spacing": 0.5,
        "formation": "line",
        "spread": 120,
        "x": 70,
        "y": 0,
        "alert": 1
      },
      {
        "type": "bomber",
        "at": 68,
        "count": 3,
        "spacing": 0.8,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "diver",
        "at": 76,
        "count": 5,
        "spacing": 0.4,
        "formation": "star",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "elite",
        "at": 84,
        "count": 2,
        "spacing": 1.2,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 35,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0.15,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 72,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.2,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.2,
    "dmgMul": 1.1,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.28,
      "end": 0.88,
      "seconds": 90
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "La sécurité privée verrouille l'accès aux bureaux. La concentration de tirs augmente."
      ],
      "boss": [
        "L'Anneau de sécurité bloque l'accès direct. Neutralisez ses générateurs."
      ],
      "progress": [
        "Les patrouilles ont reçu de nouvelles consignes. Vous n'êtes plus un intrus. Vous êtes leur priorité.",
        "Intercepteurs et unités lourdes verrouillent l'axe principal.",
        "Le dernier périmètre de défense s'effondre."
      ],
      "banter": [
        "Leur budget défense dépasse largement le coût du recyclage contesté.",
        "Mines et champ de force détectés. La direction ne souhaite pas recevoir."
      ],
      "lowhp": [
        "Alerte : dommage critique sur le système de navigation."
      ],
      "win": [
        "Il reste une installation à traiter. Elle contient le propriétaire et l'essentiel de son mécontentement."
      ],
      "lose": [
        "Accès refusé. La sécurité privée a maintenu son verrouillage."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w1-l4-priority",
          "when": "time",
          "at": 30,
          "text": "Les patrouilles ont reçu de nouvelles consignes. Vous n'êtes plus un intrus. Vous êtes leur priorité."
        },
        {
          "id": "w1-l4-boss-approach",
          "when": "time",
          "at": 70,
          "text": "Il reste une installation à traiter. Elle contient le propriétaire et l'essentiel de son mécontentement."
        },
        {
          "id": "w1-l4-boss",
          "when": "bossStart",
          "text": "L'Anneau de sécurité bloque l'accès direct. Neutralisez ses générateurs."
        },
        {
          "id": "w1-l4-report",
          "when": "win",
          "text": "Périmètre privé franchi. L'accès au commandement est ouvert."
        }
      ]
    }
  },
  "w1-l5": {
    "id": "w1-l5",
    "name": "LA DIRECTION VOUS REÇOIT",
    "type": "boss",
    "threat": 4,
    "bg": "direction",
    "goal": {},
    "intro": null,
    "spawns": [],
    "finalBoss": "pdg",
    "reward": {
      "clear": 50,
      "first": 100
    },
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "shieldedGrunt",
        "at": 2,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "diver",
        "at": 8,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "tank",
        "at": 15,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 150,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "elite",
        "at": 22,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 40,
        "y": 0,
        "alert": 2
      },
      {
        "type": "shieldedGrunt",
        "at": 30,
        "count": 4,
        "spacing": 0.5,
        "formation": "star",
        "spread": 170,
        "x": 60,
        "y": 0,
        "alert": 2
      },
      {
        "type": "ghost",
        "at": 38,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "tank",
        "at": 46,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 160,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "elite",
        "at": 54,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "diver",
        "at": 62,
        "count": 5,
        "spacing": 0.4,
        "formation": "column",
        "spread": 100,
        "x": 30,
        "y": 0,
        "alert": 1
      },
      {
        "type": "shieldedGrunt",
        "at": 70,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 2
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 25,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.2,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 65,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.3,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": "dread",
    "bossName": null,
    "hpMul": 1.3,
    "dmgMul": 1.2,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.25,
      "end": 0.85,
      "seconds": 100
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Approche finale des bureaux de la direction. Gardes et escorte de sécurité en position."
      ],
      "boss": [
        "Le PDG engage sa tour armée personnelle."
      ],
      "progress": [
        "L'escorte personnelle du PDG se déploie.",
        "Ses griefs sont nombreux, mais votre bon d'intervention reste valable.",
        "La structure de la tour armée présente des faiblesses."
      ],
      "banter": [
        "Le dialogue commercial est désormais totalement rompu.",
        "Rappel : la destruction de matériels de direction n'impacte pas votre prime."
      ],
      "lowhp": [
        "Structure de coque faible. Évitez les salves lourdes du PDG."
      ],
      "win": [
        "Zone nettoyée. Une réclamation client reste ouverte."
      ],
      "lose": [
        "Entrevue annulée. La sécurité du PDG a protégé le complexe."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w1-l5-dialogue-1",
          "when": "time",
          "at": 40,
          "text": "PDG : 'Vous avez détruit mes satellites, mes machines et mon réacteur !'"
        },
        {
          "id": "w1-l5-dialogue-2",
          "when": "time",
          "at": 43,
          "text": "N.O.R.M.A. : 'Il suit correctement votre progression.'"
        },
        {
          "id": "w1-l5-boss",
          "when": "bossStart",
          "text": "La tour armée du PDG entre en combat. Attention aux salves coordonnées."
        },
        {
          "id": "w1-l5-report",
          "when": "win",
          "text": "Zone nettoyée. Une réclamation client reste ouverte. Nouvelle affectation : Mars."
        }
      ]
    }
  },
  "w2-l1": {
    "id": "w2-l1",
    "name": "ZONE DE DECHARGEMENT",
    "type": "survive",
    "threat": 2,
    "bg": "quai",
    "goal": {
      "seconds": 80
    },
    "intro": "earth",
    "spawns": [],
    "finalBoss": null,
    "reward": {
      "clear": 40,
      "first": 80
    },
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "grunt",
        "at": 2,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "charo",
        "at": 8,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 40,
        "y": 0,
        "alert": 1
      },
      {
        "type": "sniper",
        "at": 14,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 170,
        "x": 60,
        "y": 0,
        "alert": 1
      },
      {
        "type": "grunt",
        "at": 20,
        "count": 5,
        "spacing": 0.4,
        "formation": "star",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "charo",
        "at": 28,
        "count": 2,
        "spacing": 0.9,
        "formation": "line",
        "spread": 150,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "sniper",
        "at": 35,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "grunt",
        "at": 42,
        "count": 6,
        "spacing": 0.4,
        "formation": "column",
        "spread": 110,
        "x": 30,
        "y": 0,
        "alert": 1
      },
      {
        "type": "charo",
        "at": 50,
        "count": 2,
        "spacing": 0.6,
        "formation": "line",
        "spread": 160,
        "x": 60,
        "y": 0,
        "alert": 2
      },
      {
        "type": "sniper",
        "at": 58,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 40,
        "y": 0,
        "alert": 2
      },
      {
        "type": "grunt",
        "at": 65,
        "count": 5,
        "spacing": 0.5,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 1
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 30,
        "duration": 4,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0.1,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.2,
    "dmgMul": 1.1,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.3,
      "end": 0.92,
      "seconds": 70
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Zone annoncée dégagée. Les images indiquent le contraire."
      ],
      "boss": [
        "Le Déchargeur bloque la plateforme principale. Évitez ses projections de débris."
      ],
      "progress": [
        "Les empilements de carcasse entravent la progression.",
        "Les robots de manutention nous classent comme débris gênant.",
        "Plateforme de déchargement en vue."
      ],
      "banter": [
        "La densité de métal usé au mètre carré dépasse le seuil réglementaire.",
        "Ces machines travaillent sans relâche depuis plusieurs décennies."
      ],
      "lowhp": [
        "Alerte impact. Les pinces de manutention ciblent votre blindage."
      ],
      "win": [
        "Des livraisons sont encore programmées. Il n'y a plus de place depuis plusieurs années."
      ],
      "lose": [
        "Echec du déblaiement. Le Déchargeur a maintenu l'encombrement."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w2-l1-attack",
          "when": "time",
          "at": 25,
          "text": "Les machines protègent le déchargement. Nous sommes devenus un obstacle."
        },
        {
          "id": "w2-l1-boss",
          "when": "bossStart",
          "text": "Le Déchargeur bloque la plateforme principale. Évitez ses projections de débris."
        },
        {
          "id": "w2-l1-report",
          "when": "win",
          "text": "Des livraisons sont encore programmées. Il n'y a plus de place depuis plusieurs années."
        }
      ]
    }
  },
  "w2-l2": {
    "id": "w2-l2",
    "name": "MATIERE PREMIERE",
    "type": "survive",
    "threat": 3,
    "bg": "tri",
    "goal": {
      "seconds": 90
    },
    "intro": null,
    "spawns": [],
    "finalBoss": null,
    "reward": {
      "clear": 45,
      "first": 90
    },
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "grunt",
        "at": 2,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "mothership",
        "at": 8,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "charo",
        "at": 15,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 160,
        "x": 40,
        "y": 0,
        "alert": 1
      },
      {
        "type": "spider",
        "at": 22,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 60,
        "y": 0,
        "alert": 1
      },
      {
        "type": "grunt",
        "at": 28,
        "count": 5,
        "spacing": 0.4,
        "formation": "star",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "mothership",
        "at": 36,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 170,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "spider",
        "at": 42,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 30,
        "y": 0,
        "alert": 1
      },
      {
        "type": "charo",
        "at": 50,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "grunt",
        "at": 58,
        "count": 6,
        "spacing": 0.4,
        "formation": "column",
        "spread": 100,
        "x": 70,
        "y": 0,
        "alert": 1
      },
      {
        "type": "mothership",
        "at": 66,
        "count": 2,
        "spacing": 0.9,
        "formation": "line",
        "spread": 160,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "spider",
        "at": 72,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 32,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 1,
          "bigChance": 0.15,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 68,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.2,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.3,
    "dmgMul": 1.15,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.28,
      "end": 0.88,
      "seconds": 80
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Accès aux chaînes de tri. Les capteurs de l'usine analysent notre structure."
      ],
      "boss": [
        "Le Désosseur approche. Attention à ses outils de coupe lourds."
      ],
      "progress": [
        "Les presses blindées restreignent l'espace de vol.",
        "Le système de tri cherche des pièces de rechange sur votre véhicule.",
        "La chaîne d'assemblage principale est proche."
      ],
      "banter": [
        "Votre camionnette contient 40% d'alliages réutilisables selon leur barème.",
        "Les mécanos de récupération réparent le matériel ennemi plus vite que vous ne le détruisez."
      ],
      "lowhp": [
        "Structure endommagée. Risque de démontage spontané."
      ],
      "win": [
        "Les pièces récupérées alimentent la maintenance de l'usine. Le reste repart en décharge."
      ],
      "lose": [
        "Intervention échouée. Votre camionnette a été réaffectée comme pièce détachée."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w2-l2-recycle-id",
          "when": "time",
          "at": 20,
          "text": "Votre véhicule vient d'être accepté au recyclage. Je demande une correction."
        },
        {
          "id": "w2-l2-healer-warn",
          "when": "time",
          "at": 44,
          "text": "Cette unité remet les autres en état. Commencez par elle."
        },
        {
          "id": "w2-l2-boss",
          "when": "bossStart",
          "text": "Le Désosseur approche. Attention à ses outils de coupe lourds."
        },
        {
          "id": "w2-l2-report",
          "when": "win",
          "text": "Les pièces récupérées alimentent la maintenance de l'usine. Le reste repart en décharge."
        }
      ]
    }
  },
  "w2-l3": {
    "id": "w2-l3",
    "name": "STOCKAGE DEFINITIF",
    "type": "survive",
    "threat": 3,
    "bg": "compactage",
    "goal": {
      "seconds": 95
    },
    "intro": null,
    "spawns": [],
    "finalBoss": null,
    "reward": {
      "clear": 50,
      "first": 100
    },
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "sniper",
        "at": 2,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "mothership",
        "at": 8,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 160,
        "x": 40,
        "y": 0,
        "alert": 1
      },
      {
        "type": "kamikaze",
        "at": 16,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 150,
        "x": 60,
        "y": 0,
        "alert": 2
      },
      {
        "type": "spider",
        "at": 24,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "sniper",
        "at": 32,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "kamikaze",
        "at": 40,
        "count": 3,
        "spacing": 0.6,
        "formation": "star",
        "spread": 170,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "mothership",
        "at": 48,
        "count": 3,
        "spacing": 0.8,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "spider",
        "at": 56,
        "count": 2,
        "spacing": 0.9,
        "formation": "line",
        "spread": 160,
        "x": 40,
        "y": 0,
        "alert": 2
      },
      {
        "type": "sniper",
        "at": 64,
        "count": 3,
        "spacing": 0.6,
        "formation": "column",
        "spread": 100,
        "x": 30,
        "y": 0,
        "alert": 2
      },
      {
        "type": "kamikaze",
        "at": 72,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "mothership",
        "at": 80,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 170,
        "x": 50,
        "y": 0,
        "alert": 1
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 35,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.2,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 75,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.25,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.35,
    "dmgMul": 1.2,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.25,
      "end": 0.85,
      "seconds": 85
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Zone de confinement. Présence de conteneurs sous marquage AGP direct."
      ],
      "boss": [
        "Le Gardien de Confinement déploie ses barrières temporaires."
      ],
      "progress": [
        "Analyse des registres de cargaison en cours...",
        "Anomalie de données majeure détectée dans les archives AGP.",
        "Accès aux hangars de stockage scellés."
      ],
      "banter": [
        "Maintenir une distance de sécurité avec les citernes instables.",
        "Les conteneurs scellés ne devraient techniquement pas être ici."
      ],
      "lowhp": [
        "Niveau de radiation et d'impact élevé. Bouclier affaibli."
      ],
      "win": [
        "Les déchets sont toujours ici. Les certificats, eux, sont validés."
      ],
      "lose": [
        "Confinement maintenu. Les conteneurs restent non déclarés."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w2-l3-archive-1",
          "when": "time",
          "at": 25,
          "text": "Ce numéro de cargaison figure dans nos archives. Traitement terminé, il y a neuf ans."
        },
        {
          "id": "w2-l3-archive-2",
          "when": "time",
          "at": 50,
          "text": "Deuxième correspondance. Ce n'est pas une erreur isolée."
        },
        {
          "id": "w2-l3-boss",
          "when": "bossStart",
          "text": "Le Gardien de Confinement déploie ses barrières temporaires."
        },
        {
          "id": "w2-l3-report",
          "when": "win",
          "text": "Les déchets sont toujours ici. Les certificats, eux, sont validés."
        }
      ]
    }
  },
  "w2-l4": {
    "id": "w2-l4",
    "name": "MAINTIEN EN ACTIVITE",
    "type": "survive",
    "threat": 4,
    "bg": "benne",
    "goal": {
      "seconds": 100
    },
    "intro": null,
    "spawns": [],
    "finalBoss": null,
    "reward": {
      "clear": 60,
      "first": 120
    },
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "sniper",
        "at": 2,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "splitter",
        "at": 8,
        "count": 1,
        "spacing": 0,
        "formation": "line",
        "spread": 180,
        "x": 40,
        "y": 0,
        "alert": 2
      },
      {
        "type": "swarmer",
        "at": 10,
        "count": 2,
        "spacing": 0.5,
        "formation": "line",
        "spread": 120,
        "x": 40,
        "y": 0,
        "alert": 1
      },
      {
        "type": "charo",
        "at": 18,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 160,
        "x": 60,
        "y": 0,
        "alert": 1
      },
      {
        "type": "mine",
        "at": 26,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "splitter",
        "at": 34,
        "count": 2,
        "spacing": 0.9,
        "formation": "line",
        "spread": 170,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "swarmer",
        "at": 36,
        "count": 2,
        "spacing": 0.5,
        "formation": "line",
        "spread": 120,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "sniper",
        "at": 44,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "mine",
        "at": 52,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 180,
        "x": 30,
        "y": 0,
        "alert": 2
      },
      {
        "type": "charo",
        "at": 60,
        "count": 3,
        "spacing": 0.5,
        "formation": "star",
        "spread": 170,
        "x": 70,
        "y": 0,
        "alert": 2
      },
      {
        "type": "splitter",
        "at": 68,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "sniper",
        "at": 76,
        "count": 4,
        "spacing": 0.5,
        "formation": "column",
        "spread": 100,
        "x": 50,
        "y": 0,
        "alert": 2
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 30,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.2,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 70,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.3,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.4,
    "dmgMul": 1.25,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.22,
      "end": 0.82,
      "seconds": 90
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Secteur de maintenance du centre de supervision. Défenses organisées."
      ],
      "boss": [
        "Le Contremaître ordonne l'envoi de renforts ciblés."
      ],
      "progress": [
        "Les communications avec le serveur central de l'AGP sont établies.",
        "Fichiers d'alertes de saturation retrouvés.",
        "Le centre de supervision est en vue."
      ],
      "banter": [
        "L'état de maintenance de ce secteur contraste vivement avec les décharges extérieures.",
        "Les balises posées limitent nos trajectoires d'urgence."
      ],
      "lowhp": [
        "Alerte : blindage très affaibli par les mécas de sécurité."
      ],
      "win": [
        "Les transferts ont continué après l'alerte. Je conserve une copie de ces échanges."
      ],
      "lose": [
        "Accès bloqué. Le Contremaître a sécurisé le secteur."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w2-l4-maint-status",
          "when": "time",
          "at": 20,
          "text": "Ce secteur bénéficie toujours de maintenance. Les équipements abandonnés sont ailleurs."
        },
        {
          "id": "w2-l4-agp-ack",
          "when": "time",
          "at": 55,
          "text": "L'usine a signalé sa saturation. L'AGP a accusé réception."
        },
        {
          "id": "w2-l4-boss",
          "when": "bossStart",
          "text": "Le Contremaître ordonne l'envoi de renforts ciblés."
        },
        {
          "id": "w2-l4-report",
          "when": "win",
          "text": "Les transferts ont continué après l'alerte. Je conserve une copie de ces échanges."
        }
      ]
    }
  },
  "w2-l5": {
    "id": "w2-l5",
    "name": "TRAITEMENT EN COURS",
    "type": "survive",
    "threat": 5,
    "bg": "broyeur",
    "goal": {
      "seconds": 120
    },
    "intro": null,
    "spawns": [],
    "finalBoss": null,
    "reward": {
      "clear": 80,
      "first": 150
    },
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [
      {
        "type": "grunt",
        "at": 2,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 200,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "charo",
        "at": 8,
        "count": 3,
        "spacing": 0.7,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 1
      },
      {
        "type": "spider",
        "at": 16,
        "count": 2,
        "spacing": 0.9,
        "formation": "line",
        "spread": 160,
        "x": 40,
        "y": 0,
        "alert": 2
      },
      {
        "type": "sniper",
        "at": 24,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 210,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "charo",
        "at": 32,
        "count": 4,
        "spacing": 0.5,
        "formation": "star",
        "spread": 170,
        "x": 60,
        "y": 0,
        "alert": 2
      },
      {
        "type": "spider",
        "at": 40,
        "count": 2,
        "spacing": 0.8,
        "formation": "line",
        "spread": 150,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "grunt",
        "at": 48,
        "count": 6,
        "spacing": 0.4,
        "formation": "column",
        "spread": 100,
        "x": 30,
        "y": 0,
        "alert": 1
      },
      {
        "type": "sniper",
        "at": 56,
        "count": 4,
        "spacing": 0.5,
        "formation": "line",
        "spread": 220,
        "x": 50,
        "y": 0,
        "alert": 3
      },
      {
        "type": "charo",
        "at": 64,
        "count": 3,
        "spacing": 0.6,
        "formation": "line",
        "spread": 190,
        "x": 50,
        "y": 0,
        "alert": 2
      },
      {
        "type": "spider",
        "at": 72,
        "count": 2,
        "spacing": 1.0,
        "formation": "line",
        "spread": 180,
        "x": 50,
        "y": 0,
        "alert": 2
      }
    ],
    "events": [
      {
        "kind": "crystal",
        "at": 25,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 2,
          "bigChance": 0.25,
          "fallMin": 90,
          "fallMax": 120
        }
      },
      {
        "kind": "crystal",
        "at": 65,
        "duration": 5,
        "params": {
          "tickMs": 1000,
          "perTick": 3,
          "bigChance": 0.35,
          "fallMin": 90,
          "fallMax": 120
        }
      }
    ],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1.5,
    "dmgMul": 1.3,
    "timelineOnly": 1,
    "zoom": {
      "start": 1.2,
      "end": 0.8,
      "seconds": 110
    },
    "ambient": {
      "golden": false,
      "smallEvents": false
    },
    "norma": {
      "start": [
        "Le centre refuse notre accès. Il commande également toutes les machines encore actives."
      ],
      "boss": [
        "Le Directeur de Traitement tente d'intégrer notre camionnette à la chaîne."
      ],
      "progress": [
        "Le système central cherche à interrompre notre transmission.",
        "Extraction des registres de recyclage réels en cours...",
        "Dernières unités de défense du centre."
      ],
      "banter": [
        "Rappel : résister à une tentative d'intégration industrielle est autorisé.",
        "Le volume de données à extraire est considérable."
      ],
      "lowhp": [
        "Alerte : système d'urgence engagé. La structure ne supportera plus beaucoup d'impacts."
      ],
      "win": [
        "Dans nos bilans, ces mêmes cargaisons sont déclarées recyclées."
      ],
      "lose": [
        "Traitement échoué. Le Directeur a maintenu l'intégration."
      ],
      "tickEvery": [
        120,
        150
      ],
      "messages": [
        {
          "id": "w2-l5-boss-enter",
          "when": "time",
          "at": 15,
          "text": "Le centre refuse notre accès. Il commande également toutes les machines encore actives."
        },
        {
          "id": "w2-l5-repair-warning",
          "when": "time",
          "at": 45,
          "text": "Les unités de maintenance prolongent le combat. Éliminez-les."
        },
        {
          "id": "w2-l5-boss",
          "when": "bossStart",
          "text": "Le Directeur de Traitement tente d'intégrer notre camionnette à la chaîne."
        },
        {
          "id": "w2-l5-reveal-1",
          "when": "win",
          "text": "Ici, 'traité' signifie déplacé vers une autre zone."
        },
        {
          "id": "w2-l5-report",
          "when": "win",
          "text": "Dans nos bilans, ces mêmes cargaisons sont déclarées recyclées."
        }
      ]
    }
  },
  "w2-l6": {
    "id": "w2-l6",
    "name": "DREADNOUGHT",
    "type": "boss",
    "threat": 6,
    "goal": {},
    "intro": null,
    "reward": {
      "clear": 110,
      "first": 260
    },
    "events": [],
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": 0,
        "w": 38
      },
      {
        "type": "diver",
        "from": 0,
        "w": 16
      },
      {
        "type": "turret",
        "from": 0,
        "w": 12
      },
      {
        "type": "tank",
        "from": 0,
        "w": 12
      },
      {
        "type": "mine",
        "from": 0,
        "w": 10
      },
      {
        "type": "bomber",
        "from": 0,
        "w": 12
      },
      {
        "type": "kamikaze",
        "from": 0,
        "w": 14
      }
    ],
    "bg": "broyeur",
    "boss": "dread",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w3-l1": {
    "id": "w3-l1",
    "name": "REGISTRE DES DEPARTS",
    "type": "survive",
    "threat": 6,
    "goal": {
      "seconds": 90
    },
    "intro": "earth",
    "reward": {
      "clear": 70,
      "first": 140
    },
    "events": [
      {
        "kind": "spiders",
        "at": 20
      }
    ],
    "world": "w3",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.9299999999999999,
      "seconds": 81
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w3-l2": {
    "id": "w3-l2",
    "name": "ARCHIVES SCELLEES",
    "type": "kill",
    "threat": 6,
    "goal": {
      "count": 60
    },
    "reward": {
      "clear": 75,
      "first": 150
    },
    "world": "w3",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "events": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "intro": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.33,
      "end": 0.885,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w3-l3": {
    "id": "w3-l3",
    "name": "FOSSE COMMUNE",
    "type": "collect",
    "threat": 7,
    "goal": {
      "gems": 40
    },
    "reward": {
      "clear": 80,
      "first": 160
    },
    "events": [
      {
        "kind": "goldrush",
        "at": 15
      }
    ],
    "world": "w3",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "intro": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.31,
      "end": 0.8400000000000001,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w3-l4": {
    "id": "w3-l4",
    "name": "AUDIT DE FIN DE VIE",
    "type": "survive",
    "threat": 7,
    "goal": {
      "seconds": 100
    },
    "reward": {
      "clear": 85,
      "first": 170
    },
    "events": [
      {
        "kind": "elite",
        "at": 20
      },
      {
        "kind": "bombard",
        "at": 50
      }
    ],
    "world": "w3",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "intro": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.29,
      "end": 0.7949999999999999,
      "seconds": 90
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w3-l5": {
    "id": "w3-l5",
    "name": "LA FAUCHEUSE",
    "type": "boss",
    "threat": 8,
    "boss": "faucheuse",
    "bossName": null,
    "reward": {
      "clear": 140,
      "first": 330
    },
    "world": "w3",
    "schemaVersion": 2,
    "tuto": false,
    "goal": {},
    "waves": [],
    "events": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "intro": null,
    "finalBoss": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.27,
      "end": 0.75,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w4-l1": {
    "id": "w4-l1",
    "name": "CENTRE DE TRI AERIEN",
    "type": "survive",
    "threat": 8,
    "goal": {
      "seconds": 90
    },
    "intro": "earth",
    "reward": {
      "clear": 80,
      "first": 160
    },
    "events": [
      {
        "kind": "swarm",
        "at": 20
      }
    ],
    "world": "w4",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w4-l2": {
    "id": "w4-l2",
    "name": "ALVEOLES",
    "type": "kill",
    "threat": 9,
    "goal": {
      "count": 70
    },
    "intro": null,
    "reward": {
      "clear": 85,
      "first": 170
    },
    "events": [],
    "world": "w4",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w4-l3": {
    "id": "w4-l3",
    "name": "MIEL INDUSTRIEL",
    "type": "collect",
    "threat": 9,
    "goal": {
      "gems": 45
    },
    "intro": null,
    "reward": {
      "clear": 90,
      "first": 180
    },
    "events": [
      {
        "kind": "goldrush",
        "at": 15
      }
    ],
    "world": "w4",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w4-l4": {
    "id": "w4-l4",
    "name": "TOURNEE DE NUIT",
    "type": "survive",
    "threat": 10,
    "goal": {
      "seconds": 105
    },
    "intro": null,
    "reward": {
      "clear": 95,
      "first": 190
    },
    "events": [
      {
        "kind": "elite",
        "at": 20
      },
      {
        "kind": "kamikaze",
        "at": 55
      }
    ],
    "world": "w4",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w4-l5": {
    "id": "w4-l5",
    "name": "LA REINE",
    "type": "boss",
    "threat": 11,
    "goal": {},
    "intro": null,
    "reward": {
      "clear": 150,
      "first": 360
    },
    "events": [],
    "world": "w4",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": "ruche",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w5-l1": {
    "id": "w5-l1",
    "name": "SALLE D'EXPOSITION",
    "type": "survive",
    "threat": 11,
    "goal": {
      "seconds": 95
    },
    "intro": "earth",
    "reward": {
      "clear": 90,
      "first": 180
    },
    "events": [
      {
        "kind": "ice",
        "at": 20
      }
    ],
    "world": "w5",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w5-l2": {
    "id": "w5-l2",
    "name": "REFLEXIONS",
    "type": "kill",
    "threat": 12,
    "goal": {
      "count": 75
    },
    "intro": null,
    "reward": {
      "clear": 95,
      "first": 190
    },
    "events": [],
    "world": "w5",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w5-l3": {
    "id": "w5-l3",
    "name": "EXTRACTION DE CRISTAUX",
    "type": "collect",
    "threat": 12,
    "goal": {
      "gems": 50
    },
    "intro": null,
    "reward": {
      "clear": 100,
      "first": 200
    },
    "events": [
      {
        "kind": "crystal",
        "at": 10
      }
    ],
    "world": "w5",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w5-l4": {
    "id": "w5-l4",
    "name": "PARCOURS DE VISITE",
    "type": "survive",
    "threat": 13,
    "goal": {
      "seconds": 105
    },
    "intro": null,
    "reward": {
      "clear": 105,
      "first": 210
    },
    "events": [
      {
        "kind": "emp",
        "at": 30
      },
      {
        "kind": "elite",
        "at": 60
      }
    ],
    "world": "w5",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w5-l5": {
    "id": "w5-l5",
    "name": "LE PRISME",
    "type": "boss",
    "threat": 14,
    "goal": {},
    "intro": null,
    "reward": {
      "clear": 160,
      "first": 390
    },
    "events": [],
    "world": "w5",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": "prisme",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w6-l1": {
    "id": "w6-l1",
    "name": "POINT DE REJET",
    "type": "survive",
    "threat": 14,
    "goal": {
      "seconds": 95
    },
    "intro": "earth",
    "reward": {
      "clear": 100,
      "first": 200
    },
    "events": [
      {
        "kind": "nebula",
        "at": 20
      }
    ],
    "world": "w6",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w6-l2": {
    "id": "w6-l2",
    "name": "LA FOSSE",
    "type": "kill",
    "threat": 14,
    "goal": {
      "count": 80
    },
    "intro": null,
    "reward": {
      "clear": 105,
      "first": 210
    },
    "events": [],
    "world": "w6",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w6-l3": {
    "id": "w6-l3",
    "name": "PERLES TOXIQUES",
    "type": "collect",
    "threat": 15,
    "goal": {
      "gems": 50
    },
    "intro": null,
    "reward": {
      "clear": 110,
      "first": 220
    },
    "events": [
      {
        "kind": "crystal",
        "at": 10
      }
    ],
    "world": "w6",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w6-l4": {
    "id": "w6-l4",
    "name": "MAREE NOIRE",
    "type": "survive",
    "threat": 16,
    "goal": {
      "seconds": 110
    },
    "intro": null,
    "reward": {
      "clear": 115,
      "first": 230
    },
    "events": [
      {
        "kind": "spiders",
        "at": 25
      },
      {
        "kind": "elite",
        "at": 60
      }
    ],
    "world": "w6",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w6-l5": {
    "id": "w6-l5",
    "name": "LE KRAKEN",
    "type": "boss",
    "threat": 17,
    "goal": {},
    "intro": null,
    "reward": {
      "clear": 170,
      "first": 420
    },
    "events": [],
    "world": "w6",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": "kraken",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w7-l1": {
    "id": "w7-l1",
    "name": "CREPUSCULE",
    "type": "survive",
    "threat": 17,
    "goal": {
      "seconds": 100
    },
    "intro": "earth",
    "reward": {
      "clear": 110,
      "first": 220
    },
    "events": [
      {
        "kind": "eclipse",
        "at": 25
      }
    ],
    "world": "w7",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w7-l2": {
    "id": "w7-l2",
    "name": "COURONNE SOLAIRE",
    "type": "kill",
    "threat": 17,
    "goal": {
      "count": 85
    },
    "intro": null,
    "reward": {
      "clear": 115,
      "first": 230
    },
    "events": [],
    "world": "w7",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w7-l3": {
    "id": "w7-l3",
    "name": "POUSSIERE D'OR",
    "type": "collect",
    "threat": 18,
    "goal": {
      "gems": 55
    },
    "intro": null,
    "reward": {
      "clear": 120,
      "first": 240
    },
    "events": [
      {
        "kind": "goldrush",
        "at": 15
      }
    ],
    "world": "w7",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w7-l4": {
    "id": "w7-l4",
    "name": "TOTALITE",
    "type": "survive",
    "threat": 18,
    "goal": {
      "seconds": 110
    },
    "intro": null,
    "reward": {
      "clear": 125,
      "first": 250
    },
    "events": [
      {
        "kind": "eclipse",
        "at": 30
      },
      {
        "kind": "minibh",
        "at": 70
      }
    ],
    "world": "w7",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w7-l5": {
    "id": "w7-l5",
    "name": "L'ECLIPSE",
    "type": "boss",
    "threat": 19,
    "goal": {},
    "intro": null,
    "reward": {
      "clear": 180,
      "first": 450
    },
    "events": [],
    "world": "w7",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": "eclipse",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w8-l1": {
    "id": "w8-l1",
    "name": "SALLE D'ATTENTE",
    "type": "survive",
    "threat": 19,
    "goal": {
      "seconds": 100
    },
    "intro": "earth",
    "reward": {
      "clear": 120,
      "first": 240
    },
    "events": [
      {
        "kind": "statik",
        "at": 25
      }
    ],
    "world": "w8",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w8-l2": {
    "id": "w8-l2",
    "name": "FORMULAIRE 27B",
    "type": "kill",
    "threat": 19,
    "goal": {
      "count": 90
    },
    "intro": null,
    "reward": {
      "clear": 125,
      "first": 250
    },
    "events": [],
    "world": "w8",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w8-l3": {
    "id": "w8-l3",
    "name": "PIECES JUSTIFICATIVES",
    "type": "collect",
    "threat": 20,
    "goal": {
      "gems": 60
    },
    "intro": null,
    "reward": {
      "clear": 130,
      "first": 260
    },
    "events": [
      {
        "kind": "crystal",
        "at": 10
      }
    ],
    "world": "w8",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w8-l4": {
    "id": "w8-l4",
    "name": "RECOURS GRACIEUX",
    "type": "survive",
    "threat": 20,
    "goal": {
      "seconds": 115
    },
    "intro": null,
    "reward": {
      "clear": 135,
      "first": 270
    },
    "events": [
      {
        "kind": "plasma",
        "at": 30
      },
      {
        "kind": "elite",
        "at": 70
      }
    ],
    "world": "w8",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": null,
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w8-l5": {
    "id": "w8-l5",
    "name": "L'HYDRE",
    "type": "boss",
    "threat": 20,
    "goal": {},
    "intro": null,
    "reward": {
      "clear": 200,
      "first": 500
    },
    "events": [],
    "world": "w8",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "difficulty",
    "spawns": [
      {
        "type": "grunt",
        "from": -1,
        "w": 38
      },
      {
        "type": "diver",
        "from": 8,
        "w": 16
      },
      {
        "type": "shooter",
        "from": 12,
        "w": 22
      },
      {
        "type": "turret",
        "from": 20,
        "w": 12
      },
      {
        "type": "drone",
        "from": 28,
        "w": 16
      },
      {
        "type": "splitter",
        "from": 35,
        "w": 14
      },
      {
        "type": "shieldedGrunt",
        "from": 45,
        "w": 12
      },
      {
        "type": "mine",
        "from": 50,
        "w": 10
      },
      {
        "type": "tank",
        "from": 55,
        "w": 12
      },
      {
        "type": "bomber",
        "from": 65,
        "w": 12
      },
      {
        "type": "sniper",
        "from": 75,
        "w": 10
      },
      {
        "type": "swarmer",
        "from": 80,
        "w": 18
      },
      {
        "type": "healer",
        "from": 95,
        "w": 9
      },
      {
        "type": "ghost",
        "from": 110,
        "w": 12
      },
      {
        "type": "elite",
        "from": 130,
        "w": 8
      },
      {
        "type": "mothership",
        "from": 140,
        "w": 8
      },
      {
        "type": "vortex",
        "from": 150,
        "w": 7
      },
      {
        "type": "charo",
        "from": 100,
        "w": 11
      },
      {
        "type": "kamikaze",
        "from": 22,
        "w": 14
      },
      {
        "type": "spider",
        "from": 30,
        "w": 11
      }
    ],
    "bg": null,
    "boss": "hydre",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.35,
      "end": 0.965,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  }
};
