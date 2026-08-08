/**
 * Données de seed — COPIE ASSUMÉE du frontend figé (source de vérité) :
 * - zones : DEFAULT_CUSTOM_ZONES (frontend/web-cartographie/src/app/App.tsx)
 * - membres : INITIAL_MEMBERS (frontend/web-cartographie/src/data/initialMembers.ts)
 *
 * On ne les importe pas depuis le frontend pour ne pas coupler le backend au
 * bundle React. Les identifiants texte ('mdf-001', 'zone-bretagne'...) doivent
 * rester identiques : les données par défaut du frontend les référencent en dur.
 *
 * Les référents des zones de démo (usr-modou, usr-referent-idf) n'existent plus :
 * seul l'admin racine est créé — les zones sont donc seedées sans référent
 * (la synchronisation automatique du frontend les positionnera quand des
 * comptes référents seront créés dans l'application).
 */
import { Member, CustomZone, AppUser } from '../../shared/types/index';

export const ROOT_ADMIN = {
  appUserId: 'usr-admin',
  email: 'salyndiayembaye@gmail.com',
  password: 'Ziguinchor1999@',
  username: 'bilal',
  displayName: 'Bilal',
  nom: 'Mbaye',
  prenom: 'Bilal'
} as const;

export const SEED_ROOT_ADMIN_USER: Omit<AppUser, 'password'> = {
  id: ROOT_ADMIN.appUserId,
  nom: ROOT_ADMIN.nom,
  prenom: ROOT_ADMIN.prenom,
  name: ROOT_ADMIN.displayName,
  email: ROOT_ADMIN.email,
  username: ROOT_ADMIN.username,
  role: 'super_admin',
  active: true,
  lastLogin: 'Nouveau'
};

const SEED_DATE_ISO = '2026-01-01T00:00:00.000Z';

export const SEED_ZONES: CustomZone[] = [
  {
    id: 'zone-auvergne-rhone-alpes',
    name: 'Auvergne-Rhône-Alpes',
    description: 'Antennes Auvergne-Rhône-Alpes (Lyon, Grenoble, Saint-Étienne...)',
    color: 'purple',
    memberIds: ['mdf-004'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    description: 'Antennes Bourgogne-Franche-Comté (Dijon, Besançon, Belfort...)',
    color: 'amber',
    memberIds: [],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-bretagne',
    name: 'Bretagne',
    description: 'Réseau et membres basés en région Bretagne (Rennes, Brest, Quimper...)',
    color: 'emerald',
    memberIds: ['mdf-010', 'mdf-modou'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-centre-val-de-loire',
    name: 'Centre-Val de Loire',
    description: 'Réseau Centre-Val de Loire (Orléans, Tours, Bourges...)',
    color: 'teal',
    memberIds: [],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-corse',
    name: 'Corse',
    description: 'Antenne et membres basés en Corse (Ajaccio, Bastia...)',
    color: 'rose',
    memberIds: [],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-grand-est',
    name: 'Grand Est',
    description: 'Réseau Grand Est (Strasbourg, Reims, Metz, Nancy...)',
    color: 'indigo',
    memberIds: ['mdf-007'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-hauts-de-france',
    name: 'Hauts-de-France',
    description: 'Antennes Hauts-de-France (Lille, Amiens, Roubaix...)',
    color: 'blue',
    memberIds: ['mdf-006'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-idf',
    name: 'Île-de-France',
    description: 'Membres actifs en Île-de-France et réseau Parisien',
    color: 'blue',
    memberIds: ['mdf-001', 'mdf-002', 'mdf-011', 'mdf-012'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-normandie',
    name: 'Normandie',
    description: 'Réseau et antenne Normandie (Rouen, Caen, Le Havre...)',
    color: 'indigo',
    memberIds: [],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    description: 'Réseau Nouvelle-Aquitaine (Bordeaux, Limoges, Poitiers...)',
    color: 'amber',
    memberIds: ['mdf-005'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-occitanie',
    name: 'Occitanie',
    description: 'Antennes Occitanie (Toulouse, Montpellier, Nîmes...)',
    color: 'rose',
    memberIds: ['mdf-008'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-pays-de-la-loire',
    name: 'Pays de la Loire',
    description: 'Réseau et antenne Pays de la Loire (Nantes, Angers, Le Mans...)',
    color: 'teal',
    memberIds: ['mdf-009'],
    createdAt: SEED_DATE_ISO
  },
  {
    id: 'zone-paca',
    name: 'Provence-Alpes-Côte d\'Azur',
    description: 'Réseau Provence-Alpes-Côte d\'Azur (Marseille, Nice, Avignon...)',
    color: 'emerald',
    memberIds: ['mdf-003'],
    createdAt: SEED_DATE_ISO
  }
];

export const SEED_MEMBERS: Member[] = [
  {
    id: 'mdf-001',
    nom: 'Diallo',
    prenom: 'Aïssatou',
    zone: 'Île-de-France',
    situationProfessionnelle: 'Cadre supérieure',
    domaineEtude: 'Santé publique',
    anneeArriveeFrance: '2015',
    fonction: 'Directrice de Centre',
    organisation: 'MDF Paris - Saint-Denis',
    email: 'aissatou.diallo@mdf-france.org',
    telephone: '01 48 20 12 34',
    adresse: '12 Rue Gabriel Péri',
    codePostal: '93200',
    ville: 'Saint-Denis',
    departement: 'Seine-Saint-Denis (93)',
    region: 'Île-de-France',
    pays: 'France',
    latitude: 48.9358,
    longitude: 2.3580,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    champsPersonnalises: [
      { id: 'cp-1', label: 'Cotisation 2026', value: 'À jour' },
      { id: 'cp-2', label: 'Langues parlées', value: 'Français, Peul, Wolof' }
    ]
  },
  {
    id: 'mdf-002',
    nom: 'Martin',
    prenom: 'Camille',
    zone: 'Île-de-France',
    situationProfessionnelle: 'Salariée (Médecin)',
    domaineEtude: 'Médecine générale',
    anneeArriveeFrance: '2012',
    fonction: 'Médecin Coordinatrice',
    organisation: 'MDF Paris - Bichat',
    email: 'camille.martin@mdf-france.org',
    telephone: '01 40 25 80 00',
    adresse: '46 Rue Henri Huchard',
    codePostal: '75018',
    ville: 'Paris',
    departement: 'Paris (75)',
    region: 'Île-de-France',
    pays: 'France',
    latitude: 48.8988,
    longitude: 2.3315,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-003',
    nom: 'Benali',
    prenom: 'Karim',
    zone: 'Provence-Alpes-Côte d\'Azur',
    situationProfessionnelle: 'Libéral / Indépendant',
    domaineEtude: 'Psychologie clinique',
    anneeArriveeFrance: '2018',
    fonction: 'Psychologue Clinicien',
    organisation: 'MDF Marseille - La Timone',
    email: 'karim.benali@mdf-france.org',
    telephone: '04 91 38 00 00',
    adresse: '264 Rue Saint-Pierre',
    codePostal: '13005',
    ville: 'Marseille',
    departement: 'Bouches-du-Rhône (13)',
    region: 'Provence-Alpes-Côte d\'Azur',
    pays: 'France',
    latitude: 43.2921,
    longitude: 5.4022,
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-004',
    nom: 'Dubois',
    prenom: 'SOPHIE',
    zone: 'Auvergne-Rhône-Alpes',
    situationProfessionnelle: 'Salariée',
    domaineEtude: 'Action sociale & Humanitaire',
    anneeArriveeFrance: '2016',
    fonction: 'Assistante Sociale',
    organisation: 'MDF Lyon - Croix-Rousse',
    email: 'sophie.dubois@mdf-france.org',
    telephone: '04 72 07 10 20',
    adresse: '103 Grande Rue de la Croix-Rousse',
    codePostal: '69004',
    ville: 'Lyon',
    departement: 'Rhône (69)',
    region: 'Auvergne-Rhône-Alpes',
    pays: 'France',
    latitude: 45.7765,
    longitude: 4.8318,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-005',
    nom: 'Traoré',
    prenom: 'Mamadou',
    zone: 'Nouvelle-Aquitaine',
    situationProfessionnelle: 'Cadre juriste',
    domaineEtude: 'Droit international & Droits humains',
    anneeArriveeFrance: '2017',
    fonction: 'Juriste Droit des Femmes',
    organisation: 'MDF Bordeaux - Pellegrin',
    email: 'mamadou.traore@mdf-france.org',
    telephone: '05 56 79 56 79',
    adresse: 'Place Amélie Raba Léon',
    codePostal: '33000',
    ville: 'Bordeaux',
    departement: 'Gironde (33)',
    region: 'Nouvelle-Aquitaine',
    pays: 'France',
    latitude: 44.8302,
    longitude: -0.6033,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-006',
    nom: 'Leroy',
    prenom: 'Julie',
    zone: 'Hauts-de-France',
    situationProfessionnelle: 'Salariée (Sage-femme)',
    domaineEtude: 'Sciences maïeutiques',
    anneeArriveeFrance: '2014',
    fonction: 'Sage-Femme Référente',
    organisation: 'MDF Lille - CHU',
    email: 'julie.leroy@mdf-france.org',
    telephone: '03 20 44 59 62',
    adresse: '2 Avenue Oscar Lambret',
    codePostal: '59000',
    ville: 'Lille',
    departement: 'Nord (59)',
    region: 'Hauts-de-France',
    pays: 'France',
    latitude: 50.6121,
    longitude: 3.0336,
    photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-007',
    nom: 'Kovacs',
    prenom: 'Elena',
    zone: 'Grand Est',
    situationProfessionnelle: 'Cadre associative',
    domaineEtude: 'Relations internationales',
    anneeArriveeFrance: '2019',
    fonction: 'Coordinatrice Réseau',
    organisation: 'MDF Strasbourg',
    email: 'elena.kovacs@mdf-france.org',
    telephone: '03 88 12 80 00',
    adresse: '1 Place de l\'Hôpital',
    codePostal: '67000',
    ville: 'Strasbourg',
    departement: 'Bas-Rhin (67)',
    region: 'Grand Est',
    pays: 'France',
    latitude: 48.5758,
    longitude: 7.7471,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-008',
    nom: 'Moreau',
    prenom: 'Antoine',
    zone: 'Occitanie',
    situationProfessionnelle: 'Salarié',
    domaineEtude: 'Gestion de projet',
    anneeArriveeFrance: '2011',
    fonction: 'Responsable Pôle Accueil',
    organisation: 'MDF Toulouse - Purpan',
    email: 'antoine.moreau@mdf-france.org',
    telephone: '05 61 77 22 33',
    adresse: 'Place du Docteur Baylac',
    codePostal: '31059',
    ville: 'Toulouse',
    departement: 'Haute-Garonne (31)',
    region: 'Occitanie',
    pays: 'France',
    latitude: 43.6108,
    longitude: 1.3992,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-009',
    nom: 'Nguyen',
    prenom: 'Thanh',
    zone: 'Pays de la Loire',
    situationProfessionnelle: 'Praticienne hospitalière',
    domaineEtude: 'Gynécologie obstétrique',
    anneeArriveeFrance: '2013',
    fonction: 'Gynécologue-Obstétricienne',
    organisation: 'MDF Nantes - Hôpital Mère-Enfant',
    email: 'thanh.nguyen@mdf-france.org',
    telephone: '02 40 08 33 33',
    adresse: '38 Boulevard Boissière',
    codePostal: '44000',
    ville: 'Nantes',
    departement: 'Loire-Atlantique (44)',
    region: 'Pays de la Loire',
    pays: 'France',
    latitude: 47.2184,
    longitude: -1.5536,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-010',
    nom: 'Bernard',
    prenom: 'Florence',
    zone: 'Bretagne',
    situationProfessionnelle: 'Indépendante / Thérapeute',
    domaineEtude: 'Beaux-Arts & Art-thérapie',
    anneeArriveeFrance: '2020',
    fonction: 'Art-Thérapeute',
    organisation: 'MDF Rennes',
    email: 'florence.bernard@mdf-france.org',
    telephone: '02 99 28 43 21',
    adresse: '2 Rue Henri le Guilloux',
    codePostal: '35000',
    ville: 'Rennes',
    departement: 'Ille-et-Vilaine (35)',
    region: 'Bretagne',
    pays: 'France',
    latitude: 48.1173,
    longitude: -1.6778,
    photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-011',
    nom: 'Sow',
    prenom: 'Mariama',
    zone: 'Île-de-France',
    situationProfessionnelle: 'Kinésithérapeute',
    domaineEtude: 'Sciences de la rééducation',
    anneeArriveeFrance: '2017',
    fonction: 'Kinesithérapeute Santé de la Femme',
    organisation: 'MDF Paris - Saint-Denis',
    email: 'mariama.sow@mdf-france.org',
    telephone: '01 48 20 12 35',
    adresse: '12 Rue Gabriel Péri',
    codePostal: '93200',
    ville: 'Saint-Denis',
    departement: 'Seine-Saint-Denis (93)',
    region: 'Île-de-France',
    pays: 'France',
    latitude: 48.9362,
    longitude: 2.3585,
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-012',
    nom: 'Petit',
    prenom: 'Gilles',
    zone: 'Île-de-France',
    situationProfessionnelle: 'Cadre administratif',
    domaineEtude: 'Administration publique',
    anneeArriveeFrance: '2010',
    fonction: 'Chargé de Mission Partenariats',
    organisation: 'MDF Bureau National',
    email: 'gilles.petit@mdf-france.org',
    telephone: '01 42 68 55 00',
    adresse: '25 Rue d\'Astorg',
    codePostal: '75008',
    ville: 'Paris',
    departement: 'Paris (75)',
    region: 'Île-de-France',
    pays: 'France',
    latitude: 48.8732,
    longitude: 2.3188,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'mdf-modou',
    nom: 'Mbaye',
    prenom: 'Modou',
    zone: 'Bretagne',
    situationProfessionnelle: 'Cadre Associatif',
    domaineEtude: 'Management & Réseaux',
    anneeArriveeFrance: '2016',
    fonction: 'Référent Régional Bretagne',
    organisation: 'MDF Bretagne - Rennes',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '02 99 12 34 56',
    adresse: '15 Rue de la Monnaie',
    codePostal: '35000',
    ville: 'Rennes',
    departement: 'Ille-et-Vilaine (35)',
    region: 'Bretagne',
    pays: 'France',
    latitude: 48.1113,
    longitude: -1.6800,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  }
];
