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
    "name": "DECOLLAGE",
    "type": "mission",
    "threat": 1,
    "bg": "debris",
    "intro": "earth",
    "spawns": [
      {
        "type": "sat",
        "from": 0,
        "w": 10
      },
      {
        "type": "satgun",
        "from": 14,
        "w": 5
      }
    ],
    "finalBoss": "meteo",
    "reward": {
      "clear": 20,
      "first": 40
    },
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "events": [],
    "spawnClock": "mission",
    "boss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.33,
      "end": 0.955,
      "seconds": 54
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 60
  },
  "w1-l2": {
    "id": "w1-l2",
    "name": "CEINTURE DE DEBRIS",
    "type": "mission",
    "threat": 1,
    "bg": "station",
    "spawns": [
      {
        "type": "sat",
        "from": 0,
        "w": 8
      },
      {
        "type": "satgun",
        "from": 10,
        "w": 6
      },
      {
        "type": "bras",
        "from": 20,
        "w": 4,
        "tier": 1
      }
    ],
    "finalBoss": "araignee",
    "reward": {
      "clear": 25,
      "first": 50
    },
    "events": [
      {
        "kind": "meteors",
        "at": 30
      }
    ],
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "mission",
    "intro": null,
    "boss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.31,
      "end": 0.91,
      "seconds": 67.5
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 75
  },
  "w1-l3": {
    "id": "w1-l3",
    "name": "PLUIE DE CRISTAUX",
    "type": "mission",
    "threat": 2,
    "bg": "cristaux",
    "spawns": [
      {
        "type": "sat",
        "from": 0,
        "w": 8
      },
      {
        "type": "satgun",
        "from": 8,
        "w": 6
      },
      {
        "type": "bras",
        "from": 16,
        "w": 4,
        "tier": 1
      },
      {
        "type": "pilleur",
        "from": 12,
        "w": 4,
        "tier": 1
      }
    ],
    "finalBoss": "reacteur",
    "reward": {
      "clear": 30,
      "first": 60
    },
    "events": [
      {
        "kind": "crystal",
        "at": 15
      }
    ],
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "spawnClock": "mission",
    "intro": null,
    "boss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.29,
      "end": 0.865,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 90
  },
  "w1-l4": {
    "id": "w1-l4",
    "name": "PATROUILLE",
    "type": "mission",
    "threat": 2,
    "bg": "patrouille",
    "spawns": [
      {
        "type": "sat",
        "from": 0,
        "w": 6
      },
      {
        "type": "satgun",
        "from": 6,
        "w": 6
      },
      {
        "type": "eclaireur",
        "from": 6,
        "w": 6,
        "tier": 1
      },
      {
        "type": "bras",
        "from": 14,
        "w": 4,
        "tier": 1
      },
      {
        "type": "pilleur",
        "from": 18,
        "w": 3,
        "tier": 1
      }
    ],
    "finalBoss": "anneau",
    "reward": {
      "clear": 35,
      "first": 70
    },
    "world": "w1",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "events": [],
    "spawnClock": "mission",
    "intro": null,
    "boss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.27,
      "end": 0.8200000000000001,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 90
  },
  "w1-l5": {
    "id": "w1-l5",
    "name": "LE PDG",
    "type": "boss",
    "threat": 3,
    "bg": "direction",
    "boss": "dread",
    "finalBoss": "pdg",
    "bossName": "LE PDG",
    "reward": {
      "clear": 60,
      "first": 150
    },
    "world": "w1",
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
    "intro": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.25,
      "end": 0.775,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    }
  },
  "w2-l1": {
    "id": "w2-l1",
    "name": "QUAI DE DECHARGEMENT",
    "type": "mission",
    "threat": 3,
    "intro": "earth",
    "reward": {
      "clear": 40,
      "first": 80
    },
    "events": [
      {
        "kind": "nebula",
        "at": 25
      }
    ],
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
      }
    ],
    "bg": "quai",
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
    },
    "bossAt": 75
  },
  "w2-l2": {
    "id": "w2-l2",
    "name": "CHAINE DE TRI",
    "type": "mission",
    "threat": 3,
    "reward": {
      "clear": 45,
      "first": 90
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
      }
    ],
    "bg": "tri",
    "intro": null,
    "boss": "dread",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.33,
      "end": 0.9199999999999999,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 90
  },
  "w2-l3": {
    "id": "w2-l3",
    "name": "ZONE DE COMPACTAGE",
    "type": "mission",
    "threat": 4,
    "reward": {
      "clear": 50,
      "first": 100
    },
    "events": [
      {
        "kind": "mines",
        "at": 20
      }
    ],
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
      }
    ],
    "bg": "compactage",
    "intro": null,
    "boss": "dread",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.31,
      "end": 0.875,
      "seconds": 72.0
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 80
  },
  "w2-l4": {
    "id": "w2-l4",
    "name": "BENNE A CRISTAUX",
    "type": "mission",
    "threat": 4,
    "reward": {
      "clear": 55,
      "first": 110
    },
    "events": [
      {
        "kind": "crystal",
        "at": 10
      },
      {
        "kind": "meteors",
        "at": 40
      }
    ],
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
      }
    ],
    "bg": "benne",
    "intro": null,
    "boss": "dread",
    "finalBoss": null,
    "bossName": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.29,
      "end": 0.83,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 90
  },
  "w2-l5": {
    "id": "w2-l5",
    "name": "ATELIER DE BROYAGE",
    "type": "mission",
    "threat": 5,
    "boss": "dread",
    "bossName": null,
    "reward": {
      "clear": 60,
      "first": 120
    },
    "world": "w2",
    "schemaVersion": 2,
    "tuto": false,
    "waves": [],
    "events": [
      {
        "kind": "mines",
        "at": 15
      }
    ],
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
    "intro": null,
    "finalBoss": null,
    "hpMul": 1,
    "dmgMul": 1,
    "timelineOnly": 0,
    "zoom": {
      "start": 1.27,
      "end": 0.785,
      "seconds": 70
    },
    "ambient": {
      "golden": true,
      "smallEvents": true
    },
    "bossAt": 90
  },
  "w2-l6": {
    "id": "w2-l6",
    "name": "DREADNOUGHT",
    "type": "boss",
    "threat": 6,
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
    "type": "mission",
    "threat": 6,
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
    "boss": "dread",
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
    },
    "bossAt": 90
  },
  "w3-l2": {
    "id": "w3-l2",
    "name": "ARCHIVES SCELLEES",
    "type": "mission",
    "threat": 6,
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
    "boss": "dread",
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
    },
    "bossAt": 90
  },
  "w3-l3": {
    "id": "w3-l3",
    "name": "FOSSE COMMUNE",
    "type": "mission",
    "threat": 7,
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
    "boss": "dread",
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
    },
    "bossAt": 90
  },
  "w3-l4": {
    "id": "w3-l4",
    "name": "AUDIT DE FIN DE VIE",
    "type": "mission",
    "threat": 7,
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
    "boss": "dread",
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
    },
    "bossAt": 100
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
    "type": "mission",
    "threat": 8,
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
    },
    "bossAt": 90
  },
  "w4-l2": {
    "id": "w4-l2",
    "name": "ALVEOLES",
    "type": "mission",
    "threat": 9,
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
    },
    "bossAt": 90
  },
  "w4-l3": {
    "id": "w4-l3",
    "name": "MIEL INDUSTRIEL",
    "type": "mission",
    "threat": 9,
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
    },
    "bossAt": 90
  },
  "w4-l4": {
    "id": "w4-l4",
    "name": "TOURNEE DE NUIT",
    "type": "mission",
    "threat": 10,
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
    },
    "bossAt": 105
  },
  "w4-l5": {
    "id": "w4-l5",
    "name": "LA REINE",
    "type": "boss",
    "threat": 11,
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
    "type": "mission",
    "threat": 11,
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
    },
    "bossAt": 95
  },
  "w5-l2": {
    "id": "w5-l2",
    "name": "REFLEXIONS",
    "type": "mission",
    "threat": 12,
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
    },
    "bossAt": 90
  },
  "w5-l3": {
    "id": "w5-l3",
    "name": "EXTRACTION DE CRISTAUX",
    "type": "mission",
    "threat": 12,
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
    },
    "bossAt": 90
  },
  "w5-l4": {
    "id": "w5-l4",
    "name": "PARCOURS DE VISITE",
    "type": "mission",
    "threat": 13,
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
    },
    "bossAt": 105
  },
  "w5-l5": {
    "id": "w5-l5",
    "name": "LE PRISME",
    "type": "boss",
    "threat": 14,
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
    "type": "mission",
    "threat": 14,
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
    },
    "bossAt": 95
  },
  "w6-l2": {
    "id": "w6-l2",
    "name": "LA FOSSE",
    "type": "mission",
    "threat": 14,
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
    },
    "bossAt": 90
  },
  "w6-l3": {
    "id": "w6-l3",
    "name": "PERLES TOXIQUES",
    "type": "mission",
    "threat": 15,
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
    },
    "bossAt": 90
  },
  "w6-l4": {
    "id": "w6-l4",
    "name": "MAREE NOIRE",
    "type": "mission",
    "threat": 16,
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
    },
    "bossAt": 110
  },
  "w6-l5": {
    "id": "w6-l5",
    "name": "LE KRAKEN",
    "type": "boss",
    "threat": 17,
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
    "type": "mission",
    "threat": 17,
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
    },
    "bossAt": 100
  },
  "w7-l2": {
    "id": "w7-l2",
    "name": "COURONNE SOLAIRE",
    "type": "mission",
    "threat": 17,
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
    },
    "bossAt": 90
  },
  "w7-l3": {
    "id": "w7-l3",
    "name": "POUSSIERE D'OR",
    "type": "mission",
    "threat": 18,
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
    },
    "bossAt": 90
  },
  "w7-l4": {
    "id": "w7-l4",
    "name": "TOTALITE",
    "type": "mission",
    "threat": 18,
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
    },
    "bossAt": 110
  },
  "w7-l5": {
    "id": "w7-l5",
    "name": "L'ECLIPSE",
    "type": "boss",
    "threat": 19,
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
    "type": "mission",
    "threat": 19,
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
    },
    "bossAt": 100
  },
  "w8-l2": {
    "id": "w8-l2",
    "name": "FORMULAIRE 27B",
    "type": "mission",
    "threat": 19,
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
    },
    "bossAt": 90
  },
  "w8-l3": {
    "id": "w8-l3",
    "name": "PIECES JUSTIFICATIVES",
    "type": "mission",
    "threat": 20,
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
    },
    "bossAt": 90
  },
  "w8-l4": {
    "id": "w8-l4",
    "name": "RECOURS GRACIEUX",
    "type": "mission",
    "threat": 20,
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
    },
    "bossAt": 115
  },
  "w8-l5": {
    "id": "w8-l5",
    "name": "L'HYDRE",
    "type": "boss",
    "threat": 20,
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
