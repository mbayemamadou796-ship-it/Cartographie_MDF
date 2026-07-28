import React, { useState } from 'react';
import { Member } from '../../types';
import { parseExcelFile, downloadSampleExcel } from '../../utils/excelUtils';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedMembers: Member[], replaceExisting: boolean, filename: string, errors: string[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedMembers, setParsedMembers] = useState<Member[]>([]);
  const [parsingErrors, setParsingErrors] = useState<string[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg('');
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Importation de membres Excel / CSV
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                Alimentez l'annuaire Mbok de France automatiquement depuis un fichier Excel
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* Sample Download Box */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-emerald-900">Besoin d'un modèle d'importation ?</p>
              <p className="text-[11px] text-slate-600">Téléchargez notre fichier Excel type pré-rempli avec les colonnes Mbok de France.</p>
            </div>
            <button
              onClick={downloadSampleExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le modèle</span>
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              file ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-200 hover:border-emerald-400 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              id="excel-file-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <label htmlFor="excel-file-input" className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-6 h-6 text-emerald-600" />
                )}
              </div>

              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {file ? file.name : 'Glissez-déposez votre fichier Excel ici'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Formats acceptés : .xlsx, .xls, .csv
                </span>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900">Analyse du fichier et géolocalisation en cours...</p>
              <p className="text-slate-600 text-[11px]">Nous calculons les coordonnées GPS des adresses renseignées.</p>
            </div>
          )}

          {/* Parsed Results Preview */}
          {parsedMembers.length > 0 && !isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-200 p-3 rounded-xl text-emerald-950 font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{parsedMembers.length} membre(s) prêts à être importés</span>
                </span>
              </div>

              {/* Parsing Warnings / Errors */}
              {parsingErrors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1 text-[11px]">
                  <p className="font-bold">Avertissements ({parsingErrors.length}) :</p>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                    {parsingErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-emerald-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-emerald-50 text-emerald-900 font-bold border-b border-emerald-200">
                    <tr>
                      <th className="p-2">Nom & Prénom</th>
                      <th className="p-2">Fonction</th>
                      <th className="p-2">Organisation</th>
                      <th className="p-2">Ville</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {parsedMembers.slice(0, 10).map((m, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/50">
                        <td className="p-2 font-semibold text-slate-900">{m.prenom} {m.nom}</td>
                        <td className="p-2 text-slate-600">{m.fonction}</td>
                        <td className="p-2 text-slate-600">{m.organisation}</td>
                        <td className="p-2 text-slate-600">{m.ville}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedMembers.length > 10 && (
                  <div className="p-2 text-center bg-slate-50 text-slate-500 text-[10px] italic">
                    ... et {parsedMembers.length - 10} autre(s) membre(s).
                  </div>
                )}
              </div>

              {/* Import Options */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block">Mode d'importation :</span>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="importMode"
                    checked={!replaceExisting}
                    onChange={() => setReplaceExisting(false)}
                    className="accent-emerald-600"
                  />
                  <span>Ajouter aux membres existants (Fusionner)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="importMode"
                    checked={replaceExisting}
                    onChange={() => setReplaceExisting(true)}
                    className="accent-rose-600"
                  />
                  <span className="text-rose-700 font-semibold">Remplacer tous les membres existants (Réinitialisation complète)</span>
                </label>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedMembers.length === 0 || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 disabled:opacity-50 text-emerald-950 font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Valider l'importation ({parsedMembers.length})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
