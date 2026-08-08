import { CustomField } from '../types';

export const FRENCH_ZONES = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur'
];

export interface FormFieldSchema {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'number' | 'photo';
  required: boolean;
  section: 'identity' | 'parcours' | 'location' | 'custom';
  placeholder?: string;
  options?: string[];
  description?: string;
  isCustom?: boolean;
}

export const BASE_MEMBER_FIELDS: FormFieldSchema[] = [
  // Section 1: Identité
  {
    id: 'prenom',
    key: 'prenom',
    label: 'Prénom',
    type: 'text',
    required: true,
    section: 'identity',
    placeholder: 'Ex: Aïssatou'
  },
  {
    id: 'nom',
    key: 'nom',
    label: 'Nom',
    type: 'text',
    required: true,
    section: 'identity',
    placeholder: 'Ex: Diallo'
  },
  {
    id: 'telephone',
    key: 'telephone',
    label: 'Numéro de Téléphone',
    type: 'tel',
    required: true,
    section: 'identity',
    placeholder: 'Ex: 06 12 34 56 78'
  },
  {
    id: 'email',
    key: 'email',
    label: 'Adresse e-mail',
    type: 'email',
    required: true,
    section: 'identity',
    placeholder: 'Ex: aissatou.diallo@example.com'
  },
  {
    id: 'photo',
    key: 'photo',
    label: 'Photo de profil',
    type: 'photo',
    required: false,
    section: 'identity',
    description: 'Photo d’identité ou portrait pour la fiche membre'
  },

  // Section 2: Zone & Parcours
  {
    id: 'zone',
    key: 'zone',
    label: 'Zone MDF (Région)',
    type: 'select',
    required: true,
    section: 'parcours',
    options: FRENCH_ZONES,
    placeholder: 'Sélectionnez votre zone régionale'
  },
  {
    id: 'situationProfessionnelle',
    key: 'situationProfessionnelle',
    label: 'Situation professionnelle',
    type: 'select',
    required: false,
    section: 'parcours',
    options: [
      'Salarié(e) / Employé(e)',
      'Étudiant(e)',
      'Entrepreneur / Indépendant',
      'En recherche d\'emploi',
      'Cadre / Dirigeant',
      'Autre'
    ],
    placeholder: 'Ex: Étudiant, Salarié...'
  },
  {
    id: 'domaineEtude',
    key: 'domaineEtude',
    label: 'Domaine d\'étude / Spécialité',
    type: 'text',
    required: false,
    section: 'parcours',
    placeholder: 'Ex: Informatique, Droit, Santé, Commerce...'
  },
  {
    id: 'organisation',
    key: 'organisation',
    label: 'Organisation / Université / Entreprise',
    type: 'text',
    required: false,
    section: 'parcours',
    placeholder: 'Ex: Université de Rennes, BNP Paribas...'
  },
  {
    id: 'fonction',
    key: 'fonction',
    label: 'Fonction / Poste occupé',
    type: 'text',
    required: false,
    section: 'parcours',
    placeholder: 'Ex: Ingénieur logiciel, Chef de projet...'
  },
  {
    id: 'anneeArriveeFrance',
    key: 'anneeArriveeFrance',
    label: 'Année d\'arrivée en France',
    type: 'text',
    required: false,
    section: 'parcours',
    placeholder: 'Ex: 2018, 2021...'
  },

  // Section 3: Localisation
  {
    id: 'ville',
    key: 'ville',
    label: 'Ville de résidence (Commune)',
    type: 'text',
    required: true,
    section: 'location',
    placeholder: 'Ex: Saint-Denis, Rennes, Lyon, Marseille...'
  },
  {
    id: 'departement',
    key: 'departement',
    label: 'Département',
    type: 'text',
    required: false,
    section: 'location',
    placeholder: 'Ex: Ille-et-Vilaine (35), Seine-Saint-Denis (93)'
  }
];

const CUSTOM_FIELDS_STORAGE_KEY = 'mbok_custom_form_fields_v1';

export function getStoredCustomFieldsSchema(): FormFieldSchema[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Erreur de chargement des champs personnalisés', e);
  }
  return [];
}

export function saveCustomFieldsSchema(fields: FormFieldSchema[]): void {
  try {
    localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(fields));
  } catch (e) {
    console.error('Erreur de sauvegarde des champs personnalisés', e);
  }
}

export function getAllFormFields(): FormFieldSchema[] {
  const custom = getStoredCustomFieldsSchema();
  return [...BASE_MEMBER_FIELDS, ...custom];
}
