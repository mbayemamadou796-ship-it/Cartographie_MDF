import React, { useState } from 'react';
import { Member, CustomZone, UserRole } from '../../types';
import {
  AlertTriangle,
  PhoneOff,
  MailX,
  MapPinOff,
  Copy,
  Edit,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Compass,
  ListChecks,
  Activity,
  Search,
  Check
} from 'lucide-react';

export interface ImportLogItem {
  id: string;
  date: string;
  user: string;
  filename: string;
  addedCount: number;
  updatedCount: number;
  errorsCount: number;
}

interface DataQualityViewProps {
  members: Member[];
  customZones?: CustomZone[];
  userRole: UserRole;
  onEditMember: (member: Member) => void;
  onFilterDirectoryQuality: (qf: 'no_phone' | 'no_email' | 'no_location' | 'duplicates') => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  members,
  customZones = [],
  userRole,
  onEditMember,
  onFilterDirectoryQuality
}) => {
  const [activeTab, setActiveTab] = useState<
    'duplicates' | 'no_location' | 'no_email' | 'no_phone' | 'gps_validity' | 'import_logs' | 'consistency_report'
  >('duplicates');

  // 1. Members without phone
  const noPhoneMembers = members.filter((m) => !m.telephone || !m.telephone.trim());

  // 2. Members without email
  const noEmailMembers = members.filter((m) => !m.email || !m.email.trim());

  // 3. Members without location
  const noLocationMembers = members.filter(
    (m) => !m.latitude || !m.longitude || (m.latitude === 0 && m.longitude === 0)
  );

  // 4. Duplicate calculation
  const emailCounts = new Map<string, number>();
  const nameCounts = new Map<string, number>();
  members.forEach((m) => {
    const email = m.email?.trim().toLowerCase();
    if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);

    const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
    if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
  });

  const duplicateMembers = members.filter((m) => {
    const email = m.email?.trim().toLowerCase();
    const name = `${m.nom?.trim().toLowerCase()} ${m.prenom?.trim().toLowerCase()}`;
    return (email && (emailCounts.get(email) || 0) > 1) || (name && (nameCounts.get(name) || 0) > 1);
  });

  // 5. GPS validity check (France bounding box approx: lat 40-53, lng -10-11)
  const invalidGpsMembers = members.filter((m) => {
    if (!m.latitude || !m.longitude || (m.latitude === 0 && m.longitude === 0)) return false;
    if (m.latitude < 40 || m.latitude > 53 || m.longitude < -10 || m.longitude > 11) return true;
    return false;
  });

  // Sample import logs history
  const importLogs: ImportLogItem[] = [
    {
      id: 'imp-001',
      date: '2026-07-25 14:32',
      user: 'Admin MDF',
      filename: 'Annuaire_MDF_2026_Initial.xlsx',
      addedCount: 18,
      updatedCount: 0,
      errorsCount: 0
    },
    {
      id: 'imp-002',
      date: '2026-07-20 09:15',
      user: 'Secrétariat MDF',
      filename: 'Mise_A_Jour_Membres_Bretagne.xlsx',
      addedCount: 4,
      updatedCount: 6,
      errorsCount: 0
    }
  ];

  // Consistency report analysis
  const unassignedMembers = members.filter((m) => {
    return !customZones.some((z) => z.memberIds.includes(m.id));
  });

  const emptyZones = customZones.filter((z) => z.memberIds.length === 0);

  // Set of member IDs with at least 1 quality issue
  const membersWithIssuesSet = new Set<string>();
  noPhoneMembers.forEach((m) => membersWithIssuesSet.add(m.id));
  noEmailMembers.forEach((m) => membersWithIssuesSet.add(m.id));
  noLocationMembers.forEach((m) => membersWithIssuesSet.add(m.id));
  duplicateMembers.forEach((m) => membersWithIssuesSet.add(m.id));
  invalidGpsMembers.forEach((m) => membersWithIssuesSet.add(m.id));

  const validMembersCount = Math.max(0, members.length - membersWithIssuesSet.size);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Maintenance & Qualité des Données MDF
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Outils de contrôle, détection des doublons, validation des localisations et journal des imports
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl font-bold text-xs text-emerald-900 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{validMembersCount} / {members.length} fiches 100% valides</span>
        </div>
      </div>

      {/* Maintenance Sub-Module Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'duplicates'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Vérifier les doublons ({duplicateMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('no_location')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'no_location'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MapPinOff className="w-3.5 h-3.5" />
          <span>Sans coordonnées ({noLocationMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('no_email')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'no_email'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MailX className="w-3.5 h-3.5" />
          <span>Sans email ({noEmailMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('no_phone')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'no_phone'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>Sans téléphone ({noPhoneMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gps_validity')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'gps_validity'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Vérifier les localisations GPS ({invalidGpsMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import_logs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'import_logs'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Journal des imports</span>
        </button>

        <button
          onClick={() => setActiveTab('consistency_report')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'consistency_report'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>Rapport de cohérence</span>
        </button>
      </div>

      {/* Main Content Area Based on Active Tab */}
      {activeTab === 'import_logs' ? (
        <div className="bg-white rounded-3xl border border-emerald-200 overflow-hidden shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Journal d'Historique des Imports Excel</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">{importLogs.length} import(s) enregistré(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-emerald-100">
                <tr>
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Fichier Fichier Excel</th>
                  <th className="p-3">Ajoutés</th>
                  <th className="p-3">Mis à jour</th>
                  <th className="p-3">Erreurs</th>
                  <th className="p-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {importLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-3 font-mono text-slate-600">{log.date}</td>
                    <td className="p-3 font-bold text-slate-900">{log.user}</td>
                    <td className="p-3 text-emerald-800 font-medium">{log.filename}</td>
                    <td className="p-3 font-bold text-emerald-700">+{log.addedCount}</td>
                    <td className="p-3 font-bold text-slate-700">{log.updatedCount}</td>
                    <td className="p-3 font-bold text-rose-600">{log.errorsCount}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[10px]">
                        Succès
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'consistency_report' ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              <span>Rapport de Cohérence Globale de la Base de Données MDF</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Analyse en temps réel</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <h4 className="font-bold text-emerald-950 font-['Outfit']">Fiches membres complètes</h4>
              <p className="text-2xl font-extrabold text-emerald-700 font-['Outfit']">
                {validMembersCount} / {members.length}
              </p>
              <p className="text-[11px] text-slate-500">
                Fiches disposant d'un téléphone, email, localisation GPS valide et uniques.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 font-['Outfit']">Membres hors zone personnalisée</h4>
              <p className="text-2xl font-extrabold text-slate-800 font-['Outfit']">{unassignedMembers.length}</p>
              <p className="text-[11px] text-slate-500">
                Membres présents dans l'annuaire mais rattachés à aucune zone spécifique.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 font-['Outfit']">Zones sans membres</h4>
              <p className="text-2xl font-extrabold text-slate-800 font-['Outfit']">{emptyZones.length}</p>
              <p className="text-[11px] text-slate-500">
                Zones personnalisées créées n'ayant aucun membre rattaché pour l'instant.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Quality Table list */
        <div className="bg-white rounded-3xl border border-emerald-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
              Résultats : {
                activeTab === 'duplicates'
                  ? `Doublons potentiels (${duplicateMembers.length})`
                  : activeTab === 'no_location'
                  ? `Non géolocalisés (${noLocationMembers.length})`
                  : activeTab === 'no_email'
                  ? `Sans adresse email (${noEmailMembers.length})`
                  : activeTab === 'no_phone'
                  ? `Sans téléphone (${noPhoneMembers.length})`
                  : `Vérification GPS (${invalidGpsMembers.length})`
              }
            </h3>

            {(activeTab === 'no_phone' || activeTab === 'no_email' || activeTab === 'no_location' || activeTab === 'duplicates') && (
              <button
                onClick={() => onFilterDirectoryQuality(activeTab)}
                className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <span>Filtrer dans l'annuaire & carte</span>
              </button>
            )}
          </div>

          {((activeTab === 'duplicates' && duplicateMembers.length === 0) ||
            (activeTab === 'no_location' && noLocationMembers.length === 0) ||
            (activeTab === 'no_email' && noEmailMembers.length === 0) ||
            (activeTab === 'no_phone' && noPhoneMembers.length === 0) ||
            (activeTab === 'gps_validity' && invalidGpsMembers.length === 0)) ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Aucun problème détecté dans cette catégorie !</p>
              <p className="text-xs">Toutes les fiches membres répondent aux exigences d'exactitude MDF.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-emerald-100">
                  <tr>
                    <th className="p-3.5 pl-6">Membre</th>
                    <th className="p-3.5">Fonction & Organisation</th>
                    <th className="p-3.5">Ville & Région</th>
                    <th className="p-3.5">Téléphone</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {(activeTab === 'duplicates'
                    ? duplicateMembers
                    : activeTab === 'no_location'
                    ? noLocationMembers
                    : activeTab === 'no_email'
                    ? noEmailMembers
                    : activeTab === 'no_phone'
                    ? noPhoneMembers
                    : invalidGpsMembers
                  ).map((m) => (
                    <tr key={m.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-slate-900">
                        {m.prenom} {m.nom}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{m.fonction}</div>
                        <div className="text-[11px] text-emerald-800 font-semibold">{m.organisation}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{m.ville} ({m.codePostal})</div>
                        <div className="text-[11px] text-slate-400">{m.region}</div>
                      </td>
                      <td className="p-3.5">
                        {m.telephone ? (
                          <span className="font-mono text-slate-800">{m.telephone}</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px]">
                            Manquant
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {m.email ? (
                          <span className="text-slate-800">{m.email}</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px]">
                            Manquant
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-6 text-right">
                        {userRole === 'admin' ? (
                          <button
                            onClick={() => onEditMember(m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-xs transition-all active:scale-95"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Compléter</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Connexion Admin requise</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
