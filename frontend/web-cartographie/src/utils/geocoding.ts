// Geocoding helper with Nominatim + Offline Fallback Dictionary for France

const CITY_COORDINATES: Record<string, { lat: number; lng: number; dept: string; region: string }> = {
  'saint-denis': { lat: 48.9358, lng: 2.3580, dept: 'Seine-Saint-Denis (93)', region: 'Île-de-France' },
  'paris': { lat: 48.8566, lng: 2.3522, dept: 'Paris (75)', region: 'Île-de-France' },
  'marseille': { lat: 43.2965, lng: 5.3698, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'lyon': { lat: 45.7640, lng: 4.8357, dept: 'Rhône (69)', region: 'Auvergne-Rhône-Alpes' },
  'toulouse': { lat: 43.6047, lng: 1.4442, dept: 'Haute-Garonne (31)', region: 'Occitanie' },
  'nice': { lat: 43.7102, lng: 7.2620, dept: 'Alpes-Maritimes (06)', region: 'Provence-Alpes-Côte d\'Azur' },
  'nantes': { lat: 47.2184, lng: -1.5536, dept: 'Loire-Atlantique (44)', region: 'Pays de la Loire' },
  'montpellier': { lat: 43.6108, lng: 3.8767, dept: 'Hérault (34)', region: 'Occitanie' },
  'strasbourg': { lat: 48.5734, lng: 7.7521, dept: 'Bas-Rhin (67)', region: 'Grand Est' },
  'bordeaux': { lat: 44.8378, lng: -0.5792, dept: 'Gironde (33)', region: 'Nouvelle-Aquitaine' },
  'lille': { lat: 50.6292, lng: 3.0573, dept: 'Nord (59)', region: 'Hauts-de-France' },
  'rennes': { lat: 48.1173, lng: -1.6778, dept: 'Ille-et-Vilaine (35)', region: 'Bretagne' },
  'reims': { lat: 49.2583, lng: 4.0317, dept: 'Marne (51)', region: 'Grand Est' },
  'toulon': { lat: 43.1242, lng: 5.9280, dept: 'Var (83)', region: 'Provence-Alpes-Côte d\'Azur' },
  'saint-étienne': { lat: 45.4397, lng: 4.3872, dept: 'Loire (42)', region: 'Auvergne-Rhône-Alpes' },
  'saint-etienne': { lat: 45.4397, lng: 4.3872, dept: 'Loire (42)', region: 'Auvergne-Rhône-Alpes' },
  'le havre': { lat: 49.4944, lng: 0.1079, dept: 'Seine-Maritime (76)', region: 'Normandie' },
  'grenoble': { lat: 45.1885, lng: 5.7245, dept: 'Isère (38)', region: 'Auvergne-Rhône-Alpes' },
  'dijon': { lat: 47.3220, lng: 5.0415, dept: 'Côte-d\'Or (21)', region: 'Bourgogne-Franche-Comté' },
  'angers': { lat: 47.4784, lng: -0.5632, dept: 'Maine-et-Loire (49)', region: 'Pays de la Loire' },
  'nîmes': { lat: 43.8367, lng: 4.3601, dept: 'Gard (30)', region: 'Occitanie' },
  'nimes': { lat: 43.8367, lng: 4.3601, dept: 'Gard (30)', region: 'Occitanie' },
  'villeurbanne': { lat: 45.7667, lng: 4.8833, dept: 'Rhône (69)', region: 'Auvergne-Rhône-Alpes' },
  'clermont-ferrand': { lat: 45.7772, lng: 3.0870, dept: 'Puy-de-Dôme (63)', region: 'Auvergne-Rhône-Alpes' },
  'aix-en-provence': { lat: 43.5297, lng: 5.4474, dept: 'Bouches-du-Rhône (13)', region: 'Provence-Alpes-Côte d\'Azur' },
  'brest': { lat: 48.3904, lng: -4.4861, dept: 'Finistère (29)', region: 'Bretagne' },
  'tours': { lat: 47.3941, lng: 0.6848, dept: 'Indre-et-Loire (37)', region: 'Centre-Val de Loire' },
  'amiens': { lat: 49.8941, lng: 2.2957, dept: 'Somme (80)', region: 'Hauts-de-France' },
  'limoges': { lat: 45.8336, lng: 1.2611, dept: 'Haute-Vienne (87)', region: 'Nouvelle-Aquitaine' },
  'annecy': { lat: 45.8992, lng: 6.1294, dept: 'Haute-Savoie (74)', region: 'Auvergne-Rhône-Alpes' },
  'perpignan': { lat: 42.6986, lng: 2.8956, dept: 'Pyrénées-Orientales (66)', region: 'Occitanie' },
  'metz': { lat: 49.1193, lng: 6.1757, dept: 'Moselle (57)', region: 'Grand Est' },
  'besançon': { lat: 47.2378, lng: 6.0241, dept: 'Doubs (25)', region: 'Bourgogne-Franche-Comté' },
  'orléans': { lat: 47.9029, lng: 1.9090, dept: 'Loiret (45)', region: 'Centre-Val de Loire' },
  'rouen': { lat: 49.4431, lng: 1.0993, dept: 'Seine-Maritime (76)', region: 'Normandie' }
};

export async function geocodeLocation(
  adresse: string,
  codePostal: string,
  ville: string,
  pays: string = 'France'
): Promise<{ latitude: number; longitude: number; dept?: string; region?: string }> {
  const query = [adresse, codePostal, ville, pays].filter(Boolean).join(', ');
  
  // Try Nominatim API first with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

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
          return { latitude: lat, longitude: lon };
        }
      }
    }
  } catch {
    // Ignore online geocoding error, fallback to internal dict
  }

  // Fallback: check city in dictionary
  const normalizedVille = ville.trim().toLowerCase();
  if (CITY_COORDINATES[normalizedVille]) {
    const info = CITY_COORDINATES[normalizedVille];
    // Add tiny random jitter (0.001 ~ 100m) to avoid exact marker overlaps
    const jitterLat = (Math.random() - 0.5) * 0.008;
    const jitterLng = (Math.random() - 0.5) * 0.008;
    return {
      latitude: Number((info.lat + jitterLat).toFixed(4)),
      longitude: Number((info.lng + jitterLng).toFixed(4)),
      dept: info.dept,
      region: info.region
    };
  }

  // Ultimate fallback: France center with slight scatter
  const baseLat = 46.603354;
  const baseLng = 1.888334;
  return {
    latitude: Number((baseLat + (Math.random() - 0.5) * 2.5).toFixed(4)),
    longitude: Number((baseLng + (Math.random() - 0.5) * 2.5).toFixed(4))
  };
}
