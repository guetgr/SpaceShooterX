"use strict";
// Univers narratif : AGP (Agence Galactique de Propreté), an 2247. Textes de l'interface, des ordres de mission et des transmissions de N.O.R.M.A.
// Aucun effet sur le jeu : ce fichier ne contient que des textes d'habillage. Les niveaux sont retrouvés par leur id (data/worlds/*.js).

const AGP_LORE = {
  os: 'AGP-OS 9.4',
  company: 'AGENCE GALACTIQUE DE PROPRETE',
  employee: 'EMPLOYE N° 4 471 902',
  // libellé du type d'ordre (fiche de mission) et couleur d'étiquette
  types: {
    tuto:    { label:'FORMATION OBLIGATOIRE', cls:'t-tuto' },
    survive: { label:'MAINTIEN EN POSTE',     cls:'t-std'  },
    kill:    { label:'NEUTRALISATION',        cls:'t-std'  },
    collect: { label:'RECUPERATION',          cls:'t-std'  },
    boss:    { label:'INCIDENT MAJEUR',       cls:'t-boss' },
    endless: { label:'HEURES SUPPLEMENTAIRES', cls:'t-std' },
  },
  // dossiers des ordres (id de niveau) : numéro et note de service. Sans entrée : numéro dérivé de l'id, note par type.
  files: {
    'w1-tuto': { no:'0001', brief:"Nettoyage de satellites hors service en orbite basse. Aucun danger. Aucune prime. Merci de ne rien casser." },
    'w1-l1':   { no:'0002', brief:"Décollage depuis le Dépôt Terre. Les déchets orbitaux s'accumulent. Votre ponctualité est surveillée." },
    'w1-l2':   { no:'0003', brief:"Secteur saturé : débris et drones de défense orbitaux non répertoriés. L'AGP décline toute responsabilité." },
    'w1-l3':   { no:'0004', brief:"Des cristaux de déchets en suspension. Les récupérer rapporte à l'agence. Vous, un peu aussi." },
    'w1-l4':   { no:'0005', brief:"Patrouille de routine. Toute résistance est considérée comme un malentendu administratif." },
    'w1-l5':   { no:'0006', brief:"Incident majeur. Classé « hors compétence ». Vous êtes néanmoins la seule camionnette disponible." },
  },
  briefByType: {
    survive: "Maintenez votre poste pendant la durée indiquée. Les pauses ne sont pas comptabilisées.",
    kill:    "Neutralisez les éléments indésirables. Quota minimum exigé, quota maximum inexistant.",
    collect: "Récupérez les composants en suspension. Le tri sera effectué par vos soins.",
    boss:    "Un incident majeur est en cours. Merci de le résoudre sans le mentionner.",
    tuto:    "Formation obligatoire. La réussite n'est pas obligatoire.",
  },
  // niveaux de risque (menace 1..n) -> libellé
  risk(threat){
    return threat <= 1 ? 'FAIBLE (HORAIRES DE BUREAU)' : threat <= 2 ? 'MODERE' : threat <= 3 ? 'ELEVE' : threat <= 5 ? 'TRES ELEVE' : 'NON ASSURABLE';
  },
  // évaluation de performance (rang de style D..SSS) -> mention
  grades: {
    D:   'INSUFFISANT',
    C:   'PASSABLE',
    B:   'SATISFAISANT',
    A:   'REMARQUABLE',
    S:   'EXCEPTIONNEL',
    SS:  'ANORMAL',
    SSS: 'SUSPECT : AUDIT EN COURS',
  },
  // noms internes des caractéristiques (fiche technique de l'atelier)
  statNames: {
    'PV MAX': 'INTEGRITE COQUE', 'BOUCLIER': 'CHAMP DE SECURITE', 'DEGATS PAR TIR': 'CHARGE PAR TIR',
    'CADENCE': 'CADENCE DE TIR', 'PROJECTILES': 'BUSES ACTIVES', 'ARMURE': 'ASSURANCE DOMMAGES',
  },
  // départements du catalogue technique (page R&D) : id de branche -> nom + sous-titre
  depts: {
    arme:    { name:'ARMEMENT',             sub:"Usage non officiel" },
    missile: { name:'ORDNANCE',             sub:"Réservé aux interventions « délicates »" },
    defense: { name:'SECURITE AU TRAVAIL',  sub:"Dernier service à avoir été consulté" },
    util:    { name:'LOGISTIQUE',           sub:"Tout ce qui n'a pas de budget" },
    savoir:  { name:'FORMATION CONTINUE',   sub:"Les modules sont à suivre hors temps de travail" },
    tempete: { name:'INCIDENTS METEO',      sub:"Phénomènes non couverts" },
    gravite: { name:'PHYSIQUE FONDAMENTALE', sub:"Département en sous-effectif (1 stagiaire)" },
    furie:   { name:'GESTION DU STRESS',    sub:"Méthodes non homologuées" },
  },
};

// transmissions de N.O.R.M.A. (assistante administrative embarquée) : courtes, froides, polies. Un seul message à la fois.
const AGP_LINES = {
  // bandeau d'information de l'accueil (mélange d'avis de l'AGP et de N.O.R.M.A.)
  ticker: [
    ['AGP', "RAPPEL : le port du casque est facultatif. Le port du sourire est obligatoire."],
    ['N.O.R.M.A', "Votre équipement est assuré. Vous ne l'êtes pas."],
    ['AGP', "La cantine est fermée pour cause de vide spatial."],
    ['AGP', "Productivité du trimestre : +4 700 %. Salaires : inchangés."],
    ['RH', "Votre ancienneté : 14 ans. Votre promotion : en cours d'examen depuis 14 ans."],
    ['N.O.R.M.A', "Contrôle technique de votre camionnette : EXPIRE depuis 2231. Sans incidence."],
    ['AGP', "Congés payés suspendus jusqu'à nouvel ordre (en vigueur depuis 2199)."],
    ['SECURITE', "Merci de ne pas signaler les anomalies. Les anomalies vous remercient."],
    ['NOTE INTERNE', "Maintenir un niveau de pollution « confortable ». [document retiré]"],
    ['N.O.R.M.A', "Tout déchet nettoyé est un déchet qui ne rapporte plus. Merci de ralentir."],
    ['AGP', "La galaxie vous remercie. Elle ne vous le dira pas."],
    ['RH', "Le syndicat des employés a été dissous par consentement unanime (1 voix)."],
  ],
  // début de mission (en combat, quelques secondes après le décollage)
  start: [
    "Ordre de mission reçu. Votre équipement est assuré. Vous ne l'êtes pas.",
    "Une légère résistance a été détectée. Merci d'éviter toute escalade.",
    "Rappel : cette intervention n'est pas rémunérée en cas d'échec.",
    "Bon courage. Ce message est automatique, comme votre contrat.",
    "Votre productivité est observée. Votre bien-être, beaucoup moins.",
  ],
  // tuto : une consigne à la fois dans la boîte N.O.R.M.A. (voir game/tuto.js). move/shoot/boss = consignes des 3 étapes ; le reste = remarques ponctuelles.
  tuto: {
    move:  "Formation obligatoire. Glissez le doigt pour déplacer la camionnette.",
    shoot: "Tir automatique. Placez-vous sous les satellites hors service.",
    boss:  "Incident majeur. Détruisez-le. Cette évaluation est notée.",
    aim:   "Il vous vise. Bougez : l'immobilité est réservée à la pause café.",
    ring:  "Anneau avec brèche. Passez par là. C'est un parcours qualifiant.",
    p2:    "Il est endommagé. Vous aussi, probablement.",
    p3:    "Fureur détectée. Rien d'anormal : c'est un lundi.",
    win:   "Incident clos. Formation validée. Aucune prime associée.",
    lose:  "Accident du travail enregistré. Retenue sur salaire à prévoir.",
  },
  boss: [
    "Incident majeur détecté. Merci de ne pas le prendre personnellement.",
    "Ceci n'est pas un déchet : c'est un client. Nettoyez-le quand même.",
    "Votre assurance ne couvre pas les incidents de cette taille.",
    "Un renfort a été demandé. Il est en réunion.",
  ],
  lowhp: [
    "Votre état de santé est classé « non prioritaire ».",
    "Alerte coque : toute pièce remplacée vous sera facturée.",
    "Votre durée de vie restante a été arrondie à la baisse.",
  ],
  cards: [
    "Merci de choisir un (1) module. Le choix est définitif, comme votre contrat.",
    "Nouveau matériel disponible. À rendre en fin de service.",
    "Félicitations. Votre productivité augmente. Votre salaire, non.",
    "Les modules sont fournis en l'état. L'état n'est pas précisé.",
  ],
  // commentaire de l'écran de fin de mission
  win: [
    "Intervention validée. Votre prime a été réinvestie pour vous par l'AGP.",
    "Résultat conforme. Aucune félicitation ne sera émise.",
    "Bon travail. Un collègue moins performant a été libéré de ses obligations.",
    "Mission accomplie. Une nouvelle mission vous attend. Elle vous attendait déjà.",
  ],
  lose: [
    "Accident du travail constaté. Il sera requalifié en « imprudence personnelle ».",
    "Votre camionnette est détruite. Le montant sera retenu sur votre salaire.",
    "Vous êtes déclaré indisponible. Un remplaçant a été commandé (livraison : jamais).",
    "Le formulaire de réclamation est disponible. Il est fermé.",
  ],
  abort: [
    "Ordre annulé. Merci de justifier votre absence par écrit.",
    "Abandon de poste enregistré. Il sera conservé dans votre dossier. Longtemps.",
  ],
  hiGrade: [
    "Performance anormalement élevée. Un audit a été ouvert à titre préventif.",
    "Rendement suspect. Vos résultats ont été arrondis à la baisse.",
  ],
  // note de service affichée sur la fiche d'un niveau terminé / verrouillé
  locked: "Habilitation insuffisante. Terminez l'ordre précédent.",
};

// numéro de dossier affichable : AGP-0003-B (lettre = menace)
function agpDossier(l){
  const f = AGP_LORE.files[l.id], no = f ? f.no : String(l.id).replace(/\D/g, '').padStart(4, '0').slice(-4);
  return 'AGP-' + no + '-' + String.fromCharCode(64 + Math.max(1, Math.min(9, l.threat || 1)));
}
function agpBrief(l){ const f = AGP_LORE.files[l.id]; return (f && f.brief) || AGP_LORE.briefByType[l.type] || ''; }
function agpType(l){ return AGP_LORE.types[l.type] || AGP_LORE.types.survive; }
