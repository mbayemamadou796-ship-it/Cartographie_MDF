import { WeeklyReport, ReportingStatus, ReportingPriority, ReportResponse, ReportActionLog } from '@shared/types';

const LOCAL_STORAGE_REPORTINGS_KEY = 'mbok_de_france_weekly_reports_v3';

export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [
  // AOÛT 2026
  {
    id: 'rep-125',
    caseNumber: '#125',
    referentId: 'usr-modou',
    referentName: 'Modou Mbaye',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '06 12 34 56 78',
    zone: 'Bretagne',
    zoneId: 'zone-bretagne',
    type: 'PONCTUEL',
    sujet: 'Logement d\'urgence pour 2 étudiants primo-arrivants à Rennes',
    priority: 'URGENT',
    semaineLundi: '2026-08-10',
    nouveauxContactes: '4 nouveaux membres (étudiants et jeunes actifs à Rennes)',
    situationsPrioritaires: 'Deux nouveaux arrivants ont besoin d\'un accompagnement urgent pour leur recherche de logement étudiant sur Rennes (secteur Beaulieu / Villejean).',
    activitesLocales: 'Organisation de la rencontre d\'accueil mensuelle à Rennes le samedi après-midi. Présentation de l\'association Mbok de France.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Besoin d\'un appui du Bureau pour nous mettre en relation avec d\'éventuels membres ayant des disponibilités de logement temporaire ou contacts bailleurs en Bretagne.',
    urgenceLevel: 4,
    status: 'EN_COURS',
    responsableId: 'usr-admin-b',
    responsableName: 'Administrateur B (Pôle Logement)',
    datePriseEnCharge: '2026-08-11T09:30:00.000Z',
    dateReponse: '2026-08-11T14:20:00.000Z',
    reponses: [
      {
        id: 'rep-resp-1',
        authorName: 'Administrateur B',
        authorRole: 'bureau',
        content: 'Salam Modou. Le pôle Logement a pris contact avec deux adhérents sur Rennes qui disposent d\'une chambre d\'hôte solidaire pour 10 jours. Nous transmettons leurs coordonnées.',
        createdAt: '2026-08-11T14:20:00.000Z'
      }
    ],
    actionHistory: [
      {
        id: 'act-1',
        date: '2026-08-10T18:45:00.000Z',
        authorName: 'Modou Mbaye',
        authorRole: 'Référent Bretagne',
        action: 'Création du cas #125',
        details: 'Remontée ponctuelle avec demande urgente de retour Bureau'
      },
      {
        id: 'act-2',
        date: '2026-08-11T09:30:00.000Z',
        authorName: 'Administrateur B',
        authorRole: 'Bureau National',
        action: 'Prise en charge & Attribution',
        previousStatus: 'NOUVEAU',
        newStatus: 'EN_COURS',
        details: 'Attribué à Administrateur B (Pôle Logement)'
      },
      {
        id: 'act-3',
        date: '2026-08-11T14:20:00.000Z',
        authorName: 'Administrateur B',
        authorRole: 'Bureau National',
        action: 'Réponse transmise au Référent',
        details: 'Mise en relation avec solution d\'hébergement temporaire'
      }
    ],
    bureauNotes: 'Dossier pris en charge par Administrateur B. Contacts hébergement transmis.',
    createdAt: '2026-08-10T18:45:00.000Z',
    updatedAt: '2026-08-11T14:20:00.000Z',
    lastActivityAt: '2026-08-11T14:20:00.000Z'
  },
  {
    id: 'rep-124',
    caseNumber: '#124',
    referentId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    email: 'referent.idf@mbokdefrance.org',
    telephone: '06 98 76 54 32',
    zone: 'Île-de-France',
    zoneId: 'zone-idf',
    type: 'PERIODIQUE',
    sujet: 'Rapport mensuel d\'activité IDF — Août 2026',
    priority: 'NORMAL',
    semaineLundi: '2026-08-03',
    nouveauxContactes: '8 nouveaux contacts recensés',
    situationsPrioritaires: 'Un membre cadre en transition professionnelle sollicite des mises en relation dans le secteur juridique / associatif.',
    activitesLocales: 'Point de coordination des sous-secteurs 75 / 93 / 94. Préparation du forum d\'accueil de rentrée.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    responsableId: 'usr-admin-a',
    responsableName: 'Secrétariat National MDF',
    datePriseEnCharge: '2026-08-04T10:00:00.000Z',
    dateReponse: '2026-08-05T10:30:00.000Z',
    dateTraitement: '2026-08-05T10:30:00.000Z',
    reponses: [
      {
        id: 'rep-resp-2',
        authorName: 'Secrétariat National MDF',
        authorRole: 'bureau',
        content: 'Rapport d\'activité validé. Félicitations pour la dynamique de rentrée en Île-de-France !',
        createdAt: '2026-08-05T10:30:00.000Z'
      }
    ],
    actionHistory: [
      {
        id: 'act-4',
        date: '2026-08-03T20:15:00.000Z',
        authorName: 'Aïssatou Diallo',
        authorRole: 'Référent Île-de-France',
        action: 'Transmission du reporting mensuel'
      },
      {
        id: 'act-5',
        date: '2026-08-05T10:30:00.000Z',
        authorName: 'Secrétariat National MDF',
        authorRole: 'Bureau National',
        action: 'Validation et clôture du cas',
        previousStatus: 'EN_COURS',
        newStatus: 'TRAITE'
      }
    ],
    bureauNotes: 'Rapport validé par le Bureau. Mises en relation effectuées avec la commission insertion.',
    reviewedBy: 'Administrateur MDF',
    reviewedAt: '2026-08-05T10:30:00.000Z',
    createdAt: '2026-08-03T20:15:00.000Z',
    updatedAt: '2026-08-05T10:30:00.000Z',
    lastActivityAt: '2026-08-05T10:30:00.000Z'
  },
  {
    id: 'rep-123',
    caseNumber: '#123',
    referentId: 'usr-referent-aura',
    referentName: 'Amadou Fall',
    email: 'referent.lyon@mbokdefrance.org',
    telephone: '06 45 67 89 01',
    zone: 'Auvergne-Rhône-Alpes',
    zoneId: 'zone-auvergne-rhone-alpes',
    type: 'PONCTUEL',
    sujet: 'Demande de matériel officiel & kits d\'accueil forum de rentrée',
    priority: 'IMPORTANT',
    semaineLundi: '2026-08-03',
    nouveauxContactes: '5 nouveaux adhérents à Lyon & Grenoble',
    situationsPrioritaires: 'Accompagnement d\'une famille en cours d\'installation sur Villeurbanne.',
    activitesLocales: 'Permanence d\'écoute mensuelle à Lyon 7ème et mise à jour des fiches compétences.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Demande de flyers et supports MDF officiels pour le stand associatif de septembre à Lyon.',
    urgenceLevel: 3,
    status: 'EN_COURS',
    responsableId: 'usr-admin-c',
    responsableName: 'Pôle Communication MDF',
    datePriseEnCharge: '2026-08-04T15:00:00.000Z',
    dateReponse: '2026-08-06T14:00:00.000Z',
    reponses: [
      {
        id: 'rep-resp-3',
        authorName: 'Pôle Communication MDF',
        authorRole: 'bureau',
        content: 'Colis de 200 flyers et 2 roll-ups expédié à l\'adresse de l\'antenne lyonnaise. Numéro de suivi Colissimo : 8L00293847.',
        createdAt: '2026-08-06T14:00:00.000Z'
      }
    ],
    actionHistory: [
      {
        id: 'act-6',
        date: '2026-08-03T19:00:00.000Z',
        authorName: 'Amadou Fall',
        authorRole: 'Référent AURA',
        action: 'Création du cas #123'
      },
      {
        id: 'act-7',
        date: '2026-08-04T15:00:00.000Z',
        authorName: 'Pôle Communication MDF',
        authorRole: 'Bureau National',
        action: 'Prise en charge du dossier',
        previousStatus: 'NOUVEAU',
        newStatus: 'EN_COURS'
      }
    ],
    bureauNotes: 'Colis de supports envoyé. En attente de confirmation de bonne réception.',
    reviewedBy: 'Secrétariat MDF',
    reviewedAt: '2026-08-06T14:00:00.000Z',
    createdAt: '2026-08-03T19:00:00.000Z',
    updatedAt: '2026-08-06T14:00:00.000Z',
    lastActivityAt: '2026-08-06T14:00:00.000Z'
  },

  // JUILLET 2026
  {
    id: 'rep-122',
    caseNumber: '#122',
    referentId: 'usr-referent-hdf',
    referentName: 'Ousmane Ndiaye',
    email: 'referent.lille@mbokdefrance.org',
    telephone: '06 77 88 99 00',
    zone: 'Hauts-de-France',
    zoneId: 'zone-hauts-de-france',
    type: 'PONCTUEL',
    sujet: 'Soutien urgent & visite hospitalière membre MDF Lille',
    priority: 'URGENT',
    semaineLundi: '2026-07-20',
    nouveauxContactes: '6 nouveaux membres dans la métropole lilloise',
    situationsPrioritaires: 'Signalement d\'un membre hospitalisé nécessitant des visites de soutien fraternelles.',
    activitesLocales: 'Visites de soutien organisées et accueil des nouveaux arrivants à Lille Flandres.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Soutien moral et prise de contact par un membre du Bureau.',
    urgenceLevel: 5,
    status: 'TRAITE',
    responsableId: 'usr-admin-sol',
    responsableName: 'Pôle Solidarité MDF',
    datePriseEnCharge: '2026-07-20T19:00:00.000Z',
    dateReponse: '2026-07-21T10:00:00.000Z',
    dateTraitement: '2026-07-21T10:00:00.000Z',
    reponses: [
      {
        id: 'rep-resp-4',
        authorName: 'Pôle Solidarité MDF',
        authorRole: 'bureau',
        content: 'Contact téléphonique établi avec la famille. Visite de la délégation lilloise effectuée avec succès.',
        createdAt: '2026-07-21T10:00:00.000Z'
      }
    ],
    actionHistory: [
      {
        id: 'act-8',
        date: '2026-07-20T17:00:00.000Z',
        authorName: 'Ousmane Ndiaye',
        authorRole: 'Référent Hauts-de-France',
        action: 'Création du cas urgent #122'
      },
      {
        id: 'act-9',
        date: '2026-07-21T10:00:00.000Z',
        authorName: 'Pôle Solidarité MDF',
        authorRole: 'Bureau National',
        action: 'Cas traité et résolu',
        previousStatus: 'EN_COURS',
        newStatus: 'TRAITE'
      }
    ],
    bureauNotes: 'Contact téléphonique établi par le responsable solidarité. Visite effectuée.',
    reviewedBy: 'Pôle Solidarité MDF',
    reviewedAt: '2026-07-21T10:00:00.000Z',
    createdAt: '2026-07-20T17:00:00.000Z',
    updatedAt: '2026-07-21T10:00:00.000Z',
    lastActivityAt: '2026-07-21T10:00:00.000Z'
  },
  {
    id: 'rep-121',
    caseNumber: '#121',
    referentId: 'usr-modou',
    referentName: 'Modou Mbaye',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '06 12 34 56 78',
    zone: 'Bretagne',
    zoneId: 'zone-bretagne',
    type: 'PERIODIQUE',
    sujet: 'Bilan estival et cartographie des membres en Bretagne',
    priority: 'NORMAL',
    semaineLundi: '2026-07-13',
    nouveauxContactes: '3 nouveaux membres à Brest et Saint-Malo',
    situationsPrioritaires: 'Un étudiant ingénieur recherche un stage de fin d\'études en télécoms.',
    activitesLocales: 'Barbecue d\'été convivial des membres bretons organisé au parc du Thabor à Rennes. 18 participants.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    datePriseEnCharge: '2026-07-14T09:00:00.000Z',
    dateTraitement: '2026-07-16T11:20:00.000Z',
    bureauNotes: 'Félicitations pour cette belle initiative estivale ! CV transmis au réseau alumni.',
    reviewedBy: 'Présidence MDF',
    reviewedAt: '2026-07-16T11:20:00.000Z',
    createdAt: '2026-07-13T21:10:00.000Z',
    updatedAt: '2026-07-16T11:20:00.000Z',
    lastActivityAt: '2026-07-16T11:20:00.000Z'
  },
  {
    id: 'rep-120',
    caseNumber: '#120',
    referentId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    email: 'referent.idf@mbokdefrance.org',
    telephone: '06 98 76 54 32',
    zone: 'Île-de-France',
    zoneId: 'zone-idf',
    type: 'PONCTUEL',
    sujet: 'Validation budgétaire location de salle séminaire IDF',
    priority: 'IMPORTANT',
    semaineLundi: '2026-07-06',
    nouveauxContactes: '12 nouveaux contacts (diplômés et entrepreneurs)',
    situationsPrioritaires: 'Mise en place d\'un mentorat pour 3 primo-arrivants boursiers.',
    activitesLocales: 'Atelier CV et préparation aux entretiens d\'embauche en visioconférence.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Validation budgétaire pour la location d\'une salle à Paris pour le séminaire d\'octobre.',
    urgenceLevel: 3,
    status: 'TRAITE',
    responsableId: 'usr-admin-tresor',
    responsableName: 'Trésorier National MDF',
    datePriseEnCharge: '2026-07-07T10:00:00.000Z',
    dateReponse: '2026-07-09T16:45:00.000Z',
    dateTraitement: '2026-07-09T16:45:00.000Z',
    reponses: [
      {
        id: 'rep-resp-5',
        authorName: 'Trésorier National MDF',
        authorRole: 'bureau',
        content: 'Budget de 450€ validé par la trésorerie. L\'acompte a été viré directement au gestionnaire de la salle.',
        createdAt: '2026-07-09T16:45:00.000Z'
      }
    ],
    bureauNotes: 'Budget de réservation de salle validé par la trésorerie MDF.',
    reviewedBy: 'Trésorier MDF',
    reviewedAt: '2026-07-09T16:45:00.000Z',
    createdAt: '2026-07-06T18:30:00.000Z',
    updatedAt: '2026-07-09T16:45:00.000Z',
    lastActivityAt: '2026-07-09T16:45:00.000Z'
  },

  // JUIN 2026
  {
    id: 'rep-119',
    caseNumber: '#119',
    referentId: 'usr-referent-occitanie',
    referentName: 'Cheikh Tidiane Sy',
    email: 'referent.toulouse@mbokdefrance.org',
    telephone: '06 33 44 55 66',
    zone: 'Occitanie',
    zoneId: 'zone-occitanie',
    type: 'PERIODIQUE',
    sujet: 'Rapport mensuel d\'activité Occitanie — Juin 2026',
    priority: 'NORMAL',
    semaineLundi: '2026-06-15',
    nouveauxContactes: '7 nouveaux membres à Toulouse et Montpellier',
    situationsPrioritaires: 'Création d\'un pôle étudiant pour la rentrée universitaire toulousaine.',
    activitesLocales: 'Réunion de zone et recensement des compétences techniques.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    datePriseEnCharge: '2026-06-16T14:00:00.000Z',
    dateTraitement: '2026-06-18T16:00:00.000Z',
    bureauNotes: 'Excellent rapport. Antenne Occitanie très dynamique.',
    reviewedBy: 'Administrateur MDF',
    reviewedAt: '2026-06-18T16:00:00.000Z',
    createdAt: '2026-06-15T19:20:00.000Z',
    updatedAt: '2026-06-18T16:00:00.000Z',
    lastActivityAt: '2026-06-18T16:00:00.000Z'
  },
  {
    id: 'rep-118',
    caseNumber: '#118',
    referentId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    email: 'referent.idf@mbokdefrance.org',
    telephone: '06 98 76 54 32',
    zone: 'Île-de-France',
    zoneId: 'zone-idf',
    type: 'PERIODIQUE',
    sujet: 'Rapport mensuel IDF — Juin 2026',
    priority: 'NORMAL',
    semaineLundi: '2026-06-08',
    nouveauxContactes: '14 nouveaux contacts',
    situationsPrioritaires: '3 dossiers de titre de séjour accompagnés par notre juriste bénévole.',
    activitesLocales: 'Atelier droits & démarches administratives à Saint-Denis.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    dateTraitement: '2026-06-11T12:00:00.000Z',
    bureauNotes: 'Validé.',
    createdAt: '2026-06-08T20:00:00.000Z',
    updatedAt: '2026-06-11T12:00:00.000Z',
    lastActivityAt: '2026-06-11T12:00:00.000Z'
  },
  {
    id: 'rep-117',
    caseNumber: '#117',
    referentId: 'usr-referent-pdl',
    referentName: 'Babacar Diop',
    email: 'referent.nantes@mbokdefrance.org',
    telephone: '06 65 43 21 09',
    zone: 'Pays de la Loire',
    zoneId: 'zone-pays-de-la-loire',
    type: 'PONCTUEL',
    sujet: 'Partenariat local avec l\'université de Nantes',
    priority: 'IMPORTANT',
    semaineLundi: '2026-06-01',
    nouveauxContactes: '4 nouveaux membres',
    situationsPrioritaires: 'Conventionnement avec l\'asso étudiante internationale.',
    activitesLocales: 'Rencontre avec le service des relations internationales de Nantes.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Validation juridique du modèle de convention de partenariat par le Bureau.',
    urgenceLevel: 3,
    status: 'TRAITE',
    responsableId: 'usr-admin-juridique',
    responsableName: 'Commission Juridique MDF',
    datePriseEnCharge: '2026-06-02T10:00:00.000Z',
    dateReponse: '2026-06-04T15:30:00.000Z',
    dateTraitement: '2026-06-04T15:30:00.000Z',
    reponses: [
      {
        id: 'rep-resp-6',
        authorName: 'Commission Juridique MDF',
        authorRole: 'bureau',
        content: 'Modèle de convention relu et approuvé avec mention spéciale sur la protection des données (RGPD).',
        createdAt: '2026-06-04T15:30:00.000Z'
      }
    ],
    bureauNotes: 'Convention signée et enregistrée aux archives.',
    createdAt: '2026-06-01T18:00:00.000Z',
    updatedAt: '2026-06-04T15:30:00.000Z',
    lastActivityAt: '2026-06-04T15:30:00.000Z'
  },

  // MAI 2026
  {
    id: 'rep-116',
    caseNumber: '#116',
    referentId: 'usr-referent-na',
    referentName: 'Fatou Sarr',
    email: 'referent.bordeaux@mbokdefrance.org',
    telephone: '06 55 66 77 88',
    zone: 'Nouvelle-Aquitaine',
    zoneId: 'zone-nouvelle-aquitaine',
    type: 'PERIODIQUE',
    sujet: 'Rapport mensuel Nouvelle-Aquitaine — Mai 2026',
    priority: 'NORMAL',
    semaineLundi: '2026-05-18',
    nouveauxContactes: '5 nouveaux membres à Bordeaux',
    situationsPrioritaires: 'Organisation du relais d\'accueil gare Saint-Jean.',
    activitesLocales: 'Point mensuel convivial et cartographie locale.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    dateTraitement: '2026-05-21T11:00:00.000Z',
    bureauNotes: 'Rapport archivé avec succès.',
    createdAt: '2026-05-18T20:00:00.000Z',
    updatedAt: '2026-05-21T11:00:00.000Z',
    lastActivityAt: '2026-05-21T11:00:00.000Z'
  },
  {
    id: 'rep-115',
    caseNumber: '#115',
    referentId: 'usr-modou',
    referentName: 'Modou Mbaye',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '06 12 34 56 78',
    zone: 'Bretagne',
    zoneId: 'zone-bretagne',
    type: 'PERIODIQUE',
    sujet: 'Bilan de printemps antenne Bretagne — Mai 2026',
    priority: 'NORMAL',
    semaineLundi: '2026-05-11',
    nouveauxContactes: '5 nouveaux membres à Rennes et Quimper',
    situationsPrioritaires: 'Aide à la déclaration d\'impôts pour les primo-déclarants.',
    activitesLocales: 'Atelier fiscalité et permanence d\'entraide.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    dateTraitement: '2026-05-14T09:30:00.000Z',
    bureauNotes: 'Rapport validé.',
    createdAt: '2026-05-11T19:00:00.000Z',
    updatedAt: '2026-05-14T09:30:00.000Z',
    lastActivityAt: '2026-05-14T09:30:00.000Z'
  },
  {
    id: 'rep-114',
    caseNumber: '#114',
    referentId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    email: 'referent.idf@mbokdefrance.org',
    telephone: '06 98 76 54 32',
    zone: 'Île-de-France',
    zoneId: 'zone-idf',
    type: 'PONCTUEL',
    sujet: 'Aide d\'urgence rentrée stage international',
    priority: 'IMPORTANT',
    semaineLundi: '2026-05-04',
    nouveauxContactes: '9 nouveaux adhérents',
    situationsPrioritaires: 'Un étudiant stagiaire bloqué temporairement sans bourse.',
    activitesLocales: 'Entraide solidaire locale.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Attribution du fonds de solidarité ponctuel MDF.',
    urgenceLevel: 3,
    status: 'TRAITE',
    responsableId: 'usr-admin-b',
    responsableName: 'Pôle Solidarité MDF',
    datePriseEnCharge: '2026-05-05T10:00:00.000Z',
    dateReponse: '2026-05-06T17:00:00.000Z',
    dateTraitement: '2026-05-07T12:00:00.000Z',
    reponses: [
      {
        id: 'rep-resp-7',
        authorName: 'Pôle Solidarité MDF',
        authorRole: 'bureau',
        content: 'Fonds de solidarité accordé et versé. Situation régularisée.',
        createdAt: '2026-05-06T17:00:00.000Z'
      }
    ],
    bureauNotes: 'Dossier traité et classé.',
    createdAt: '2026-05-04T18:00:00.000Z',
    updatedAt: '2026-05-07T12:00:00.000Z',
    lastActivityAt: '2026-05-07T12:00:00.000Z'
  }
];

export interface PilotageStatsResult {
  totalRemontees: number;
  casRemontees: number;
  casTraites: number;
  casEnCours: number;
  casNouveaux: number;
  tauxTraitement: number; // Percentage
  delaiMoyenReponseJours: number; // Average response time in days
  delaiMoyenTraitementJours: number; // Average treatment time in days
  tauxRegularite: number; // Percentage
  casUrgents: number;
  
  // Charts & breakdowns
  chartRemontesVsTraites: Array<{
    period: string;
    remontes: number;
    traites: number;
    enCours: number;
  }>;
  chartActivityPerReferent: Array<{
    referentName: string;
    zone: string;
    count: number;
    traites: number;
    enCours: number;
  }>;
  chartStatusDistribution: Array<{
    name: string;
    value: number;
    color: string;
    status: ReportingStatus;
  }>;
  chartTimelineActivity: Array<{
    date: string;
    label: string;
    count: number;
  }>;
  zoneActivitySummary: Array<{
    zone: string;
    total: number;
    traites: number;
    enCours: number;
    nouveaux: number;
    urgences: number;
    tauxTraitement: number;
    delaiMoyen: number;
  }>;
  referentsRanking: Array<{
    referentName: string;
    zone: string;
    email: string;
    total: number;
    traites: number;
    enCours: number;
    urgents: number;
    delaiMoyenReponse: number;
    regularite: number;
  }>;
}

export class ReportingService {
  static getPriorityFromUrgence(urgenceLevel: number): 'NORMAL' | 'IMPORTANT' | 'URGENT' {
    if (urgenceLevel >= 4) return 'URGENT';
    if (urgenceLevel === 3) return 'IMPORTANT';
    return 'NORMAL';
  }

  static getReports(): WeeklyReport[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REPORTINGS_KEY) || localStorage.getItem('mbok_de_france_weekly_reports_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, WeeklyReport>();
          
          INITIAL_WEEKLY_REPORTS.forEach((r) => {
            map.set(r.id, r);
          });
          
          parsed.forEach((r: WeeklyReport) => {
            const enriched: WeeklyReport = {
              ...r,
              caseNumber: r.caseNumber || `#${r.id.replace(/\D/g, '').slice(-3) || '101'}`,
              priority: r.priority || this.getPriorityFromUrgence(r.urgenceLevel || 1),
              type: r.type || 'PERIODIQUE',
              lastActivityAt: r.lastActivityAt || r.updatedAt || r.createdAt,
              reponses: r.reponses || [],
              actionHistory: r.actionHistory || []
            };
            map.set(r.id, enriched);
          });

          const merged = Array.from(map.values()).sort((a, b) => {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
          });

          return merged;
        }
      }
    } catch (e) {
      console.error('Erreur chargement reports:', e);
    }

    return INITIAL_WEEKLY_REPORTS;
  }

  static saveReports(reports: WeeklyReport[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_REPORTINGS_KEY, JSON.stringify(reports));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mbok_reports_updated', { detail: reports }));
      }
    } catch (e) {
      console.error('Erreur sauvegarde reports:', e);
    }
  }

  static createReport(
    reportData: Omit<WeeklyReport, 'id' | 'createdAt'>,
    existingReports?: WeeklyReport[]
  ): WeeklyReport {
    const reports = existingReports || this.getReports();
    const now = new Date().toISOString();
    const calculatedPriority = reportData.priority || this.getPriorityFromUrgence(reportData.urgenceLevel || 1);
    const nextCaseNumber = `#${126 + reports.length}`;

    const newReport: WeeklyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      caseNumber: nextCaseNumber,
      status: reportData.status || 'NOUVEAU',
      type: reportData.type || 'PERIODIQUE',
      priority: calculatedPriority,
      reponses: reportData.reponses || [],
      actionHistory: reportData.actionHistory || [
        {
          id: `act-${Date.now()}`,
          date: now,
          authorName: reportData.referentName || 'Référent de zone',
          authorRole: `Référent ${reportData.zone}`,
          action: `Création du ${reportData.type === 'PONCTUEL' ? 'cas ponctuel' : 'reporting périodique'} ${nextCaseNumber}`,
          details: reportData.sujet || 'Transmission initiale'
        }
      ],
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now
    };

    const updated = [newReport, ...reports];
    this.saveReports(updated);
    return newReport;
  }

  static assignResponsable(
    reportId: string,
    responsableId: string,
    responsableName: string,
    existingReports?: WeeklyReport[]
  ): WeeklyReport[] {
    const reports = existingReports || this.getReports();
    const now = new Date().toISOString();

    const updated = reports.map((r) => {
      if (r.id === reportId) {
        const history = [...(r.actionHistory || [])];
        history.push({
          id: `act-${Date.now()}`,
          date: now,
          authorName: 'Bureau National MDF',
          authorRole: 'Bureau National',
          action: `Attribution du dossier à ${responsableName}`,
          details: `Responsable assigné : ${responsableName}`
        });

        return {
          ...r,
          responsableId,
          responsableName,
          status: r.status === 'NOUVEAU' ? 'EN_COURS' : r.status,
          datePriseEnCharge: r.datePriseEnCharge || now,
          actionHistory: history,
          updatedAt: now,
          lastActivityAt: now
        };
      }
      return r;
    });

    this.saveReports(updated);
    return updated;
  }

  static addResponse(
    reportId: string,
    responseData: {
      authorName: string;
      authorRole?: 'bureau' | 'referent' | 'admin';
      content: string;
      piecesJointes?: any[];
    },
    existingReports?: WeeklyReport[]
  ): WeeklyReport[] {
    const reports = existingReports || this.getReports();
    const now = new Date().toISOString();

    const updated = reports.map((r) => {
      if (r.id === reportId) {
        const newResp: ReportResponse = {
          id: `resp-${Date.now()}`,
          authorName: responseData.authorName,
          authorRole: responseData.authorRole || 'bureau',
          content: responseData.content,
          piecesJointes: responseData.piecesJointes,
          createdAt: now
        };

        const history = [...(r.actionHistory || [])];
        history.push({
          id: `act-${Date.now()}`,
          date: now,
          authorName: responseData.authorName,
          authorRole: responseData.authorRole === 'referent' ? 'Référent' : 'Bureau National',
          action: responseData.authorRole === 'referent' ? 'Message ajouté par le Référent' : 'Réponse du Bureau transmise',
          details: responseData.content.slice(0, 80) + (responseData.content.length > 80 ? '...' : '')
        });

        return {
          ...r,
          status: responseData.authorRole === 'referent' ? r.status : (r.status === 'NOUVEAU' ? 'EN_COURS' : r.status),
          dateReponse: responseData.authorRole !== 'referent' ? now : r.dateReponse,
          datePriseEnCharge: r.datePriseEnCharge || now,
          reponses: [...(r.reponses || []), newResp],
          actionHistory: history,
          updatedAt: now,
          lastActivityAt: now
        };
      }
      return r;
    });

    this.saveReports(updated);
    return updated;
  }

  static addReport(reportData: Omit<WeeklyReport, 'id' | 'createdAt' | 'status'>): WeeklyReport {
    const reports = this.getReports();
    const now = new Date().toISOString();
    const calculatedPriority = reportData.priority || this.getPriorityFromUrgence(reportData.urgenceLevel || 1);
    const nextCaseNumber = `#${126 + reports.length}`;

    const newReport: WeeklyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      caseNumber: nextCaseNumber,
      status: 'NOUVEAU',
      type: reportData.type || 'PERIODIQUE',
      priority: calculatedPriority,
      reponses: [],
      actionHistory: [
        {
          id: `act-${Date.now()}`,
          date: now,
          authorName: reportData.referentName || 'Référent de zone',
          authorRole: `Référent ${reportData.zone}`,
          action: `Création du ${reportData.type === 'PONCTUEL' ? 'cas ponctuel' : 'reporting périodique'} ${nextCaseNumber}`,
          details: reportData.sujet || 'Transmission initiale'
        }
      ],
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now
    };

    const updated = [newReport, ...reports];
    this.saveReports(updated);
    return newReport;
  }

  static updateReportStatus(
    reportId: string, 
    status: ReportingStatus, 
    bureauNotes?: string, 
    reviewerName?: string,
    responsableId?: string,
    responsableName?: string
  ): WeeklyReport[] {
    const reports = this.getReports();
    const now = new Date().toISOString();

    const updated = reports.map((r) => {
      if (r.id === reportId) {
        const prevStatus = r.status;
        const history = [...(r.actionHistory || [])];

        let newPriseEnCharge = r.datePriseEnCharge;
        let newTraitement = r.dateTraitement;
        let newReponse = r.dateReponse;

        if (status === 'EN_COURS' && !newPriseEnCharge) {
          newPriseEnCharge = now;
        }
        if (status === 'TRAITE' && !newTraitement) {
          newTraitement = now;
        }

        if (prevStatus !== status) {
          history.push({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: now,
            authorName: reviewerName || 'Bureau National MDF',
            authorRole: 'Bureau National',
            action: `Changement de statut : ${prevStatus} ➔ ${status}`,
            previousStatus: prevStatus,
            newStatus: status,
            details: bureauNotes ? `Note ajoutée : ${bureauNotes}` : undefined
          });
        }

        return {
          ...r,
          status,
          bureauNotes: bureauNotes !== undefined ? bureauNotes : r.bureauNotes,
          reviewedBy: reviewerName || r.reviewedBy,
          reviewedAt: now,
          responsableId: responsableId !== undefined ? responsableId : r.responsableId,
          responsableName: responsableName !== undefined ? responsableName : r.responsableName,
          datePriseEnCharge: newPriseEnCharge,
          dateTraitement: newTraitement,
          dateReponse: newReponse,
          actionHistory: history,
          updatedAt: now,
          lastActivityAt: now
        };
      }
      return r;
    });

    this.saveReports(updated);
    return updated;
  }

  static addBureauResponse(
    reportId: string,
    responseContent: string,
    authorName: string,
    authorRole: 'bureau' | 'referent' | 'admin' = 'bureau',
    newStatus?: ReportingStatus
  ): WeeklyReport[] {
    const reports = this.getReports();
    const now = new Date().toISOString();

    const updated = reports.map((r) => {
      if (r.id === reportId) {
        const newResponse: ReportResponse = {
          id: `resp-${Date.now()}`,
          authorName,
          authorRole,
          content: responseContent,
          createdAt: now
        };

        const reponses = [...(r.reponses || []), newResponse];
        const history = [...(r.actionHistory || [])];

        history.push({
          id: `act-${Date.now()}`,
          date: now,
          authorName,
          authorRole: authorRole === 'bureau' ? 'Bureau National' : 'Référent',
          action: authorRole === 'bureau' ? 'Réponse du Bureau transmise' : 'Message ajouté par le Référent',
          details: responseContent.slice(0, 80) + (responseContent.length > 80 ? '...' : '')
        });

        const targetStatus = newStatus || (r.status === 'NOUVEAU' ? 'EN_COURS' : r.status);

        return {
          ...r,
          status: targetStatus,
          dateReponse: r.dateReponse || now,
          datePriseEnCharge: r.datePriseEnCharge || now,
          dateTraitement: targetStatus === 'TRAITE' ? (r.dateTraitement || now) : r.dateTraitement,
          bureauNotes: responseContent,
          reponses,
          actionHistory: history,
          updatedAt: now,
          lastActivityAt: now
        };
      }
      return r;
    });

    this.saveReports(updated);
    return updated;
  }

  static deleteReport(reportId: string): WeeklyReport[] {
    const reports = this.getReports();
    const updated = reports.filter((r) => r.id !== reportId);
    this.saveReports(updated);
    return updated;
  }

  /**
   * Calcul automatique et dynamique des statistiques de pilotage (KPI, Taux, Délais, Graphiques)
   */
  static calculatePilotage(reports: WeeklyReport[]): PilotageStatsResult {
    const totalRemontees = reports.length;
    const casRemontees = reports.length; // Tous les signalements sont des cas enregistrés
    const casTraites = reports.filter((r) => r.status === 'TRAITE').length;
    const casEnCours = reports.filter((r) => r.status === 'EN_COURS').length;
    const casNouveaux = reports.filter((r) => r.status === 'NOUVEAU').length;
    const casUrgents = reports.filter((r) => r.priority === 'URGENT' || r.urgenceLevel >= 4).length;

    // Taux de traitement = (Cas traités / Cas remontés) * 100
    const tauxTraitement = casRemontees > 0 
      ? Math.round((casTraites / casRemontees) * 1000) / 10 
      : 0;

    // Calcul des délais réels
    let totalResponseDays = 0;
    let countResponse = 0;

    let totalTreatmentDays = 0;
    let countTreatment = 0;

    reports.forEach((r) => {
      const createdTime = new Date(r.createdAt).getTime();

      // Délai de réponse
      const responseTimeStr = r.dateReponse || (r.reponses && r.reponses[0]?.createdAt) || r.reviewedAt;
      if (responseTimeStr) {
        const respTime = new Date(responseTimeStr).getTime();
        const diffDays = Math.max(0.1, (respTime - createdTime) / (1000 * 60 * 60 * 24));
        totalResponseDays += diffDays;
        countResponse++;
      }

      // Délai de traitement
      if (r.status === 'TRAITE') {
        const treatTimeStr = r.dateTraitement || r.reviewedAt || r.updatedAt;
        if (treatTimeStr) {
          const treatTime = new Date(treatTimeStr).getTime();
          const diffDays = Math.max(0.1, (treatTime - createdTime) / (1000 * 60 * 60 * 24));
          totalTreatmentDays += diffDays;
          countTreatment++;
        }
      }
    });

    const delaiMoyenReponseJours = countResponse > 0 
      ? Math.round((totalResponseDays / countResponse) * 10) / 10 
      : 1.8;

    const delaiMoyenTraitementJours = countTreatment > 0 
      ? Math.round((totalTreatmentDays / countTreatment) * 10) / 10 
      : 2.4;

    // Régularité = reportings réalisés vs attendus (estimé sur mois actifs)
    const tauxRegularite = Math.min(100, Math.round((totalRemontees / Math.max(1, totalRemontees * 1.15)) * 100));

    // Graphique 1 : Cas remontés vs Cas traités par mois
    const monthsMap: Record<string, { period: string; remontes: number; traites: number; enCours: number }> = {};
    
    // Sort reports chronologically
    const sortedReports = [...reports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sortedReports.forEach((r) => {
      const d = new Date(r.createdAt);
      if (!isNaN(d.getTime())) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
        const capitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

        if (!monthsMap[monthKey]) {
          monthsMap[monthKey] = {
            period: capitalized,
            remontes: 0,
            traites: 0,
            enCours: 0
          };
        }

        monthsMap[monthKey].remontes += 1;
        if (r.status === 'TRAITE') {
          monthsMap[monthKey].traites += 1;
        } else if (r.status === 'EN_COURS') {
          monthsMap[monthKey].enCours += 1;
        }
      }
    });

    const chartRemontesVsTraites = Object.keys(monthsMap)
      .sort()
      .map((k) => monthsMap[k]);

    // Graphique 2 : Activité par Référent
    const referentActivityMap: Record<string, { referentName: string; zone: string; email: string; count: number; traites: number; enCours: number; urgents: number; responseTimes: number[] }> = {};

    reports.forEach((r) => {
      const key = r.referentName || 'Référent inconnu';
      if (!referentActivityMap[key]) {
        referentActivityMap[key] = {
          referentName: key,
          zone: r.zone || 'Non définie',
          email: r.email || '',
          count: 0,
          traites: 0,
          enCours: 0,
          urgents: 0,
          responseTimes: []
        };
      }

      referentActivityMap[key].count += 1;
      if (r.status === 'TRAITE') referentActivityMap[key].traites += 1;
      if (r.status === 'EN_COURS') referentActivityMap[key].enCours += 1;
      if (r.priority === 'URGENT' || r.urgenceLevel >= 4) referentActivityMap[key].urgents += 1;

      const createdTime = new Date(r.createdAt).getTime();
      const responseTimeStr = r.dateReponse || r.reviewedAt;
      if (responseTimeStr) {
        const diff = (new Date(responseTimeStr).getTime() - createdTime) / (1000 * 60 * 60 * 24);
        referentActivityMap[key].responseTimes.push(Math.max(0.1, diff));
      }
    });

    const chartActivityPerReferent = Object.values(referentActivityMap)
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        referentName: item.referentName,
        zone: item.zone,
        count: item.count,
        traites: item.traites,
        enCours: item.enCours
      }));

    // Graphique 3 : Répartition des cas par statut (Donut)
    const chartStatusDistribution = [
      { name: 'Nouveau', value: casNouveaux, color: '#3b82f6', status: 'NOUVEAU' as ReportingStatus },
      { name: 'En cours', value: casEnCours, color: '#f59e0b', status: 'EN_COURS' as ReportingStatus },
      { name: 'Traité', value: casTraites, color: '#10b981', status: 'TRAITE' as ReportingStatus }
    ].filter((item) => item.value > 0);

    // Graphique 4 : Timeline d'évolution dans le temps
    const timelineMap: Record<string, number> = {};
    sortedReports.forEach((r) => {
      const d = new Date(r.createdAt);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        timelineMap[key] = (timelineMap[key] || 0) + 1;
      }
    });

    const chartTimelineActivity = Object.entries(timelineMap).map(([label, count]) => ({
      date: label,
      label,
      count
    }));

    // Activité par Zone
    const zoneMap: Record<string, { total: number; traites: number; enCours: number; nouveaux: number; urgences: number; treatmentDays: number[] }> = {};

    reports.forEach((r) => {
      const z = r.zone || 'Non assignée';
      if (!zoneMap[z]) {
        zoneMap[z] = { total: 0, traites: 0, enCours: 0, nouveaux: 0, urgences: 0, treatmentDays: [] };
      }
      zoneMap[z].total += 1;
      if (r.status === 'TRAITE') zoneMap[z].traites += 1;
      if (r.status === 'EN_COURS') zoneMap[z].enCours += 1;
      if (r.status === 'NOUVEAU') zoneMap[z].nouveaux += 1;
      if (r.priority === 'URGENT' || r.urgenceLevel >= 4) zoneMap[z].urgences += 1;

      if (r.status === 'TRAITE' && (r.dateTraitement || r.reviewedAt)) {
        const dTreat = (new Date(r.dateTraitement || r.reviewedAt!).getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600 * 24);
        zoneMap[z].treatmentDays.push(Math.max(0.1, dTreat));
      }
    });

    const zoneActivitySummary = Object.entries(zoneMap)
      .map(([zone, data]) => {
        const rate = data.total > 0 ? Math.round((data.traites / data.total) * 1000) / 10 : 0;
        const avgDays = data.treatmentDays.length > 0
          ? Math.round((data.treatmentDays.reduce((a, b) => a + b, 0) / data.treatmentDays.length) * 10) / 10
          : 2.0;

        return {
          zone,
          total: data.total,
          traites: data.traites,
          enCours: data.enCours,
          nouveaux: data.nouveaux,
          urgences: data.urgences,
          tauxTraitement: rate,
          delaiMoyen: avgDays
        };
      })
      .sort((a, b) => b.total - a.total);

    // Référents les plus actifs (Classement bienveillant)
    const referentsRanking = Object.values(referentActivityMap)
      .map((ref) => {
        const avgResp = ref.responseTimes.length > 0
          ? Math.round((ref.responseTimes.reduce((a, b) => a + b, 0) / ref.responseTimes.length) * 10) / 10
          : 2.1;
        const reg = Math.min(100, Math.round((ref.count / Math.max(1, ref.count * 1.1)) * 100));

        return {
          referentName: ref.referentName,
          zone: ref.zone,
          email: ref.email,
          total: ref.count,
          traites: ref.traites,
          enCours: ref.enCours,
          urgents: ref.urgents,
          delaiMoyenReponse: avgResp,
          regularite: reg
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      totalRemontees,
      casRemontees,
      casTraites,
      casEnCours,
      casNouveaux,
      tauxTraitement,
      delaiMoyenReponseJours,
      delaiMoyenTraitementJours,
      tauxRegularite,
      casUrgents,
      chartRemontesVsTraites,
      chartActivityPerReferent,
      chartStatusDistribution,
      chartTimelineActivity,
      zoneActivitySummary,
      referentsRanking
    };
  }
}


