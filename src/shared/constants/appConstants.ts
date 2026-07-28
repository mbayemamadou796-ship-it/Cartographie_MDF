import { UserRole } from '../../types';

export const APP_METADATA = {
  appName: 'Cartographie MDF',
  associationName: 'Mbok de France',
  tagline: 'au service de la fraternité !',
  version: '1.0.0 MVP',
  contactEmail: 'contact@mbokdefrance.org'
};

export const ROLE_LABELS: Record<UserRole, { label: string; badgeClass: string; description: string }> = {
  admin: {
    label: 'Administrateur',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Accès complet au système, gestion des membres, zones, utilisateurs et paramètres.'
  },
  referent: {
    label: 'Référent Régional',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Accès restreint à sa zone géographique d’attribution.'
  },
  user: {
    label: 'Utilisateur / Membre',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Consultation de l’annuaire et de la carte communautaire.'
  }
};

export const DOMAINES_ETUDE_OPTIONS = [
  'Informatique & Numérique',
  'Droit & Sciences Politiques',
  'Commerce & Management',
  'Santé & Médecine',
  'Ingénierie & Industrie',
  'Enseignement & Recherche',
  'Finance & Comptabilité',
  'Art & Culture',
  'Autre'
];

export const SITUATION_PRO_OPTIONS = [
  'Salarié(e)',
  'Étudiant(e)',
  'Indépendant(e) / Entrepreneur',
  'Cadre / Dirigeant',
  'Recherche d\'emploi',
  'Retraité(e)',
  'Autre'
];
