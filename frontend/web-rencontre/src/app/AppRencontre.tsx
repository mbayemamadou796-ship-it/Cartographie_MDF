import React, { useState, useEffect } from 'react';
import { Rencontre, RencontreResponse } from '@shared/types';
import { RencontreService } from '../../../web-cartographie/src/services/rencontreService';
import { RencontreHeader } from '../components/RencontreHeader';
import { RencontreHomeView } from '../components/RencontreHomeView';
import { RencontreSurveyForm } from '../components/RencontreSurveyForm';
import { RencontreSuccessModal } from '../components/RencontreSuccessModal';
import { RencontreDuplicateModal } from '../components/RencontreDuplicateModal';
import { RencontreQrModal } from '../components/RencontreQrModal';
import { Search, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface AppRencontreProps {
  onSwitchToBureau?: () => void;
  logoUrl?: string;
  initialRencontreId?: string;
}

export const AppRencontre: React.FC<AppRencontreProps> = ({
  onSwitchToBureau,
  logoUrl,
  initialRencontreId
}) => {
  // Rencontre selection
  const [rencontres, setRencontres] = useState<Rencontre[]>(() => RencontreService.getRencontres());
  
  const [currentRencontre, setCurrentRencontre] = useState<Rencontre>(() => {
    if (initialRencontreId) {
      const found = RencontreService.getRencontreById(initialRencontreId);
      if (found) return found;
    }
    return RencontreService.getActiveRencontre();
  });

  const [responses, setResponses] = useState<RencontreResponse[]>(() => 
    RencontreService.getResponses(currentRencontre.id)
  );

  // App view state: 'home' | 'survey'
  const [view, setView] = useState<'home' | 'survey'>('home');

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [successResponse, setSuccessResponse] = useState<RencontreResponse | null>(null);
  const [duplicateResponse, setDuplicateResponse] = useState<RencontreResponse | null>(null);
  const [responseToEdit, setResponseToEdit] = useState<RencontreResponse | null>(null);
  const [isCheckResponseModalOpen, setIsCheckResponseModalOpen] = useState(false);
  const [checkSearchInput, setCheckSearchInput] = useState('');
  const [foundCheckResponse, setFoundCheckResponse] = useState<RencontreResponse | null | 'NOT_FOUND'>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Sync when data updates in local storage, broadcast channel or other windows
  useEffect(() => {
    const handleSync = () => {
      const allR = RencontreService.getRencontres();
      setRencontres(allR);
      const active = allR.find(r => r.id === currentRencontre.id) || RencontreService.getActiveRencontre();
      setCurrentRencontre(active);
      setResponses(RencontreService.getResponses(active.id));
    };

    const unsubscribe = RencontreService.subscribe(handleSync);
    return () => {
      unsubscribe();
    };
  }, [currentRencontre.id]);

  const handleStartSurvey = () => {
    setResponseToEdit(null);
    setView('survey');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSurveySuccess = (resp: RencontreResponse) => {
    setSuccessResponse(resp);
    setResponses(RencontreService.getResponses(currentRencontre.id));
    setView('home');
    showToast('Votre réponse a été enregistrée avec succès !');
  };

  const handleDuplicateFound = (existing: RencontreResponse) => {
    setDuplicateResponse(existing);
  };

  const handleEditFromDuplicate = () => {
    if (duplicateResponse) {
      setResponseToEdit(duplicateResponse);
      setDuplicateResponse(null);
      setView('survey');
    }
  };

  const handleEditFromSuccess = () => {
    if (successResponse) {
      setResponseToEdit(successResponse);
      setSuccessResponse(null);
      setView('survey');
    }
  };

  const handleSearchMyResponse = () => {
    if (!checkSearchInput.trim()) return;
    const clean = checkSearchInput.trim().toLowerCase();
    const cleanTel = checkSearchInput.replace(/\s+/g, '');

    const found = responses.find(r => 
      `${r.prenom} ${r.nom}`.toLowerCase().includes(clean) ||
      (r.email && r.email.toLowerCase() === clean) ||
      (r.telephone && r.telephone.replace(/\s+/g, '') === cleanTel)
    );

    if (found) {
      setFoundCheckResponse(found);
    } else {
      setFoundCheckResponse('NOT_FOUND');
    }
  };

  const participantsCount = responses.filter(r => r.participation === 'OUI').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f8f3] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <RencontreHeader
        onSwitchToBureau={onSwitchToBureau}
        onOpenQrCode={() => setIsQrModalOpen(true)}
        logoUrl={logoUrl}
        rencontreNom={currentRencontre.nom}
        rencontreLieu={currentRencontre.lieu}
        rencontreDates={currentRencontre.dateAffichage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' ? (
          <RencontreHomeView
            rencontre={currentRencontre}
            totalResponsesCount={responses.length}
            participantsCount={participantsCount}
            onStartSurvey={handleStartSurvey}
            onOpenQrCode={() => setIsQrModalOpen(true)}
            onCheckMyResponse={() => {
              setFoundCheckResponse(null);
              setCheckSearchInput('');
              setIsCheckResponseModalOpen(true);
            }}
            onSwitchToBureau={onSwitchToBureau}
          />
        ) : (
          <RencontreSurveyForm
            rencontre={currentRencontre}
            existingResponseToEdit={responseToEdit}
            onSuccess={handleSurveySuccess}
            onCancel={() => setView('home')}
            onDuplicateFound={handleDuplicateFound}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
          <p>© {new Date().getFullYear()} Mbok de France (MDF)</p>
        </div>
      </footer>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <RencontreQrModal
          rencontre={currentRencontre}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

      {/* Success Modal */}
      {successResponse && (
        <RencontreSuccessModal
          rencontre={currentRencontre}
          response={successResponse}
          onClose={() => setSuccessResponse(null)}
          onEdit={handleEditFromSuccess}
        />
      )}

      {/* Duplicate Alert Modal */}
      {duplicateResponse && (
        <RencontreDuplicateModal
          rencontre={currentRencontre}
          existingResponse={duplicateResponse}
          onClose={() => setDuplicateResponse(null)}
          onEdit={handleEditFromDuplicate}
        />
      )}

      {/* Check Response Modal */}
      {isCheckResponseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCheckResponseModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              Vérifier votre réponse
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recherchez votre réponse enregistrée pour la {currentRencontre.nom} par nom, email ou téléphone.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={checkSearchInput}
                onChange={(e) => setCheckSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMyResponse()}
                placeholder="Votre nom, email ou 06..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleSearchMyResponse}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Chercher
              </button>
            </div>

            {foundCheckResponse === 'NOT_FOUND' && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 text-center">
                Aucune réponse trouvée avec ces coordonnées. Vous pouvez répondre au sondage dès maintenant.
              </div>
            )}

            {foundCheckResponse && foundCheckResponse !== 'NOT_FOUND' && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-xs space-y-2 mb-4">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{foundCheckResponse.prenom} {foundCheckResponse.nom}</span>
                  <span className="text-emerald-800">{foundCheckResponse.participation === 'OUI' ? 'Présent (Oui)' : foundCheckResponse.participation === 'NON' ? 'Absent (Non)' : 'Incertain'}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Zone : {foundCheckResponse.zone} {foundCheckResponse.dureePresence ? `• Durée : ${foundCheckResponse.dureePresence === 'TROIS_JOURS' ? '3 jours' : 'Week-end'}` : ''}
                </div>
                <div className="text-[10px] text-slate-400">
                  Enregistré le {new Date(foundCheckResponse.dateReponse).toLocaleDateString('fr-FR')}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResponseToEdit(foundCheckResponse);
                    setIsCheckResponseModalOpen(false);
                    setView('survey');
                  }}
                  className="w-full mt-2 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Modifier cette réponse
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AppRencontre;
