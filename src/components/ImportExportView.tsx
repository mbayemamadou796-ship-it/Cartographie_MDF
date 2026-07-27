import React, { useState } from 'react';
import { Member, UserRole } from '../types';
import { downloadSampleExcel, parseExcelFile, exportToExcel, exportToCsv } from '../utils/excelUtils';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, Loader2, ArrowRight, FileCheck } from 'lucide-react';

interface ImportExportViewProps {
  members: Member[];
  userRole: UserRole;
  onImportSuccess: (importedMembers: Member[], replaceExisting: boolean) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  members,
  userRole,
  onImportSuccess
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
    onImportSuccess(parsedMembers, replaceExisting);
    setImportDoneMsg(`Import réussi ! ${parsedMembers.length} membre(s) synchronisé(s).`);
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
              Gestion de l'Importation & Exportation
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Alimentez l'annuaire Mbok de France depuis Excel ou sauvegardez vos fiches au format .xlsx / .csv
            </p>
          </div>
        </div>

        <button
          onClick={downloadSampleExcel}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl font-bold text-xs transition-colors shrink-0 shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Télécharger le modèle Excel MDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Import Section */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base font-['Outfit'] flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Importation de membres (Excel / CSV)</span>
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
                  <span>{parsedMembers.length} membre(s) prêts à être importés</span>
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
                    <span>Ajouter aux membres existants (Fusionner)</span>
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
                      Remplacer tous les membres existants (Réinitialisation)
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleConfirmImport}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-bold rounded-2xl shadow-xs transition-all active:scale-95 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider l'importation ({parsedMembers.length} membres)</span>
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
                {members.length} membres en mémoire
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
                className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all group"
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
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl transition-all group"
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

    </div>
  );
};
