// French Communes, Department & Zone Mapping, Geocoding and Normalization Helpers

export interface FrenchCommuneInfo {
  nom: string;
  codePostal?: string;
  departement: string;
  departementCode: string;
  zone: string;
  latitude: number;
  longitude: number;
}

// 13 Official Administrative Regions (MDF Regional Zones)
export const MDF_ZONES = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur'
];

// Department Code to Department Full Label
export const DEPARTEMENTS_MAP: Record<string, string> = {
  '01': 'Ain (01)',
  '02': 'Aisne (02)',
  '03': 'Allier (03)',
  '04': 'Alpes-de-Haute-Provence (04)',
  '05': 'Hautes-Alpes (05)',
  '06': 'Alpes-Maritimes (06)',
  '07': 'Ardèche (07)',
  '08': 'Ardennes (08)',
  '09': 'Ariège (09)',
  '10': 'Aube (10)',
  '11': 'Aude (11)',
  '12': 'Aveyron (12)',
  '13': 'Bouches-du-Rhône (13)',
  '14': 'Calvados (14)',
  '15': 'Cantal (15)',
  '16': 'Charente (16)',
  '17': 'Charente-Maritime (17)',
  '18': 'Cher (18)',
  '19': 'Corrèze (19)',
  '2A': 'Corse-du-Sud (2A)',
  '2B': 'Haute-Corse (2B)',
  '21': 'Côte-d\'Or (21)',
  '22': 'Côtes-d\'Armor (22)',
  '23': 'Creuse (23)',
  '24': 'Dordogne (24)',
  '25': 'Doubs (25)',
  '26': 'Drôme (26)',
  '27': 'Eure (27)',
  '28': 'Eure-et-Loir (28)',
  '29': 'Finistère (29)',
  '30': 'Gard (30)',
  '31': 'Haute-Garonne (31)',
  '32': 'Gers (32)',
  '33': 'Gironde (33)',
  '34': 'Hérault (34)',
  '35': 'Ille-et-Vilaine (35)',
  '36': 'Indre (36)',
  '37': 'Indre-et-Loire (37)',
  '38': 'Isère (38)',
  '39': 'Jura (39)',
  '40': 'Landes (40)',
  '41': 'Loir-et-Cher (41)',
  '42': 'Loire (42)',
  '43': 'Haute-Loire (43)',
  '44': 'Loire-Atlantique (44)',
  '45': 'Loiret (45)',
  '46': 'Lot (46)',
  '47': 'Lot-et-Garonne (47)',
  '48': 'Lozère (48)',
  '49': 'Maine-et-Loire (49)',
  '50': 'Manche (50)',
  '51': 'Marne (51)',
  '52': 'Haute-Marne (52)',
  '53': 'Mayenne (53)',
  '54': 'Meurthe-et-Moselle (54)',
  '55': 'Meuse (55)',
  '56': 'Morbihan (56)',
  '57': 'Moselle (57)',
  '58': 'Nièvre (58)',
  '59': 'Nord (59)',
  '60': 'Oise (60)',
  '61': 'Orne (61)',
  '62': 'Pas-de-Calais (62)',
  '63': 'Puy-de-Dôme (63)',
  '64': 'Pyrénées-Atlantiques (64)',
  '65': 'Hautes-Pyrénées (65)',
  '66': 'Pyrénées-Orientales (66)',
  '67': 'Bas-Rhin (67)',
  '68': 'Haut-Rhin (68)',
  '69': 'Rhône (69)',
  '70': 'Haute-Saône (70)',
  '71': 'Saône-et-Loire (71)',
  '72': 'Sarthe (72)',
  '73': 'Savoie (73)',
  '74': 'Haute-Savoie (74)',
  '75': 'Paris (75)',
  '76': 'Seine-Maritime (76)',
  '77': 'Seine-et-Marne (77)',
  '78': 'Yvelines (78)',
  '79': 'Deux-Sèvres (79)',
  '80': 'Somme (80)',
  '81': 'Tarn (81)',
  '82': 'Tarn-et-Garonne (82)',
  '83': 'Var (83)',
  '84': 'Vaucluse (84)',
  '85': 'Vendée (85)',
  '86': 'Vienne (86)',
  '87': 'Haute-Vienne (87)',
  '88': 'Vosges (88)',
  '89': 'Yonne (89)',
  '90': 'Territoire de Belfort (90)',
  '91': 'Essonne (91)',
  '92': 'Hauts-de-Seine (92)',
  '93': 'Seine-Saint-Denis (93)',
  '94': 'Val-de-Marne (94)',
  '95': 'Val-d\'Oise (95)',
  '971': 'Guadeloupe (971)',
  '972': 'Martinique (972)',
  '973': 'Guyane (973)',
  '974': 'La Réunion (974)',
  '976': 'Mayotte (976)'
};

// Department Code to MDF Regional Zone
export const DEPARTEMENT_TO_ZONE: Record<string, string> = {
  // Île-de-France
  '75': 'Île-de-France',
  '77': 'Île-de-France',
  '78': 'Île-de-France',
  '91': 'Île-de-France',
  '92': 'Île-de-France',
  '93': 'Île-de-France',
  '94': 'Île-de-France',
  '95': 'Île-de-France',

  // Auvergne-Rhône-Alpes
  '01': 'Auvergne-Rhône-Alpes',
  '03': 'Auvergne-Rhône-Alpes',
  '07': 'Auvergne-Rhône-Alpes',
  '15': 'Auvergne-Rhône-Alpes',
  '26': 'Auvergne-Rhône-Alpes',
  '38': 'Auvergne-Rhône-Alpes',
  '42': 'Auvergne-Rhône-Alpes',
  '43': 'Auvergne-Rhône-Alpes',
  '63': 'Auvergne-Rhône-Alpes',
  '69': 'Auvergne-Rhône-Alpes',
  '73': 'Auvergne-Rhône-Alpes',
  '74': 'Auvergne-Rhône-Alpes',

  // Bourgogne-Franche-Comté
  '21': 'Bourgogne-Franche-Comté',
  '25': 'Bourgogne-Franche-Comté',
  '39': 'Bourgogne-Franche-Comté',
  '58': 'Bourgogne-Franche-Comté',
  '70': 'Bourgogne-Franche-Comté',
  '71': 'Bourgogne-Franche-Comté',
  '89': 'Bourgogne-Franche-Comté',
  '90': 'Bourgogne-Franche-Comté',

  // Bretagne
  '22': 'Bretagne',
  '29': 'Bretagne',
  '35': 'Bretagne',
  '56': 'Bretagne',

  // Centre-Val de Loire
  '18': 'Centre-Val de Loire',
  '28': 'Centre-Val de Loire',
  '36': 'Centre-Val de Loire',
  '37': 'Centre-Val de Loire',
  '41': 'Centre-Val de Loire',
  '45': 'Centre-Val de Loire',

  // Corse
  '2A': 'Corse',
  '2B': 'Corse',
  '20': 'Corse',

  // Grand Est
  '08': 'Grand Est',
  '10': 'Grand Est',
  '51': 'Grand Est',
  '52': 'Grand Est',
  '54': 'Grand Est',
  '55': 'Grand Est',
  '57': 'Grand Est',
  '67': 'Grand Est',
  '68': 'Grand Est',
  '88': 'Grand Est',

  // Hauts-de-France
  '02': 'Hauts-de-France',
  '59': 'Hauts-de-France',
  '60': 'Hauts-de-France',
  '62': 'Hauts-de-France',
  '80': 'Hauts-de-France',

  // Normandie
  '14': 'Normandie',
  '27': 'Normandie',
  '50': 'Normandie',
  '61': 'Normandie',
  '76': 'Normandie',

  // Nouvelle-Aquitaine
  '16': 'Nouvelle-Aquitaine',
  '17': 'Nouvelle-Aquitaine',
  '19': 'Nouvelle-Aquitaine',
  '23': 'Nouvelle-Aquitaine',
  '24': 'Nouvelle-Aquitaine',
  '33': 'Nouvelle-Aquitaine',
  '40': 'Nouvelle-Aquitaine',
  '47': 'Nouvelle-Aquitaine',
  '64': 'Nouvelle-Aquitaine',
  '79': 'Nouvelle-Aquitaine',
  '86': 'Nouvelle-Aquitaine',
  '87': 'Nouvelle-Aquitaine',

  // Occitanie
  '09': 'Occitanie',
  '11': 'Occitanie',
  '12': 'Occitanie',
  '30': 'Occitanie',
  '31': 'Occitanie',
  '32': 'Occitanie',
  '34': 'Occitanie',
  '46': 'Occitanie',
  '48': 'Occitanie',
  '65': 'Occitanie',
  '66': 'Occitanie',
  '81': 'Occitanie',
  '82': 'Occitanie',

  // Pays de la Loire
  '44': 'Pays de la Loire',
  '49': 'Pays de la Loire',
  '53': 'Pays de la Loire',
  '72': 'Pays de la Loire',
  '85': 'Pays de la Loire',

  // Provence-Alpes-Côte d'Azur
  '04': 'Provence-Alpes-Côte d\'Azur',
  '05': 'Provence-Alpes-Côte d\'Azur',
  '06': 'Provence-Alpes-Côte d\'Azur',
  '13': 'Provence-Alpes-Côte d\'Azur',
  '83': 'Provence-Alpes-Côte d\'Azur',
  '84': 'Provence-Alpes-Côte d\'Azur'
};

// Proposed Communes grouped by MDF Regional Zone
export const PROPOSED_COMMUNES_BY_ZONE: Record<string, string[]> = {
  'Île-de-France': [
    'Paris',
    'Saint-Denis',
    'Massy',
    'Épinay-sur-Seine',
    'Montreuil',
    'Boulogne-Billancourt',
    'Nanterre',
    'Créteil',
    'Argenteuil',
    'Versailles',
    'Cergy',
    'Évry-Courcouronnes',
    'Meaux',
    'Saint-Germain-en-Laye',
    'Aubervilliers',
    'Sarcelles',
    'Clamart'
  ],
  'Auvergne-Rhône-Alpes': [
    'Lyon',
    'Villeurbanne',
    'Grenoble',
    'Saint-Étienne',
    'Clermont-Ferrand',
    'Annecy',
    'Chambéry',
    'Valence',
    'Vénissieux',
    'Bourg-en-Bresse',
    'Vaulx-en-Velin'
  ],
  'Bourgogne-Franche-Comté': [
    'Dijon',
    'Besançon',
    'Belfort',
    'Chalon-sur-Saône',
    'Nevers',
    'Auxerre',
    'Mâcon',
    'Sens'
  ],
  'Bretagne': [
    'Rennes',
    'Brest',
    'Quimper',
    'Lorient',
    'Vannes',
    'Saint-Malo',
    'Saint-Brieuc',
    'Lanester',
    'Fougères'
  ],
  'Centre-Val de Loire': [
    'Tours',
    'Orléans',
    'Bourges',
    'Blois',
    'Châteauroux',
    'Chartres',
    'Joué-lès-Tours',
    'Dreux'
  ],
  'Corse': [
    'Ajaccio',
    'Bastia',
    'Porto-Vecchio',
    'Borgo',
    'Corte',
    'Calvi'
  ],
  'Grand Est': [
    'Strasbourg',
    'Reims',
    'Metz',
    'Mulhouse',
    'Nancy',
    'Troyes',
    'Charleville-Mézières',
    'Colmar',
    'Thionville',
    'Épinal',
    'Châlons-en-Champagne',
    'Schiltigheim'
  ],
  'Hauts-de-France': [
    'Lille',
    'Amiens',
    'Roubaix',
    'Tourcoing',
    'Dunkerque',
    'Calais',
    'Villeneuve-d\'Ascq',
    'Beauvais',
    'Valenciennes',
    'Arras',
    'Boulogne-sur-Mer',
    'Compiègne'
  ],
  'Normandie': [
    'Rouen',
    'Le Havre',
    'Caen',
    'Cherbourg-en-Cotentin',
    'Évreux',
    'Dieppe',
    'Alençon',
    'Saint-Lô',
    'Lisieux'
  ],
  'Nouvelle-Aquitaine': [
    'Bordeaux',
    'Limoges',
    'Poitiers',
    'Pau',
    'La Rochelle',
    'Mérignac',
    'Pessac',
    'Bayonne',
    'Angoulême',
    'Agen',
    'Brive-la-Gaillarde',
    'Niort'
  ],
  'Occitanie': [
    'Toulouse',
    'Montpellier',
    'Nîmes',
    'Perpignan',
    'Béziers',
    'Montauban',
    'Narbonne',
    'Tarbes',
    'Albi',
    'Carcassonne',
    'Sète',
    'Castres'
  ],
  'Pays de la Loire': [
    'Nantes',
    'Angers',
    'Le Mans',
    'Saint-Nazaire',
    'Cholet',
    'La Roche-sur-Yon',
    'Laval',
    'Saint-Herblain',
    'Rezé'
  ],
  'Provence-Alpes-Côte d\'Azur': [
    'Marseille',
    'Nice',
    'Toulon',
    'Aix-en-Provence',
    'Avignon',
    'Cannes',
    'Antibes',
    'La Seyne-sur-Mer',
    'Hyères',
    'Arles',
    'Fréjus',
    'Grasse'
  ]
};

// Popular proposed French Cities for initial dropdown list (all regions combined)
export const PROPOSED_COMMUNES = [
  'Paris',
  'Saint-Denis',
  'Massy',
  'Épinay-sur-Seine',
  'Montreuil',
  'Boulogne-Billancourt',
  'Nanterre',
  'Créteil',
  'Argenteuil',
  'Versailles',
  'Rennes',
  'Nantes',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Lille',
  'Strasbourg',
  'Montpellier',
  'Nice',
  'Rouen',
  'Le Havre',
  'Caen',
  'Tours',
  'Orléans',
  'Angers',
  'Le Mans',
  'Brest',
  'Saint-Étienne',
  'Grenoble',
  'Clermont-Ferrand',
  'Dijon',
  'Besançon',
  'Reims',
  'Metz',
  'Nancy',
  'Mulhouse',
  'Toulon',
  'Aix-en-Provence',
  'Avignon',
  'Nîmes',
  'Perpignan',
  'Limoges',
  'Poitiers',
  'Pau',
  'La Rochelle',
  'Amiens',
  'Dunkerque'
];

/**
 * Returns the list of proposed communes for a specific MDF Zone/Region, with fallback
 */
export function getProposedCommunesForZone(zone?: string): string[] {
  if (!zone) return PROPOSED_COMMUNES;
  return PROPOSED_COMMUNES_BY_ZONE[zone] || PROPOSED_COMMUNES;
}

// Offline Commune Knowledge Base (Center Coordinates & Postal/Dept metadata)
export const OFFLINE_COMMUNES_DB: Record<string, FrenchCommuneInfo> = {
  'massy': {
    nom: 'Massy',
    codePostal: '91300',
    departement: 'Essonne (91)',
    departementCode: '91',
    zone: 'Île-de-France',
    latitude: 48.7309,
    longitude: 2.2714
  },
  'épinay-sur-seine': {
    nom: 'Épinay-sur-Seine',
    codePostal: '93800',
    departement: 'Seine-Saint-Denis (93)',
    departementCode: '93',
    zone: 'Île-de-France',
    latitude: 48.9554,
    longitude: 2.3094
  },
  'epinay-sur-seine': {
    nom: 'Épinay-sur-Seine',
    codePostal: '93800',
    departement: 'Seine-Saint-Denis (93)',
    departementCode: '93',
    zone: 'Île-de-France',
    latitude: 48.9554,
    longitude: 2.3094
  },
  'epinay sur seine': {
    nom: 'Épinay-sur-Seine',
    codePostal: '93800',
    departement: 'Seine-Saint-Denis (93)',
    departementCode: '93',
    zone: 'Île-de-France',
    latitude: 48.9554,
    longitude: 2.3094
  },
  'saint-denis': {
    nom: 'Saint-Denis',
    codePostal: '93200',
    departement: 'Seine-Saint-Denis (93)',
    departementCode: '93',
    zone: 'Île-de-France',
    latitude: 48.9358,
    longitude: 2.3580
  },
  'paris': {
    nom: 'Paris',
    codePostal: '75000',
    departement: 'Paris (75)',
    departementCode: '75',
    zone: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522
  },
  'montreuil': {
    nom: 'Montreuil',
    codePostal: '93100',
    departement: 'Seine-Saint-Denis (93)',
    departementCode: '93',
    zone: 'Île-de-France',
    latitude: 48.8638,
    longitude: 2.4485
  },
  'boulogne-billancourt': {
    nom: 'Boulogne-Billancourt',
    codePostal: '92100',
    departement: 'Hauts-de-Seine (92)',
    departementCode: '92',
    zone: 'Île-de-France',
    latitude: 48.8397,
    longitude: 2.2399
  },
  'nanterre': {
    nom: 'Nanterre',
    codePostal: '92000',
    departement: 'Hauts-de-Seine (92)',
    departementCode: '92',
    zone: 'Île-de-France',
    latitude: 48.8924,
    longitude: 2.2071
  },
  'créteil': {
    nom: 'Créteil',
    codePostal: '94000',
    departement: 'Val-de-Marne (94)',
    departementCode: '94',
    zone: 'Île-de-France',
    latitude: 48.7904,
    longitude: 2.4556
  },
  'argenteuil': {
    nom: 'Argenteuil',
    codePostal: '95100',
    departement: 'Val-d\'Oise (95)',
    departementCode: '95',
    zone: 'Île-de-France',
    latitude: 48.9479,
    longitude: 2.2467
  },
  'versailles': {
    nom: 'Versailles',
    codePostal: '78000',
    departement: 'Yvelines (78)',
    departementCode: '78',
    zone: 'Île-de-France',
    latitude: 48.8014,
    longitude: 2.1301
  },
  'rennes': {
    nom: 'Rennes',
    codePostal: '35000',
    departement: 'Ille-et-Vilaine (35)',
    departementCode: '35',
    zone: 'Bretagne',
    latitude: 48.1173,
    longitude: -1.6778
  },
  'brest': {
    nom: 'Brest',
    codePostal: '29200',
    departement: 'Finistère (29)',
    departementCode: '29',
    zone: 'Bretagne',
    latitude: 48.3904,
    longitude: -4.4861
  },
  'nantes': {
    nom: 'Nantes',
    codePostal: '44000',
    departement: 'Loire-Atlantique (44)',
    departementCode: '44',
    zone: 'Pays de la Loire',
    latitude: 47.2184,
    longitude: -1.5536
  },
  'angers': {
    nom: 'Angers',
    codePostal: '49000',
    departement: 'Maine-et-Loire (49)',
    departementCode: '49',
    zone: 'Pays de la Loire',
    latitude: 47.4784,
    longitude: -0.5632
  },
  'le mans': {
    nom: 'Le Mans',
    codePostal: '72000',
    departement: 'Sarthe (72)',
    departementCode: '72',
    zone: 'Pays de la Loire',
    latitude: 48.0061,
    longitude: 0.1996
  },
  'lyon': {
    nom: 'Lyon',
    codePostal: '69000',
    departement: 'Rhône (69)',
    departementCode: '69',
    zone: 'Auvergne-Rhône-Alpes',
    latitude: 45.7640,
    longitude: 4.8357
  },
  'grenoble': {
    nom: 'Grenoble',
    codePostal: '38000',
    departement: 'Isère (38)',
    departementCode: '38',
    zone: 'Auvergne-Rhône-Alpes',
    latitude: 45.1885,
    longitude: 5.7245
  },
  'saint-étienne': {
    nom: 'Saint-Étienne',
    codePostal: '42000',
    departement: 'Loire (42)',
    departementCode: '42',
    zone: 'Auvergne-Rhône-Alpes',
    latitude: 45.4397,
    longitude: 4.3872
  },
  'clermont-ferrand': {
    nom: 'Clermont-Ferrand',
    codePostal: '63000',
    departement: 'Puy-de-Dôme (63)',
    departementCode: '63',
    zone: 'Auvergne-Rhône-Alpes',
    latitude: 45.7772,
    longitude: 3.0870
  },
  'marseille': {
    nom: 'Marseille',
    codePostal: '13000',
    departement: 'Bouches-du-Rhône (13)',
    departementCode: '13',
    zone: 'Provence-Alpes-Côte d\'Azur',
    latitude: 43.2965,
    longitude: 5.3698
  },
  'nice': {
    nom: 'Nice',
    codePostal: '06000',
    departement: 'Alpes-Maritimes (06)',
    departementCode: '06',
    zone: 'Provence-Alpes-Côte d\'Azur',
    latitude: 43.7102,
    longitude: 7.2620
  },
  'toulon': {
    nom: 'Toulon',
    codePostal: '83000',
    departement: 'Var (83)',
    departementCode: '83',
    zone: 'Provence-Alpes-Côte d\'Azur',
    latitude: 43.1242,
    longitude: 5.9280
  },
  'aix-en-provence': {
    nom: 'Aix-en-Provence',
    codePostal: '13100',
    departement: 'Bouches-du-Rhône (13)',
    departementCode: '13',
    zone: 'Provence-Alpes-Côte d\'Azur',
    latitude: 43.5297,
    longitude: 5.4474
  },
  'toulouse': {
    nom: 'Toulouse',
    codePostal: '31000',
    departement: 'Haute-Garonne (31)',
    departementCode: '31',
    zone: 'Occitanie',
    latitude: 43.6047,
    longitude: 1.4442
  },
  'montpellier': {
    nom: 'Montpellier',
    codePostal: '34000',
    departement: 'Hérault (34)',
    departementCode: '34',
    zone: 'Occitanie',
    latitude: 43.6108,
    longitude: 3.8767
  },
  'nîmes': {
    nom: 'Nîmes',
    codePostal: '30000',
    departement: 'Gard (30)',
    departementCode: '30',
    zone: 'Occitanie',
    latitude: 43.8367,
    longitude: 4.3601
  },
  'bordeaux': {
    nom: 'Bordeaux',
    codePostal: '33000',
    departement: 'Gironde (33)',
    departementCode: '33',
    zone: 'Nouvelle-Aquitaine',
    latitude: 44.8378,
    longitude: -0.5792
  },
  'limoges': {
    nom: 'Limoges',
    codePostal: '87000',
    departement: 'Haute-Vienne (87)',
    departementCode: '87',
    zone: 'Nouvelle-Aquitaine',
    latitude: 45.8336,
    longitude: 1.2611
  },
  'poitiers': {
    nom: 'Poitiers',
    codePostal: '86000',
    departement: 'Vienne (86)',
    departementCode: '86',
    zone: 'Nouvelle-Aquitaine',
    latitude: 46.5802,
    longitude: 0.3404
  },
  'lille': {
    nom: 'Lille',
    codePostal: '59000',
    departement: 'Nord (59)',
    departementCode: '59',
    zone: 'Hauts-de-France',
    latitude: 50.6292,
    longitude: 3.0573
  },
  'amiens': {
    nom: 'Amiens',
    codePostal: '80000',
    departement: 'Somme (80)',
    departementCode: '80',
    zone: 'Hauts-de-France',
    latitude: 49.8941,
    longitude: 2.2957
  },
  'strasbourg': {
    nom: 'Strasbourg',
    codePostal: '67000',
    departement: 'Bas-Rhin (67)',
    departementCode: '67',
    zone: 'Grand Est',
    latitude: 48.5734,
    longitude: 7.7521
  },
  'reims': {
    nom: 'Reims',
    codePostal: '51100',
    departement: 'Marne (51)',
    departementCode: '51',
    zone: 'Grand Est',
    latitude: 49.2583,
    longitude: 4.0317
  },
  'metz': {
    nom: 'Metz',
    codePostal: '57000',
    departement: 'Moselle (57)',
    departementCode: '57',
    zone: 'Grand Est',
    latitude: 49.1193,
    longitude: 6.1757
  },
  'nancy': {
    nom: 'Nancy',
    codePostal: '54000',
    departement: 'Meurthe-et-Moselle (54)',
    departementCode: '54',
    zone: 'Grand Est',
    latitude: 48.6921,
    longitude: 6.1844
  },
  'rouen': {
    nom: 'Rouen',
    codePostal: '76000',
    departement: 'Seine-Maritime (76)',
    departementCode: '76',
    zone: 'Normandie',
    latitude: 49.4431,
    longitude: 1.0993
  },
  'caen': {
    nom: 'Caen',
    codePostal: '14000',
    departement: 'Calvados (14)',
    departementCode: '14',
    zone: 'Normandie',
    latitude: 49.1829,
    longitude: -0.3707
  },
  'le havre': {
    nom: 'Le Havre',
    codePostal: '76600',
    departement: 'Seine-Maritime (76)',
    departementCode: '76',
    zone: 'Normandie',
    latitude: 49.4944,
    longitude: 0.1079
  },
  'dijon': {
    nom: 'Dijon',
    codePostal: '21000',
    departement: 'Côte-d\'Or (21)',
    departementCode: '21',
    zone: 'Bourgogne-Franche-Comté',
    latitude: 47.3220,
    longitude: 5.0415
  },
  'besançon': {
    nom: 'Besançon',
    codePostal: '25000',
    departement: 'Doubs (25)',
    departementCode: '25',
    zone: 'Bourgogne-Franche-Comté',
    latitude: 47.2378,
    longitude: 6.0241
  },
  'tours': {
    nom: 'Tours',
    codePostal: '37000',
    departement: 'Indre-et-Loire (37)',
    departementCode: '37',
    zone: 'Centre-Val de Loire',
    latitude: 47.3941,
    longitude: 0.6848
  },
  'orléans': {
    nom: 'Orléans',
    codePostal: '45000',
    departement: 'Loiret (45)',
    departementCode: '45',
    zone: 'Centre-Val de Loire',
    latitude: 47.9029,
    longitude: 1.9090
  }
};

/**
 * Normalizes city name (removes postal digits, standardizes capitalisation and dashes)
 */
export function normalizeCommuneName(rawInput: string): string {
  if (!rawInput) return '';
  let cleaned = rawInput.trim();

  // Strip trailing or leading department numbers (e.g. "Massy 91" -> "Massy", "Massy (91300)" -> "Massy")
  cleaned = cleaned.replace(/\s*\(\s*\d{2,5}\s*\)\s*$/g, '');
  cleaned = cleaned.replace(/\s+\d{2,5}$/g, '');
  cleaned = cleaned.replace(/^\d{2,5}\s+/g, '');

  const key = cleaned.toLowerCase();

  // Check direct offline match
  if (OFFLINE_COMMUNES_DB[key]) {
    return OFFLINE_COMMUNES_DB[key].nom;
  }

  // Capitalize words separated by space or hyphens
  return cleaned
    .toLowerCase()
    .split(/([ -])/)
    .map((part) => {
      if (part === '-' || part === ' ') return part;
      if (['sur', 'de', 'du', 'des', 'les', 'sous', 'en', 'aux', 'le', 'la', 'l\'', 'd\''].includes(part)) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

/**
 * Check if the given status corresponds to job seeking ("Recherche d'emploi")
 */
export function isJobSeekingStatus(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return (
    s.includes('recherche') ||
    s.includes('demandeur') ||
    s.includes('sans emploi') ||
    s.includes('chômage') ||
    s.includes('chomage')
  );
}

/**
 * Looks up French Commune info via Official Geo API (geo.api.gouv.fr) with fallback to Offline Database
 */
export async function lookupFrenchCommune(
  query: string,
  preferredDept?: string
): Promise<FrenchCommuneInfo | null> {
  if (!query || !query.trim()) return null;

  const cleanedQuery = query.trim().replace(/\s*\(\s*\d{2,5}\s*\)\s*$/g, '').trim();
  const lowerKey = cleanedQuery.toLowerCase();

  // Check fast offline lookup first
  if (OFFLINE_COMMUNES_DB[lowerKey]) {
    return OFFLINE_COMMUNES_DB[lowerKey];
  }

  // Try official geo.api.gouv.fr API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);

    const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cleanedQuery)}&fields=nom,code,codesPostaux,centre,codeDepartement,codeRegion&format=json&geometry=centre&limit=3`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const deptCode = String(item.codeDepartement || '');
        const deptLabel = DEPARTEMENTS_MAP[deptCode] || `Département (${deptCode})`;
        const zone = DEPARTEMENT_TO_ZONE[deptCode] || 'Île-de-France';
        const coords = item.centre?.coordinates || [2.3522, 48.8566];

        return {
          nom: item.nom,
          codePostal: Array.isArray(item.codesPostaux) && item.codesPostaux.length > 0 ? item.codesPostaux[0] : undefined,
          departement: deptLabel,
          departementCode: deptCode,
          zone: zone,
          latitude: Number(coords[1].toFixed(4)),
          longitude: Number(coords[0].toFixed(4))
        };
      }
    }
  } catch {
    // Offline or timeout, proceed to fallback
  }

  // Search partial in offline database
  const matchEntry = Object.entries(OFFLINE_COMMUNES_DB).find(([k]) =>
    k.includes(lowerKey) || lowerKey.includes(k)
  );

  if (matchEntry) {
    return matchEntry[1];
  }

  // Department-based guess if department was supplied
  if (preferredDept) {
    const deptMatch = Object.entries(DEPARTEMENTS_MAP).find(
      ([code, label]) =>
        preferredDept.includes(code) || label.toLowerCase().includes(preferredDept.toLowerCase())
    );
    if (deptMatch) {
      const deptCode = deptMatch[0];
      return {
        nom: normalizeCommuneName(cleanedQuery),
        departement: deptMatch[1],
        departementCode: deptCode,
        zone: DEPARTEMENT_TO_ZONE[deptCode] || 'Île-de-France',
        latitude: 48.8566,
        longitude: 2.3522
      };
    }
  }

  return {
    nom: normalizeCommuneName(cleanedQuery),
    departement: 'Île-de-France (75)',
    departementCode: '75',
    zone: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522
  };
}
