import React, { useState } from 'react';
import { WeeklyReport, UserRole, ReportingStatus, ReportResponse } from '@shared/types';
import { 
  X, Calendar, MapPin, User, Mail, Phone, AlertCircle, 
  CheckCircle2, Clock, MessageSquare, Send, ShieldAlert,
  HelpCircle, ArrowRight, Activity, Users, AlertTriangle, Sparkles, Check,
  RefreshCw, Paperclip, Zap, FileText, History, CornerDownRight, Plus,
  ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { ReportingWorkflowStepper } from './ReportingWorkflowStepper';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';
import { ReportingService } from '../../services/reportingService';

interface ReportDetailModalProps {
  report: WeeklyReport | null;
  isOpen: boolean;
  userRole: UserRole;
  currentUserName?: string;
  onClose: () => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus, bureauNotes?: string) => void;
  onDelete?: (reportId: string) => void;
  onAddResponse?: (reportId: string, content: string, newStatus?: ReportingStatus) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  userRole,
  currentUserName,
  onClose,
  onUpdateStatus,
  onDelete,
  onAddResponse
}) => {
  if (!isOpen || !report) return null;

  const [newMessage, setNewMessage] = useState('');
  const [bureauNotes, setBureauNotes] = useState(report.bureauNotes || '');
  const [selectedStatus, setSelectedStatus] = useState<ReportingStatus>(report.status || 'NOUVEAU');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'MESSAGES' | 'HISTORY'>('DETAILS');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const lastActivity = report.lastActivityAt || report.updatedAt || report.createdAt;
  const caseIdDisplay = report.caseNumber || `#${report.id.replace('rep-', '')}`;

  const handleSaveBureauNotes = (newStatus?: ReportingStatus) => {
    setIsSaving(true);
    const targetStatus = newStatus || selectedStatus;
    setSelectedStatus(targetStatus);
    onUpdateStatus(report.id, targetStatus, bureauNotes);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }, 300);
  };

  const handleQuickStatusChange = (status: ReportingStatus) => {
    setSelectedStatus(status);
    handleSaveBureauNotes(status);
  };

  const handleSendNewMessage = (newStatus?: ReportingStatus) => {
    if (!newMessage.trim()) return;
    setIsSaving(true);
    const authorName = currentUserName || (userRole === 'admin' ? 'Bureau National MDF' : report.referentName);
    const authorRole = userRole === 'admin' ? 'bureau' : 'referent';
    
    if (onAddResponse) {
      onAddResponse(report.id, newMessage.trim(), newStatus);
    } else {
      ReportingService.addBureauResponse(report.id, newMessage.trim(), authorName, authorRole, newStatus);
      onUpdateStatus(report.id, newStatus || selectedStatus, newMessage.trim());
    }

    setNewMessage('');
    setIsSaving(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Quick preset notes for the admin
  const quickNotesPresets = [
    "Dossier pris en charge par le Bureau. Nous contactons les partenaires locaux.",
    "Problème réglé et solution validée avec succès. Merci pour ta vigilance sur le terrain !",
    "Demande d'appui transmise au pôle Solidarité & Logement MDF pour accompagnement direct.",
    "Budget / supports de communication validés par la Trésorerie MDF."
  ];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatFullDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // All responses (including legacy bureauNotes if no responses array exists)
  const allResponses: ReportResponse[] = (report.reponses && report.reponses.length > 0)
    ? report.reponses
    : report.bureauNotes
    ? [
        {
          id: 'legacy-resp',
          authorName: report.reviewedBy || 'Bureau National MDF',
          authorRole: 'bureau',
          content: report.bureauNotes,
          createdAt: report.reviewedAt || report.updatedAt || report.createdAt
        }
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 sm:p-6 relative flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-xs">
                  {caseIdDisplay}
                </span>
                <ReportTypeBadge type={report.type} size="md" />
                <PriorityBadge priority={report.priority} urgenceLevel={report.urgenceLevel} size="md" />
                <span className="bg-white/10 text-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                  Zone : {report.zone}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                {report.sujet || (report.type === 'PONCTUEL' ? `Signalement ponctuel — ${report.zone}` : `Reporting d'activité — ${report.zone}`)}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semaine du {formatDate(report.semaineLundi)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Créé le {formatFullDateTime(report.createdAt)}</span>
                </span>
                {report.responsableName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-300 font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>{report.responsableName}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 px-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DETAILS'
                ? 'bg-white text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Détails & Contenu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MESSAGES')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MESSAGES'
                ? 'bg-white text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Fil d'échange & Réponses ({allResponses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-white text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Historique & Audit ({(report.actionHistory || []).length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          
          {/* Visual Workflow Cycle Stepper */}
          <ReportingWorkflowStepper
            report={{
              ...report,
              status: selectedStatus,
              bureauNotes: bureauNotes,
              lastActivityAt: lastActivity
            }}
            variant="full"
            userRole={userRole}
            onSelectStatus={userRole === 'admin' ? handleQuickStatusChange : undefined}
            isSaving={isSaving}
          />

          {/* TAB 1: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-5">
              {/* Referent Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm border border-emerald-300">
                    {report.referentName ? report.referentName.slice(0, 2).toUpperCase() : 'RF'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Référent de Zone</p>
                    <p className="text-base font-bold text-slate-900">{report.referentName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{report.email}</span>
                  </div>
                  {report.telephone && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{report.telephone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Alert if Bureau feedback requested */}
              {report.besoinRetourBureau && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4.5 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Intervention sollicitée auprès du Bureau :</span>
                  </div>
                  <p className="text-xs text-amber-900 font-semibold bg-white/80 p-3 rounded-xl border border-amber-200">
                    {report.detailsDemandeRetour || 'Le référent a indiqué avoir besoin d\'un appui ou d\'un retour du Bureau pour ce dossier.'}
                  </p>
                </div>
              )}

              {/* Section: Priority situations / Description of issue */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {report.type === 'PONCTUEL' ? 'Description détaillée du problème / Situation' : 'Situations prioritaires & Cas particuliers signalés'}
                  </span>
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 whitespace-pre-wrap leading-relaxed font-medium">
                  {report.situationsPrioritaires || 'Aucune situation particulière détaillée.'}
                </div>
              </div>

              {/* Section: Local activities (for periodic reports) */}
              {report.activitesLocales && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Activités locales & Dynamique menée sur la zone</span>
                  </div>
                  <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                    {report.activitesLocales}
                  </div>
                </div>
              )}

              {/* Section: New members contacted */}
              {report.nouveauxContactes && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wide">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Nouveaux membres / contacts recensés</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 pl-6">
                    {report.nouveauxContactes}
                  </p>
                </div>
              )}

              {/* Attachments Section if present */}
              {report.piecesJointes && report.piecesJointes.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                    <Paperclip className="w-4 h-4 text-purple-600" />
                    <span>Pièces jointes & Documents ({report.piecesJointes.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {report.piecesJointes.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold truncate">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MESSAGES & COMMUNICATIONS */}
          {activeTab === 'MESSAGES' && (
            <div className="space-y-4">
              
              {/* Thread history */}
              <div className="space-y-3">
                {allResponses.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Aucun message échangé pour ce cas</p>
                    <p className="text-[11px] text-slate-400">Le Bureau ou le Référent peuvent ajouter des messages ci-dessous.</p>
                  </div>
                ) : (
                  allResponses.map((resp, idx) => (
                    <div 
                      key={resp.id || idx}
                      className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                        resp.authorRole === 'bureau'
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 ml-4'
                          : 'bg-blue-50/80 border-blue-200 text-blue-950 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                          <span className={`w-2 h-2 rounded-full ${resp.authorRole === 'bureau' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                          <span>{resp.authorName}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-md ${
                            resp.authorRole === 'bureau' ? 'bg-emerald-200/80 text-emerald-900' : 'bg-blue-200/80 text-blue-900'
                          }`}>
                            {resp.authorRole === 'bureau' ? 'Bureau National' : 'Référent de zone'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{formatFullDateTime(resp.createdAt)}</span>
                      </div>
                      <p className="pl-4 whitespace-pre-wrap font-medium">{resp.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Composer */}
              <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ajouter une réponse / note de suivi au dossier :</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Notification automatique
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message officiel ou vos indications..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none resize-none font-medium"
                />

                {/* Quick Presets for Bureau */}
                {userRole === 'admin' && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Suggestions rapides :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickNotesPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewMessage(preset)}
                          className="text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 px-2 py-1 rounded-lg transition-all text-left cursor-pointer"
                        >
                          {preset.slice(0, 45)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {userRole === 'admin' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendNewMessage('EN_COURS')}
                        disabled={!newMessage.trim() || isSaving}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Répondre & Passer En cours</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendNewMessage('TRAITE')}
                        disabled={!newMessage.trim() || isSaving}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Répondre & Clôturer Traité</span>
                      </button>
                    </div>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => handleSendNewMessage()}
                    disabled={!newMessage.trim() || isSaving}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-emerald-950 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer le message</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AUDIT & HISTORY LOG */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>Journal d'audit & Traçabilité du cas {caseIdDisplay}</span>
                </h4>

                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(!report.actionHistory || report.actionHistory.length === 0) ? (
                    <div className="relative pl-7 text-xs text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-2.5 top-1" />
                      <p className="font-bold text-slate-800">Création initiale</p>
                      <p className="text-[11px] text-slate-400">{formatFullDateTime(report.createdAt)}</p>
                    </div>
                  ) : (
                    report.actionHistory.map((act, idx) => (
                      <div key={act.id || idx} className="relative pl-7 space-y-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-slate-50 absolute left-2.5 top-1" />
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-bold text-slate-900">{act.action}</p>
                          <span className="text-[10px] text-slate-400">{formatFullDateTime(act.date)}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Par <span className="font-bold text-slate-800">{act.authorName}</span> ({act.authorRole})
                        </p>
                        {act.details && (
                          <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                            {act.details}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Timing metrics card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Prise en charge</p>
                  <p className="font-bold text-slate-800 mt-0.5">{report.datePriseEnCharge ? formatFullDateTime(report.datePriseEnCharge) : 'En attente'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">1ère réponse Bureau</p>
                  <p className="font-bold text-slate-800 mt-0.5">{report.dateReponse ? formatFullDateTime(report.dateReponse) : 'En attente'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Clôture & Traitement</p>
                  <p className="font-bold text-slate-800 mt-0.5">{report.dateTraitement ? formatFullDateTime(report.dateTraitement) : 'En cours'}</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between flex-shrink-0">
          {userRole === 'admin' && onDelete ? (
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer ce rapport ?')) {
                  onDelete(report.id);
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-800 text-xs font-bold hover:underline cursor-pointer"
            >
              Supprimer cette remontée
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
