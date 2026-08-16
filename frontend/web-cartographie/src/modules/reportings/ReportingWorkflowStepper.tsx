import React from 'react';
import { 
  Send, Clock, CheckCircle2, MessageSquare, 
  ArrowRight, ShieldCheck, AlertCircle, Sparkles, Check,
  Calendar, RefreshCw
} from 'lucide-react';
import { WeeklyReport, ReportingStatus } from '@shared/types';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';

interface ReportingWorkflowStepperProps {
  report: WeeklyReport;
  variant?: 'full' | 'compact' | 'interactive';
  onSelectStatus?: (status: ReportingStatus) => void;
  userRole?: 'admin' | 'referent' | 'user';
  isSaving?: boolean;
}

export const ReportingWorkflowStepper: React.FC<ReportingWorkflowStepperProps> = ({
  report,
  variant = 'full',
  onSelectStatus,
  userRole = 'admin',
  isSaving = false
}) => {
  const currentStatus = report.status || 'NOUVEAU';
  const hasBureauNotes = Boolean(report.bureauNotes && report.bureauNotes.trim().length > 0);
  const lastActivity = report.lastActivityAt || report.updatedAt || report.createdAt;

  // Status index for progression (0 = Nouveau, 1 = En cours, 2 = Traite)
  const getStatusStepIndex = (status: ReportingStatus) => {
    switch (status) {
      case 'NOUVEAU': return 1;
      case 'EN_COURS': return 2;
      case 'TRAITE': return 3;
      default: return 1;
    }
  };

  const currentStep = getStatusStepIndex(currentStatus);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Compact Variant for cards
  if (variant === 'compact') {
    return (
      <div className="w-full space-y-2 pt-1">
        {/* Priority and Type Header row */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <ReportTypeBadge type={report.type} size="sm" />
            <PriorityBadge priority={report.priority} urgenceLevel={report.urgenceLevel} size="sm" />
          </div>
          
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium font-mono">
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Activité : {formatShortDate(lastActivity)}</span>
          </div>
        </div>

        {/* Step dots & line */}
        <div className="flex items-center justify-between relative pt-1">
          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 z-0 transition-all duration-500"
            style={{
              width: currentStep === 1 ? '15%' : currentStep === 2 ? '50%' : '100%'
            }}
          />

          {/* Step 1: Nouveau */}
          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 transition-all ${
            currentStep >= 1 
              ? 'bg-blue-600 text-white border-blue-200 ring-2 ring-blue-100 shadow-2xs' 
              : 'bg-white text-slate-400 border-slate-300'
          }`}>
            <Send className="w-3 h-3" />
          </div>

          {/* Step 2: En cours */}
          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 transition-all ${
            currentStep >= 2 
              ? 'bg-amber-500 text-white border-amber-200 ring-2 ring-amber-100 shadow-2xs' 
              : 'bg-white text-slate-400 border-slate-300'
          }`}>
            <Clock className="w-3 h-3" />
          </div>

          {/* Step 3: Traité */}
          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 transition-all ${
            currentStep >= 3 
              ? 'bg-emerald-600 text-white border-emerald-200 ring-2 ring-emerald-100 shadow-2xs' 
              : 'bg-white text-slate-400 border-slate-300'
          }`}>
            <Check className="w-3 h-3" />
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
          <span className={currentStep === 1 ? 'text-blue-700 font-bold' : ''}>1. Nouveau</span>
          <span className={currentStep === 2 ? 'text-amber-700 font-bold' : ''}>2. En cours</span>
          <span className={currentStep === 3 ? 'text-emerald-700 font-bold' : ''}>3. Traité & Réglé</span>
        </div>
      </div>
    );
  }

  // Full / Interactive Variant
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
      
      {/* Header with Title & Status info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">
                Cycle de Suivi & Résolution du Signalement
              </h4>
              <ReportTypeBadge type={report.type} size="sm" />
              <PriorityBadge priority={report.priority} urgenceLevel={report.urgenceLevel} size="sm" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Suivi en temps réel avec traçabilité de l'activité
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">État :</span>
          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
            currentStatus === 'TRAITE'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : currentStatus === 'EN_COURS'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-blue-100 text-blue-900 border border-blue-300'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              currentStatus === 'TRAITE' ? 'bg-emerald-600' : currentStatus === 'EN_COURS' ? 'bg-amber-600' : 'bg-blue-600'
            }`} />
            {currentStatus === 'TRAITE' ? 'Traité & Réglé' : currentStatus === 'EN_COURS' ? 'En cours de traitement' : 'Nouveau dossier'}
          </span>
        </div>
      </div>

      {/* Date Tracking Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Créée le : <strong className="text-slate-900 font-mono">{formatDate(report.createdAt)}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Dernière activité : <strong className="text-amber-900 font-mono">{formatDate(lastActivity)}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Statut : <strong className="text-slate-900 font-mono">{currentStatus === 'TRAITE' ? 'Traité' : currentStatus === 'EN_COURS' ? 'En cours' : 'Nouveau'}</strong></span>
        </div>
      </div>

      {/* Visual Stepper Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Step 1: Nouveau */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          currentStep === 1
            ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-200/60 shadow-2xs'
            : currentStep > 1
            ? 'bg-slate-50/70 border-slate-200'
            : 'bg-slate-50/50 border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Étape 1</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Signalement transmis</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Envoyé par {report.referentName || 'le référent'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            {formatDate(report.createdAt)}
          </p>
        </div>

        {/* Step 2: En cours */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          currentStep === 2
            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200/60 shadow-2xs'
            : currentStep > 2
            ? 'bg-slate-50/70 border-slate-200'
            : 'bg-slate-50/50 border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
              currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Étape 2</span>
          </div>
          <p className="text-xs font-bold text-slate-900">En cours d'analyse</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Prise en charge par le Bureau
          </p>
          {report.reviewedBy && currentStep >= 2 && (
            <p className="text-[10px] text-amber-800 font-semibold mt-1">
              Par {report.reviewedBy}
            </p>
          )}
        </div>

        {/* Step 3: Traité */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          currentStep === 3
            ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-200/60 shadow-2xs'
            : 'bg-slate-50/50 border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
              currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Étape 3</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Problème Réglé & Traité</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dossier résolu et clôturé
          </p>
          {report.reviewedAt && currentStep === 3 && (
            <p className="text-[10px] text-emerald-800 font-semibold mt-1">
              Résolu le {formatDate(report.reviewedAt)}
            </p>
          )}
        </div>

      </div>

      {/* Admin Interactive Action Buttons */}
      {userRole === 'admin' && onSelectStatus && (
        <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
            Action rapide : Modifier l'état d'avancement pour ce signalement
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSelectStatus('NOUVEAU')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentStatus === 'NOUVEAU'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>1. Marquer Nouveau</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSelectStatus('EN_COURS')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentStatus === 'EN_COURS'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>2. Marquer En cours</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSelectStatus('TRAITE')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentStatus === 'TRAITE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Marquer Traité / Réglé</span>
            </button>
          </div>
        </div>
      )}

      {/* Referent Feedback Notification Banner */}
      {hasBureauNotes && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>
                {userRole === 'referent' ? 'Message & Retour d\'information du Bureau :' : 'Retour transmis au référent :'}
              </span>
            </div>
            {report.reviewedBy && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                Par {report.reviewedBy} {report.reviewedAt ? `(${formatDate(report.reviewedAt)})` : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-900 font-semibold whitespace-pre-wrap leading-relaxed pl-6">
            « {report.bureauNotes} »
          </p>
        </div>
      )}

      {!hasBureauNotes && userRole === 'referent' && currentStatus === 'NOUVEAU' && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Votre remontée a bien été enregistrée. Le Bureau national l'examinera sous peu et vous recevrez leur retour ici dès qu'il sera disponible.
          </span>
        </div>
      )}

    </div>
  );
};

