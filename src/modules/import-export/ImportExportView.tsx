import React, { useState } from 'react';
import { Member, UserRole, ImportLog } from '../../types';
import { downloadSampleExcel, parseExcelFile, exportToExcel, exportToCsv } from '../../utils/excelUtils';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, Loader2, ArrowRight, FileCheck, History, Database, Layers, ShieldCheck } from 'lucide-react';

interface ImportExportViewProps {
  members: Member[];
  userRole: UserRole;
  importLogs?: ImportLog[];
  onImportSuccess: (importedMembers: Member[], replaceExisting: boolean, filename: string, errors: string[]) => void;
  onClearLogs?: () => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  members,
  userRole,
  importLogs = [],
  onImportSuccess,
  onClearLogs
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedMembers, setParsedMembers] = useState<Member[]>([]);
  const [parsingErrors, setParsingErrors] = useState<string[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importDoneMsg, setImportDoneMsg] = useState('');

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg('');
    setImportDoneMsg('');
    setIsProcessing(true);
    setParsedMembers([]);
    setParsingErrors([]);

    try {
      const result = await parseExcelFile(selectedFile);
      setParsedMembers(result.members);
      setParsingErrors(result.errors);
      if (result.members.length === 0) {
        setErrorMsg("Aucun membre valide n'a été trouvé dans ce fichier.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la lecture du fichier Excel.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedMembers.length === 0) return;
    const filename = file ? file.name : 'Import_MDF.xlsx';
    onImportSuccess(parsedMembers, replaceExisting, filename, parsingErrors);
    setImportDoneMsg(`Import réussi ! Synchronisation des données membres terminée.`);
    setFile(null);
    setParsedMembers([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Gestion des Données & Synchronisation Excel
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Source des membres : Fichier Excel • Gestion des zones & utilisateurs : Base de données MDF
            </p>
          </div>
        </div>

        <button
          onClick={downloadSampleExcel}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Télécharger le modèle Excel MDF</span>
        </button>
      </div>

      {/* Architecture Information Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-emerald-700/50 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-400/30">
            <Database className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="font-bold text-sm font-['Outfit'] text-emerald-100">
            Principe de Synchronisation & Séparation des Données
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              📊 Membres (Excel)
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Mise à jour automatique des coordonnées (Nom, Prénom, Email, Ville, Tel, Position GPS).
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Zones MDF (Préservées)
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Vos zones et affectations ne sont jamais effacées. Les changements de ville déclenchent une alerte.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Utilisateurs (Accès)
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Les comptes administrateurs et accès utilisateurs restent sécurisés dans l'application.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Import Section */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base font-['Outfit'] flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Importation & Synchronisation Membres</span>
              </h3>
              {userRole !== 'admin' && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                  Administration requise
                </span>
              )}
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                file ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-200 hover:border-emerald-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="excel-view-file-input"
                disabled={userRole !== 'admin'}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <label
                htmlFor="excel-view-file-input"
                className={`block space-y-3 ${userRole === 'admin' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                  {isProcessing ? (
                    <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                  ) : (
                    <Upload className="w-7 h-7 text-emerald-600" />
                  )}
                </div>

                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {file ? file.name : 'Cliquez ou glissez votre fichier Excel ici'}
                  </span>
                  <span className="text-slate-500 text-xs mt-1 block">
                    Formats acceptés : Microsoft Excel (.xlsx, .xls) ou CSV (.csv)
                  </span>
                </div>
              </label>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {importDoneMsg && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importDoneMsg}</span>
              </div>
            )}

            {/* Parsed Members Preview */}
            {parsedMembers.length > 0 && !isProcessing && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-emerald-100/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-950 text-xs font-bold">
                  <span>{parsedMembers.length} membre(s) prêts à être synchronisés</span>
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                </div>

                {/* Import Mode Options */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Choisissez l'action :</span>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="importModeView"
                      checked={!replaceExisting}
                      onChange={() => setReplaceExisting(false)}
                      className="accent-emerald-600"
                    />
                    <span>Mettre à jour & fusionner avec l'annuaire existant</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="importModeView"
                      checked={replaceExisting}
                      onChange={() => setReplaceExisting(true)}
                      className="accent-rose-600"
                    />
                    <span className="text-rose-700 font-semibold">
                      Réinitialiser la liste des membres uniquement (Conserve les zones)
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleConfirmImport}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-2xl shadow-xs transition-all active:scale-95 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lancer la synchronisation ({parsedMembers.length} membres)</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            💡 L'import gère automatiquement la géolocalisation GPS des adresses renseignées.
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base font-['Outfit'] flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>Exportation de la Base de Données</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800 px-2.5 py-1 bg-emerald-50 rounded-full">
                {members.length} membres
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Téléchargez une sauvegarde intégrale au format standard Microsoft Excel ou CSV. Ces fichiers peuvent être ouverts dans n'importe quel tableur.
            </p>

            <div className="space-y-3">
              <button
                onClick={() =>
                  exportToExcel(members, `Mbok_de_France_Sauvegarde_${new Date().toISOString().slice(0, 10)}.xlsx`)
                }
                className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-200/80 text-emerald-900 flex items-center justify-center font-bold">
                    📊
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-emerald-800">
                      Exporter au format Excel (.xlsx)
                    </span>
                    <span className="text-[11px] text-slate-500">Fichier complet stylisé pour tableur</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() =>
                  exportToCsv(members, `Mbok_de_France_Sauvegarde_${new Date().toISOString().slice(0, 10)}.csv`)
                }
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                    📄
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-emerald-800">
                      Exporter au format CSV (.csv)
                    </span>
                    <span className="text-[11px] text-slate-500">Format texte universel délimité par des virgules</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            🔒 Toutes vos données restent stockées de manière sécurisée et confidentielle.
          </div>
        </div>

      </div>

      {/* Import History / Logs Section */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <History className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                Journaux d'importation & Historique des synchronisations
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Traçabilité des fichiers Excel importés et rapports d'erreurs
              </p>
            </div>
          </div>

          {importLogs.length > 0 && onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
            >
              Effacer l'historique
            </button>
          )}
        </div>

        {importLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-200/80 text-slate-500 text-xs font-medium">
            Aucun journal d'importation enregistré pour le moment. Les prochains imports apparaîtront ici.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {importLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200/90 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-['Outfit'] text-sm">
                      📁 {log.filename}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-md text-[10px]">
                      {log.totalRows} lignes
                    </span>
                  </div>
                  <div className="text-slate-500 font-medium flex items-center gap-3 text-[11px]">
                    <span>📅 {log.date}</span>
                    <span>👤 Par : <strong>{log.importedBy}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-900 font-bold rounded-xl border border-emerald-200">
                    +{log.addedCount} ajoutés
                  </span>
                  <span className="px-2.5 py-1 bg-blue-100/80 text-blue-900 font-bold rounded-xl border border-blue-200">
                    {log.updatedCount} mis à jour
                  </span>
                  {log.locationChangesCount > 0 && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200">
                      📍 {log.locationChangesCount} alerte(s) ville
                    </span>
                  )}
                  {log.errors.length > 0 && (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-900 font-bold rounded-xl border border-rose-200">
                      ⚠️ {log.errors.length} erreur(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

