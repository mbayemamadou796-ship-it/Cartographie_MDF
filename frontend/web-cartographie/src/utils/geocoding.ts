// Geocoding helper with Nominatim + Offline Fallback Dictionary for France & Regions

const ZONE_COORDINATES: Record<string, { lat: number; lng: number; dept: string; region: string }> = {
  'bretagne': { lat: 48.1173, lng: -1.6778, dept: 'Ille-et-Vilaine (35)', region: 'Bretagne' },
  'île-de-france': { lat: 48.8566, lng: 2.3522, dept: 'Paris (75)', region: 'Île-de-France' },
  'ile-de-france': { lat: 48.8566, lng: 2.3522, dept: 'Paris (75)', region: 'Île-de-France' },
  'pays de la loire': { lat: 47.2184, lng: -1.5536, dept: 'Loire-Atlantique (44)', region: 'Pays de la Loire' },
  'normandie': { lat: 49.4431, lng: 1.0993, dept: 'Seine-Maritime (76)', region: 'Normandie' },
  'auvergne-rhône-alpes': { lat: 45.7640, lng: 4.8357, dept: 'Rhône (69)', region: 'Auvergne-Rhône-Alpes' },
  'auvergne-rhone-alpes': { lat: 45.7640, lng: 4.8357, dept: 'Rhône (69)', region: 'Auvergne-Rhône-Alpes' },
  'nouvelle-aquitaine': { lat: 44.8378, lng: -0.5792, dept: 'Gironde (33)', region: 'Nouvelle-Aquitaine' },
  'occitanie': { lat: 43.6047, lng: 1.4442, dept: 'Haute-Garonne (31)', region: 'Occitanie' },
  'provence-alpes-côte d\'azur': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'provence-alpes-cote d\'azur': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'paca': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'hauts-de-france': { lat: 50.6292, lng: 3.0573, dept: 'Nord (59)', region: 'Hauts-de-France' },
  'grand est': { lat: 48.5734, lng: 7.7521, dept: 'Bas-Rhin (67)', region: 'Grand Est' },
  'bourgogne-franche-comté': { lat: 47.3220, lng: 5.0415, dept: 'Côte-d\'Or (21)', region: 'Bourgogne-Franche-Comté' },
  'bourgogne-franche-comte': { lat: 47.3220, lng: 5.0415, dept: 'Côte-d\'Or (21)', region: 'Bourgogne-Franche-Comté' },
  'centre-val de loire': { lat: 47.9029, lng: 1.9090, dept: 'Loiret (45)', region: 'Centre-Val de Loire' },
  'corse': { lat: 41.9267, lng: 8.7369, dept: 'Corse-du-Sud (2A)', region: 'Corse' },
  'outre-mer': { lat: 14.6161, lng: -61.0588, dept: 'Guadeloupe (971)', region: 'Outre-Mer (DROM-COM)' },
  'outre-mer (drom-com)': { lat: 14.6161, lng: -61.0588, dept: 'Guadeloupe (971)', region: 'Outre-Mer (DROM-COM)' },
  'grand ouest': { lat: 47.2184, lng: -1.5536, dept: 'Loire-Atlantique (44)', region: 'Pays de la Loire' },
  'réseau sud': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'reseau sud': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' }
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number; dept: string; region: string }> = {
  // Île-de-France
  'saint-denis': { lat: 48.9358, lng: 2.3580, dept: 'Seine-Saint-Denis (93)', region: 'Île-de-France' },
  'paris': { lat: 48.8566, lng: 2.3522, dept: 'Paris (75)', region: 'Île-de-France' },
  'boulogne-billancourt': { lat: 48.8397, lng: 2.2399, dept: 'Hauts-de-Seine (92)', region: 'Île-de-France' },
  'versailles': { lat: 48.8014, lng: 2.1301, dept: 'Yvelines (78)', region: 'Île-de-France' },
  'montreuil': { lat: 48.8638, lng: 2.4485, dept: 'Seine-Saint-Denis (93)', region: 'Île-de-France' },
  'argenteuil': { lat: 48.9479, lng: 2.2467, dept: 'Val-d\'Oise (95)', region: 'Île-de-France' },
  'nanterre': { lat: 48.8924, lng: 2.2071, dept: 'Hauts-de-Seine (92)', region: 'Île-de-France' },
  'créteil': { lat: 48.7904, lng: 2.4556, dept: 'Val-de-Marne (94)', region: 'Île-de-France' },

  // Bretagne
  'rennes': { lat: 48.1173, lng: -1.6778, dept: 'Ille-et-Vilaine (35)', region: 'Bretagne' },
  'brest': { lat: 48.3904, lng: -4.4861, dept: 'Finistère (29)', region: 'Bretagne' },
  'quimper': { lat: 47.9960, lng: -4.1025, dept: 'Finistère (29)', region: 'Bretagne' },
  'lorient': { lat: 47.7483, lng: -3.3702, dept: 'Morbihan (56)', region: 'Bretagne' },
  'vannes': { lat: 47.6582, lng: -2.7600, dept: 'Morbihan (56)', region: 'Bretagne' },
  'saint-malo': { lat: 48.6493, lng: -2.0257, dept: 'Ille-et-Vilaine (35)', region: 'Bretagne' },
  'saint-brieuc': { lat: 48.5142, lng: -2.7658, dept: 'Côtes-d\'Armor (22)', region: 'Bretagne' },

  // Pays de la Loire
  'nantes': { lat: 47.2184, lng: -1.5536, dept: 'Loire-Atlantique (44)', region: 'Pays de la Loire' },
  'angers': { lat: 47.4784, lng: -0.5632, dept: 'Maine-et-Loire (49)', region: 'Pays de la Loire' },
  'le mans': { lat: 48.0061, lng: 0.1996, dept: 'Sarthe (72)', region: 'Pays de la Loire' },
  'saint-nazaire': { lat: 47.2735, lng: -2.2137, dept: 'Loire-Atlantique (44)', region: 'Pays de la Loire' },
  'la roche-sur-yon': { lat: 46.6705, lng: -1.4268, dept: 'Vendée (85)', region: 'Pays de la Loire' },

  // Normandie
  'rouen': { lat: 49.4431, lng: 1.0993, dept: 'Seine-Maritime (76)', region: 'Normandie' },
  'caen': { lat: 49.1829, lng: -0.3707, dept: 'Calvados (14)', region: 'Normandie' },
  'le havre': { lat: 49.4944, lng: 0.1079, dept: 'Seine-Maritime (76)', region: 'Normandie' },
  'cherbourg': { lat: 49.6337, lng: -1.6221, dept: 'Manche (50)', region: 'Normandie' },
  'évreux': { lat: 49.0241, lng: 1.1508, dept: 'Eure (27)', region: 'Normandie' },
  'evreux': { lat: 49.0241, lng: 1.1508, dept: 'Eure (27)', region: 'Normandie' },

  // Auvergne-Rhône-Alpes
  'lyon': { lat: 45.7640, lng: 4.8357, dept: 'Rhône (69)', region: 'Auvergne-Rhône-Alpes' },
  'grenoble': { lat: 45.1885, lng: 5.7245, dept: 'Isère (38)', region: 'Auvergne-Rhône-Alpes' },
  'saint-étienne': { lat: 45.4397, lng: 4.3872, dept: 'Loire (42)', region: 'Auvergne-Rhône-Alpes' },
  'saint-etienne': { lat: 45.4397, lng: 4.3872, dept: 'Loire (42)', region: 'Auvergne-Rhône-Alpes' },
  'clermont-ferrand': { lat: 45.7772, lng: 3.0870, dept: 'Puy-de-Dôme (63)', region: 'Auvergne-Rhône-Alpes' },
  'annecy': { lat: 45.8992, lng: 6.1294, dept: 'Haute-Savoie (74)', region: 'Auvergne-Rhône-Alpes' },
  'chambéry': { lat: 45.5646, lng: 5.9178, dept: 'Savoie (73)', region: 'Auvergne-Rhône-Alpes' },
  'chambery': { lat: 45.5646, lng: 5.9178, dept: 'Savoie (73)', region: 'Auvergne-Rhône-Alpes' },
  'villeurbanne': { lat: 45.7667, lng: 4.8833, dept: 'Rhône (69)', region: 'Auvergne-Rhône-Alpes' },

  // Nouvelle-Aquitaine
  'bordeaux': { lat: 44.8378, lng: -0.5792, dept: 'Gironde (33)', region: 'Nouvelle-Aquitaine' },
  'limoges': { lat: 45.8336, lng: 1.2611, dept: 'Haute-Vienne (87)', region: 'Nouvelle-Aquitaine' },
  'poitiers': { lat: 46.5802, lng: 0.3404, dept: 'Vienne (86)', region: 'Nouvelle-Aquitaine' },
  'pau': { lat: 43.2951, lng: -0.3708, dept: 'Pyrénées-Atlantiques (64)', region: 'Nouvelle-Aquitaine' },
  'la rochelle': { lat: 46.1603, lng: -1.1511, dept: 'Charente-Maritime (17)', region: 'Nouvelle-Aquitaine' },

  // Occitanie
  'toulouse': { lat: 43.6047, lng: 1.4442, dept: 'Haute-Garonne (31)', region: 'Occitanie' },
  'montpellier': { lat: 43.6108, lng: 3.8767, dept: 'Hérault (34)', region: 'Occitanie' },
  'nîmes': { lat: 43.8367, lng: 4.3601, dept: 'Gard (30)', region: 'Occitanie' },
  'nimes': { lat: 43.8367, lng: 4.3601, dept: 'Gard (30)', region: 'Occitanie' },
  'perpignan': { lat: 42.6986, lng: 2.8956, dept: 'Pyrénées-Orientales (66)', region: 'Occitanie' },
  'béziers': { lat: 43.3442, lng: 3.2158, dept: 'Hérault (34)', region: 'Occitanie' },

  // Provence-Alpes-Côte d'Azur
  'marseille': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'nice': { lat: 43.7102, lng: 7.2620, dept: 'Alpes-Maritimes (06)', region: 'Provence-Alpes-Côte d\'Azur' },
  'toulon': { lat: 43.1242, lng: 5.9280, dept: 'Var (83)', region: 'Provence-Alpes-Côte d\'Azur' },
  'aix-en-provence': { lat: 43.5297, lng: 5.4474, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'avignon': { lat: 43.9493, lng: 4.8055, dept: 'Vaucluse (84)', region: 'Provence-Alpes-Côte d\'Azur' },
  'cannes': { lat: 43.5528, lng: 7.0174, dept: 'Alpes-Maritimes (06)', region: 'Provence-Alpes-Côte d\'Azur' },

  // Hauts-de-France
  'lille': { lat: 50.6292, lng: 3.0573, dept: 'Nord (59)', region: 'Hauts-de-France' },
  'amiens': { lat: 49.8941, lng: 2.2957, dept: 'Somme (80)', region: 'Hauts-de-France' },
  'roubaix': { lat: 50.6927, lng: 3.1778, dept: 'Nord (59)', region: 'Hauts-de-France' },
  'tourcoing': { lat: 50.7239, lng: 3.1612, dept: 'Nord (59)', region: 'Hauts-de-France' },
  'dunkerque': { lat: 51.0343, lng: 2.3768, dept: 'Nord (59)', region: 'Hauts-de-France' },
  'calais': { lat: 50.9513, lng: 1.8587, dept: 'Pas-de-Calais (62)', region: 'Hauts-de-France' },

  // Grand Est
  'strasbourg': { lat: 48.5734, lng: 7.7521, dept: 'Bas-Rhin (67)', region: 'Grand Est' },
  'reims': { lat: 49.2583, lng: 4.0317, dept: 'Marne (51)', region: 'Grand Est' },
  'metz': { lat: 49.1193, lng: 6.1757, dept: 'Moselle (57)', region: 'Grand Est' },
  'nancy': { lat: 48.6921, lng: 6.1844, dept: 'Meurthe-et-Moselle (54)', region: 'Grand Est' },
  'mulhouse': { lat: 47.7508, lng: 7.3359, dept: 'Haut-Rhin (68)', region: 'Grand Est' },
  'troyes': { lat: 48.2973, lng: 4.0744, dept: 'Aube (10)', region: 'Grand Est' },

  // Bourgogne-Franche-Comté
  'dijon': { lat: 47.3220, lng: 5.0415, dept: 'Côte-d\'Or (21)', region: 'Bourgogne-Franche-Comté' },
  'besançon': { lat: 47.2378, lng: 6.0241, dept: 'Doubs (25)', region: 'Bourgogne-Franche-Comté' },
  'besancon': { lat: 47.2378, lng: 6.0241, dept: 'Doubs (25)', region: 'Bourgogne-Franche-Comté' },
  'belfort': { lat: 47.6397, lng: 6.8638, dept: 'Territoire de Belfort (90)', region: 'Bourgogne-Franche-Comté' },

  // Centre-Val de Loire
  'orléans': { lat: 47.9029, lng: 1.9090, dept: 'Loiret (45)', region: 'Centre-Val de Loire' },
  'orleans': { lat: 47.9029, lng: 1.9090, dept: 'Loiret (45)', region: 'Centre-Val de Loire' },
  'tours': { lat: 47.3941, lng: 0.6848, dept: 'Indre-et-Loire (37)', region: 'Centre-Val de Loire' },
  'bourges': { lat: 47.0810, lng: 2.3988, dept: 'Cher (18)', region: 'Centre-Val de Loire' },

  // Corse
  'ajaccio': { lat: 41.9267, lng: 8.7369, dept: 'Corse-du-Sud (2A)', region: 'Corse' },
  'bastia': { lat: 42.7028, lng: 9.4500, dept: 'Haute-Corse (2B)', region: 'Corse' },

  // Outre-Mer
  'pointe-à-pitre': { lat: 16.2411, lng: -61.5331, dept: 'Guadeloupe (971)', region: 'Outre-Mer (DROM-COM)' },
  'fort-de-france': { lat: 14.6161, lng: -61.0588, dept: 'Martinique (972)', region: 'Outre-Mer (DROM-COM)' },
  'cayenne': { lat: 4.9372, lng: -52.3260, dept: 'Guyane (973)', region: 'Outre-Mer (DROM-COM)' },
  'saint-denis (réunion)': { lat: -20.8821, lng: 55.4504, dept: 'La Réunion (974)', region: 'Outre-Mer (DROM-COM)' },
  'mamoudzou': { lat: -12.7806, lng: 45.2278, dept: 'Mayotte (976)', region: 'Outre-Mer (DROM-COM)' }
};

export async function geocodeLocation(
  ville: string,
  departement: string = '',
  pays: string = 'France',
  zoneOrRegion?: string
): Promise<{ latitude: number; longitude: number; dept?: string; region?: string }> {
  const query = [ville, departement, zoneOrRegion, pays].filter(Boolean).join(', ');

  // Try Nominatim API first with quick timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept-Language': 'fr',
          'User-Agent': 'CartographieMDFApp/1.0'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          // Slight jitter (approx 50m) to keep points distinct on map
          const jitterLat = (Math.random() - 0.5) * 0.002;
          const jitterLng = (Math.random() - 0.5) * 0.002;
          return {
            latitude: Number((lat + jitterLat).toFixed(4)),
            longitude: Number((lon + jitterLng).toFixed(4))
          };
        }
      }
    }
  } catch {
    // Ignore online geocoding error, proceed to internal offline dictionary & region fallback
  }

  // Fallback 1: check city in dictionary
  const normalizedVille = (ville || '').trim().toLowerCase();
  if (CITY_COORDINATES[normalizedVille]) {
    const info = CITY_COORDINATES[normalizedVille];
    const jitterLat = (Math.random() - 0.5) * 0.008;
    const jitterLng = (Math.random() - 0.5) * 0.008;
    return {
      latitude: Number((info.lat + jitterLat).toFixed(4)),
      longitude: Number((info.lng + jitterLng).toFixed(4)),
      dept: info.dept,
      region: info.region
    };
  }

  // Fallback 2: check Zone or Region in dictionary
  const normalizedZone = (zoneOrRegion || '').trim().toLowerCase();
  if (ZONE_COORDINATES[normalizedZone]) {
    const info = ZONE_COORDINATES[normalizedZone];
    const jitterLat = (Math.random() - 0.5) * 0.015;
    const jitterLng = (Math.random() - 0.5) * 0.015;
    return {
      latitude: Number((info.lat + jitterLat).toFixed(4)),
      longitude: Number((info.lng + jitterLng).toFixed(4)),
      dept: info.dept,
      region: info.region
    };
  }

  // Fallback 3: France center with scatter
  const baseLat = 46.603354;
  const baseLng = 1.888334;
  return {
    latitude: Number((baseLat + (Math.random() - 0.5) * 2.5).toFixed(4)),
    longitude: Number((baseLng + (Math.random() - 0.5) * 2.5).toFixed(4))
  };
}

export function getOfflineCoordinates(ville: string, zoneOrRegion?: string): { latitude: number; longitude: number; dept?: string; region?: string } {
  const normalizedVille = (ville || '').trim().toLowerCase();
  if (CITY_COORDINATES[normalizedVille]) {
    const info = CITY_COORDINATES[normalizedVille];
    const jitterLat = (Math.random() - 0.5) * 0.008;
    const jitterLng = (Math.random() - 0.5) * 0.008;
    return {
      latitude: Number((info.lat + jitterLat).toFixed(4)),
      longitude: Number((info.lng + jitterLng).toFixed(4)),
      dept: info.dept,
      region: info.region
    };
  }

  const normalizedZone = (zoneOrRegion || '').trim().toLowerCase();
  if (ZONE_COORDINATES[normalizedZone]) {
    const info = ZONE_COORDINATES[normalizedZone];
    const jitterLat = (Math.random() - 0.5) * 0.015;
    const jitterLng = (Math.random() - 0.5) * 0.015;
    return {
      latitude: Number((info.lat + jitterLat).toFixed(4)),
      longitude: Number((info.lng + jitterLng).toFixed(4)),
      dept: info.dept,
      region: info.region
    };
  }

  return {
    latitude: Number((46.6033 + (Math.random() - 0.5) * 2).toFixed(4)),
    longitude: Number((1.8883 + (Math.random() - 0.5) * 2).toFixed(4))
  };
}

