import * as XLSX from 'xlsx';
import { Member } from '../types';
import { geocodeLocation } from './geocoding';

// Helper to normalize column header strings
function normalizeHeader(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export async function parseExcelFile(file: File): Promise<{ members: Member[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedMembers: Member[] = [];
        const errors: string[] = [];

        for (let i = 0; i < rawRows.length; i++) {
          const raw = rawRows[i];
          const rowNum = i + 2; // Accounting for 1-based header row

          // Map headers flexibly
          const mappedRow: Record<string, string> = {};
          Object.keys(raw).forEach((key) => {
            const normKey = normalizeHeader(key);
            mappedRow[normKey] = String(raw[key] ?? '').trim();
          });

          const nom = mappedRow['nom'] || mappedRow['lastname'] || '';
          const prenom = mappedRow['prenom'] || mappedRow['firstname'] || '';
          const zone = mappedRow['zone'] || mappedRow['region'] || 'Île-de-France';
          const situationProfessionnelle = mappedRow['situationprofessionnelle'] || mappedRow['situation'] || mappedRow['profession'] || mappedRow['fonction'] || 'Salarié';
          const domaineEtude = mappedRow['domaineetude'] || mappedRow['domaine'] || mappedRow['specialite'] || mappedRow['organisation'] || 'Général';
          const anneeArriveeFrance = mappedRow['anneearriveefrance'] || mappedRow['anneearrivee'] || mappedRow['anneefrance'] || mappedRow['annee'] || '';
          const fonction = mappedRow['fonction'] || mappedRow['post'] || mappedRow['role'] || situationProfessionnelle;
          const organisation = mappedRow['organisation'] || mappedRow['organisme'] || mappedRow['structure'] || domaineEtude;
          const email = mappedRow['email'] || mappedRow['mail'] || '';
          const telephone = mappedRow['telephone'] || mappedRow['tel'] || mappedRow['phone'] || '';
          const adresse = mappedRow['adresse'] || mappedRow['address'] || '';
          const ville = mappedRow['ville'] || mappedRow['city'] || '';
          const codePostal = mappedRow['codepostal'] || mappedRow['cp'] || mappedRow['postalcode'] || '';
          const departement = mappedRow['departement'] || mappedRow['dept'] || '';
          const region = mappedRow['region'] || zone;
          const pays = mappedRow['pays'] || mappedRow['country'] || 'France';
          const photo = mappedRow['photo'] || mappedRow['avatar'] || mappedRow['photourl'] || '';

          if (!nom && !prenom && !email) {
            // Skip empty rows
            continue;
          }

          if (!nom) {
            errors.push(`Ligne ${rowNum}: Nom manquant, membre ignoré.`);
            continue;
          }

          let lat = parseFloat(mappedRow['latitude'] || mappedRow['lat'] || 'NaN');
          let lng = parseFloat(mappedRow['longitude'] || mappedRow['lng'] || mappedRow['lon'] || 'NaN');

          // Always auto-compute latitude and longitude from city, department, and zone if missing or empty
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
            const geo = await geocodeLocation(ville, departement, pays, zone);
            lat = geo.latitude;
            lng = geo.longitude;
          }

          const member: Member = {
            id: `mdf-imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            nom,
            prenom,
            zone,
            situationProfessionnelle,
            domaineEtude,
            anneeArriveeFrance,
            fonction,
            organisation,
            email,
            telephone,
            adresse,
            codePostal,
            ville: ville || 'Non spécifiée',
            departement: departement || (ville ? `Dép. (${ville.slice(0, 2)})` : 'France'),
            region: region || zone,
            pays,
            latitude: lat,
            longitude: lng,
            photo: photo || undefined
          };

          parsedMembers.push(member);
        }

        resolve({ members: parsedMembers, errors });
      } catch (err: any) {
        reject(new Error(err.message || 'Erreur lors de la lecture du fichier Excel.'));
      }
    };

    reader.onerror = () => reject(new Error('Échec du chargement du fichier.'));
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(members: Member[], filename: string = 'Membres_MDF_Export.xlsx') {
  const exportData = members.map((m) => {
    const row: Record<string, any> = {
      'Prénom': m.prenom,
      'Nom': m.nom,
      'Numéro téléphone': m.telephone,
      'Adresse e-mail': m.email,
      'Zone': m.zone || m.region || '',
      'Situation professionnelle': m.situationProfessionnelle || m.fonction || '',
      'Domaine d\'étude': m.domaineEtude || m.organisation || '',
      'Année d\'arrivée en France': m.anneeArriveeFrance || '',
      'Adresse': m.adresse || '',
      'Code Postal': m.codePostal || '',
      'Ville': m.ville || '',
      'Département': m.departement || '',
      'Pays': m.pays || 'France',
      'Latitude': m.latitude,
      'Longitude': m.longitude
    };

    if (m.champsPersonnalises && m.champsPersonnalises.length > 0) {
      m.champsPersonnalises.forEach((cp) => {
        if (cp.label) {
          row[`[Champ Perso] ${cp.label}`] = cp.value;
        }
      });
    }

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Membres MDF');

  // Auto-fit column widths
  const max_widths = [15, 15, 18, 28, 20, 25, 25, 18, 30, 12, 18, 22, 10, 12, 12];
  worksheet['!cols'] = max_widths.map((w) => ({ wch: w }));

  XLSX.writeFile(workbook, filename);
}

export function exportToCsv(members: Member[], filename: string = 'Membres_MDF_Export.csv') {
  const headers = [
    'Nom', 'Prénom', 'Fonction', 'Organisation', 'Email', 'Téléphone',
    'Adresse', 'Code Postal', 'Ville', 'Département', 'Région', 'Pays',
    'Latitude', 'Longitude'
  ];

  const rows = members.map((m) => [
    `"${m.nom.replace(/"/g, '""')}"`,
    `"${m.prenom.replace(/"/g, '""')}"`,
    `"${m.fonction.replace(/"/g, '""')}"`,
    `"${m.organisation.replace(/"/g, '""')}"`,
    `"${m.email.replace(/"/g, '""')}"`,
    `"${m.telephone.replace(/"/g, '""')}"`,
    `"${m.adresse.replace(/"/g, '""')}"`,
    `"${m.codePostal.replace(/"/g, '""')}"`,
    `"${m.ville.replace(/"/g, '""')}"`,
    `"${m.departement.replace(/"/g, '""')}"`,
    `"${m.region.replace(/"/g, '""')}"`,
    `"${m.pays.replace(/"/g, '""')}"`,
    m.latitude,
    m.longitude
  ]);

  // UTF-8 BOM for Excel opening french accents correctly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSampleExcel() {
  const sampleData = [
    {
      'Nom': 'Garnier',
      'Prénom': 'Nathalie',
      'Situation professionnelle': 'Directrice de Pôle',
      'Domaine d\'étude': 'Santé publique',
      'Zone': 'Île-de-France',
      'Email': 'nathalie.garnier@mdf-france.org',
      'Téléphone': '01 43 55 12 00',
      'Adresse': '15 Rue de la Roquette',
      'Code Postal': '75011',
      'Ville': 'Paris',
      'Département': 'Paris (75)',
      'Pays': 'France'
    },
    {
      'Nom': 'Ndiaye',
      'Prénom': 'Ousmane',
      'Situation professionnelle': 'Psychologue clinicien',
      'Domaine d\'étude': 'Psychologie',
      'Zone': 'Auvergne-Rhône-Alpes',
      'Email': 'ousmane.ndiaye@mdf-france.org',
      'Téléphone': '04 78 60 20 30',
      'Adresse': '12 Place Bellecour',
      'Code Postal': '69002',
      'Ville': 'Lyon',
      'Département': 'Rhône (69)',
      'Pays': 'France'
    },
    {
      'Nom': 'Rousseau',
      'Prénom': 'Élodie',
      'Situation professionnelle': 'Juriste Droit Social',
      'Domaine d\'étude': 'Droit',
      'Zone': 'Nouvelle-Aquitaine',
      'Email': 'elodie.rousseau@mdf-france.org',
      'Téléphone': '05 56 00 11 22',
      'Adresse': '8 Cours de l\'Intendance',
      'Code Postal': '33000',
      'Ville': 'Bordeaux',
      'Département': 'Gironde (33)',
      'Pays': 'France'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modèle Import MDF');
  XLSX.writeFile(workbook, 'Modele_Import_Membres_MDF.xlsx');
}
