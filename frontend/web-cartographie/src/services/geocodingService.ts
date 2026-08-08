import { geocodeLocation, getOfflineCoordinates } from '../utils/geocoding';

export { geocodeLocation, getOfflineCoordinates as geocodeVille };

export function calculateCityOffsetCoordinates(
  ville: string,
  existingMembers: { id: string; latitude: number; longitude: number; ville: string }[]
): { latitude: number; longitude: number } | null {
  const base = getOfflineCoordinates(ville);
  const cityMembers = existingMembers.filter(
    (m) => (m.ville || '').trim().toLowerCase() === (ville || '').trim().toLowerCase()
  );

  if (cityMembers.length === 0) {
    return base;
  }

  // Offset by tiny radius jitter around base city center
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.005 + Math.random() * 0.01;
  return {
    latitude: Number((base.latitude + Math.sin(angle) * radius).toFixed(4)),
    longitude: Number((base.longitude + Math.cos(angle) * radius).toFixed(4))
  };
}
