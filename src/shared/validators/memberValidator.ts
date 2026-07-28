import { Member } from '../../types';

export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return false;
  // Permet chiffres, espaces, +, ., -, parenthes
  const cleaned = phone.replace(/[\s\+\.\-\(\)]/g, '');
  return cleaned.length >= 8 && /^\d+$/.test(cleaned);
}

export function hasValidCoordinates(member: Member): boolean {
  return (
    typeof member.latitude === 'number' &&
    typeof member.longitude === 'number' &&
    (member.latitude !== 0 || member.longitude !== 0) &&
    !isNaN(member.latitude) &&
    !isNaN(member.longitude)
  );
}

export function checkMemberDataQuality(member: Member): {
  isPhoneMissing: boolean;
  isEmailMissing: boolean;
  isLocationMissing: boolean;
  qualityScore: number; // 0 à 100
} {
  const isPhoneMissing = !member.telephone || !isValidPhone(member.telephone);
  const isEmailMissing = !member.email || !isValidEmail(member.email);
  const isLocationMissing = !hasValidCoordinates(member);

  let score = 100;
  if (isPhoneMissing) score -= 30;
  if (isEmailMissing) score -= 30;
  if (isLocationMissing) score -= 40;

  return {
    isPhoneMissing,
    isEmailMissing,
    isLocationMissing,
    qualityScore: Math.max(0, score)
  };
}
