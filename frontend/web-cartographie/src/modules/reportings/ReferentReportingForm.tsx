import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WeeklyReport, AppUser, CustomZone, ReportingType, ReportingPriority, ReportAttachment, ReportingStatus } from '@shared/types';
import { 
  Send, CheckCircle2, AlertCircle, Calendar, 
  MapPin, User, Mail, MessageSquare, History, Sparkles,
  HelpCircle, AlertTriangle, Activity, Users, Clock, ArrowRight, Eye,
  ClipboardList, Check, ShieldCheck, Zap, FileText, Paperclip, X, RefreshCw,
  UploadCloud, File as FileIcon, FileSpreadsheet, Image as ImageIcon
} from 'lucide-react';
import { ReportingWorkflowStepper } from './ReportingWorkflowStepper';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';

interface ReferentReportingFormProps {
  currentUser: AppUser | null;
  customZones: CustomZone[];
  myReports: WeeklyReport[];
  onSubmitReport: (reportData: Omit<WeeklyReport, 'id' | 'createdAt' | 'status'>) => void;
  onOpenReportDetail: (report: WeeklyReport) => void;
}

export const ReferentReportingForm: React.FC<ReferentReportingFormProps> = ({
  currentUser,
  customZones,
  myReports,
  onSubmitReport,
  onOpenReportDetail
}) => {
  // Compute default previous Monday
  const getDefaultMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  };

  // Form State
  const [reportingType, setReportingType] = useState<ReportingType>('PERIODIQUE');
  const [sujet, setSujet] = useState('');
  const [priority, setPriority] = useState<ReportingPriority>('NORMAL');
  const [piecesJointes, setPiecesJointes] = useState<ReportAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(currentUser?.email || '');
  const [referentName, setReferentName] = useState(currentUser?.name || `${currentUser?.prenom || ''} ${currentUser?.nom || ''}`.trim());
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    if (currentUser?.region) return currentUser.region;
    if (currentUser?.assignedZoneIds && currentUser.assignedZoneIds.length > 0) {
      const found = customZones.find(z => currentUser.assignedZoneIds?.includes(z.id));
      if (found) return found.name;
    }
    return customZones.length > 0 ? customZones[0].name : 'Bretagne';
  });

  const [semaineLundi, setSemaineLundi] = useState(getDefaultMonday());
  const [nouveauxContactes, setNouveauxContactes] = useState('');
  const [situationsPrioritaires, setSituationsPrioritaires] = useState('');
  const [activitesLocales, setActivitesLocales] = useState('');
  const [besoinRetourBureau, setBesoinRetourBureau] = useState<boolean>(false);
  const [detailsDemandeRetour, setDetailsDemandeRetour] = useState('');
  const [urgenceLevel, setUrgenceLevel] = useState<number>(1);

  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'history'>('form');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | ReportingStatus>('ALL');

  // Counts for Referent's reports
  const myTotalCount = myReports.length;
  const myNewCount = myReports.filter(r => r.status === 'NOUVEAU').length;
  const myEnCoursCount = myReports.filter(r => r.status === 'EN_COURS').length;
  const myTraiteCount = myReports.filter(r => r.status === 'TRAITE').length;

  // Filtered reports for history tab
  const filteredMyReports = useMemo(() => {
    return myReports.filter(r => {
      if (historyStatusFilter !== 'ALL' && r.status !== historyStatusFilter) return false;
      return true;
    });
  }, [myReports, historyStatusFilter]);

  // Update defaults when user changes
  useEffect(() => {
    if (currentUser) {
      if (!email) setEmail(currentUser.email || '');
      if (!referentName) setReferentName(currentUser.name || `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim());
      if (currentUser.region) {
        setSelectedZone(currentUser.region);
      }
    }
  }, [currentUser]);

  // Sync urgence level with priority
  const handleSelectPriority = (p: ReportingPriority) => {
    setPriority(p);
    if (p === 'URGENT') setUrgenceLevel(5);
    else if (p === 'IMPORTANT') setUrgenceLevel(3);
    else setUrgenceLevel(1);
  };

  const handleSelectUrgenceLevel = (lvl: number) => {
    setUrgenceLevel(lvl);
    if (lvl >= 4) setPriority('URGENT');
    else if (lvl === 3) setPriority('IMPORTANT');
    else setPriority('NORMAL');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc: ReportAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: event.target?.result as string,
          uploadedAt: new Date().toISOString()
        };
        setPiecesJointes((prev) => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = (id?: string) => {
    if (!id) return;
    setPiecesJointes((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResetForm = () => {
    setReportingType('PERIODIQUE');
    setSujet('');
    setPriority('NORMAL');
    setPiecesJointes([]);
    setSemaineLundi(getDefaultMonday());
    setNouveauxContactes('');
    setSituationsPrioritaires('');
    setActivitesLocales('');
    setBesoinRetourBureau(false);
    setDetailsDemandeRetour('');
    setUrgenceLevel(1);
    setIsSubmittedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !referentName || !selectedZone) {
      alert('Veuillez renseigner tous les champs obligatoires (*).');
      return;
    }

    if (reportingType === 'PONCTUEL' && !sujet.trim()) {
      alert('Veuillez renseigner le sujet de votre remontée ponctuelle.');
      return;
    }

    const matchedZone = customZones.find(
      (z) => z.name.toLowerCase() === selectedZone.toLowerCase()
    );

    onSubmitReport({
      referentId: currentUser?.id || `ref-${Date.now()}`,
      referentName: referentName.trim(),
      email: email.trim(),
      telephone: (currentUser as any)?.telephone || '',
      zone: selectedZone,
      zoneId: matchedZone?.id,
      semaineLundi: semaineLundi || getDefaultMonday(),
      type: reportingType,
      sujet: sujet.trim() || undefined,
      priority,
      piecesJointes: piecesJointes.length > 0 ? piecesJointes : undefined,
      lastActivityAt: new Date().toISOString(),
      nouveauxContactes: nouveauxContactes.trim() || undefined,
      situationsPrioritaires: situationsPrioritaires.trim() || undefined,
      activitesLocales: activitesLocales.trim() || undefined,
      besoinRetourBureau: reportingType === 'PONCTUEL' ? true : besoinRetourBureau,
      detailsDemandeRetour: (reportingType === 'PONCTUEL' || besoinRetourBureau) ? (detailsDemandeRetour.trim() || situationsPrioritaires.trim()) : undefined,
      urgenceLevel
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub tabs: Nouveau reporting / Historique des remontées */}
      <div className="flex items-center justify-between border-b border-emerald-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('form')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'form'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nouveau Signalement / Reporting</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Mes Remontées Précédentes ({myReports.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'form' ? (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Choice of Reporting Type (Périodique vs Ponctuelle) */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 text-white border border-emerald-400/30 shadow-md space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                Mode de Signalement
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-2 font-['Outfit']">
                Quel type de remontée souhaitez-vous transmettre ?
              </h2>
              <p className="text-xs text-slate-300">
                Choisissez entre un point régulier d'activité ou un problème ponctuel nécessitant l'intervention rapide du Bureau.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              
              {/* Option 1: Reporting Périodique */}
              <button
                type="button"
                onClick={() => {
                  setReportingType('PERIODIQUE');
                  setBesoinRetourBureau(false);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  reportingType === 'PERIODIQUE'
                    ? 'bg-white text-slate-900 border-emerald-400 ring-2 ring-emerald-300 shadow-md'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  reportingType === 'PERIODIQUE' ? 'bg-blue-100 text-blue-800' : 'bg-white/10 text-white'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-bold">1. Reporting Périodique</p>
                    {reportingType === 'PERIODIQUE' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    reportingType === 'PERIODIQUE' ? 'text-slate-600 font-medium' : 'text-slate-300'
                  }`}>
                    Point régulier de zone : nouveaux membres, activités menées, vie de la zone et dynamique locale.
                  </p>
                </div>
              </button>

              {/* Option 2: Remontée Ponctuelle */}
              <button
                type="button"
                onClick={() => {
                  setReportingType('PONCTUEL');
                  setBesoinRetourBureau(true);
                  if (priority === 'NORMAL') {
                    setPriority('IMPORTANT');
                    setUrgenceLevel(3);
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  reportingType === 'PONCTUEL'
                    ? 'bg-white text-slate-900 border-purple-400 ring-2 ring-purple-300 shadow-md'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  reportingType === 'PONCTUEL' ? 'bg-purple-100 text-purple-800' : 'bg-white/10 text-white'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-bold">2. Remontée Ponctuelle</p>
                    {reportingType === 'PONCTUEL' && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    reportingType === 'PONCTUEL' ? 'text-slate-600 font-medium' : 'text-slate-300'
                  }`}>
                    Problème particulier ou urgent : besoin d'intervention directe du Bureau, pièces jointes, arbitrage.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Intro Card matching the style */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <ClipboardList className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
                  MDF — {reportingType === 'PONCTUEL' ? 'Signalement Ponctuel & Demande d\'Intervention' : 'Reporting Périodique des Référents'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Liaison directe et suivi en temps réel avec le Bureau national MDF
                </p>
              </div>
            </div>

            {/* Arabic greeting & Spiritual intro block */}
            {reportingType === 'PERIODIQUE' ? (
              <div className="space-y-3.5 text-slate-700 leading-relaxed">
                {/* Encadré d'ouverture avec salutation en calligraphie arabe */}
                <div className="text-center py-2.5 px-4 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 shadow-2xs">
                  <div dir="rtl" style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#065f46' }} className="font-serif">
                    السلام عليكم ورحمة الله وبركاته أخي الكريم
                  </div>
                </div>

                {/* Texte explicatif rappelant avec bienveillance l'objectif du reporting */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-emerald-100/80 space-y-2">
                  <p className="text-slate-700 font-medium text-xs sm:text-sm leading-relaxed">
                    Ce petit reporting permet au bureau de rester proche de ce qui se vit sur le terrain, de t'épauler plus vite quand tu as besoin d'un coup de main, et de garder une vision d'ensemble au travail que vous abattez tous. (5 minutes pour épauler la zone et garder une vision d'ensemble).
                  </p>
                </div>

                {/* Encadré de bénédiction intermédiaire */}
                <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200/80 text-xs sm:text-sm font-semibold text-emerald-950 text-center italic shadow-2xs">
                  « Qu'Allah te récompense pour ton investissement et facilite chacune de tes démarches. »
                </div>

                {/* Encadré de clôture stylisé au même format que l'ouverture */}
                <div className="text-center py-2.5 px-4 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 shadow-2xs">
                  <div dir="rtl" style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#065f46' }} className="font-serif">
                    بارك الله فيك وجزاك الله خيرا
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-slate-700 leading-relaxed">
                <div className="text-center py-2.5 px-4 bg-purple-50/90 rounded-2xl border border-purple-200/90 shadow-2xs">
                  <div dir="rtl" style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#581c87' }} className="font-serif">
                    السلام عليكم ورحمة الله وبركاته أخي الكريم
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-purple-100/80 space-y-2">
                  <p className="text-slate-700 font-medium text-xs sm:text-sm leading-relaxed">
                    Tu rencontres un cas particulier, un blocage ou un besoin urgent d'appui ? Ce formulaire permet d'alerter directement le Bureau national sans attendre le reporting périodique.
                  </p>
                </div>

                <div className="p-3 bg-purple-100/60 rounded-xl border border-purple-200/80 text-xs sm:text-sm font-semibold text-purple-950 text-center italic shadow-2xs">
                  « Qu'Allah te facilite et accorde le succès à tes démarches pour la communauté. »
                </div>

                <div className="text-center py-2.5 px-4 bg-purple-50/90 rounded-2xl border border-purple-200/90 shadow-2xs">
                  <div dir="rtl" style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#581c87' }} className="font-serif">
                    بارك الله فيك وجزاك الله خيرا
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 font-semibold border-t border-emerald-100 pt-3 flex items-center justify-between">
              <span>Les champs marqués d'un <span className="text-red-500 font-bold">*</span> sont obligatoires.</span>
              <span className="text-emerald-700 font-bold">Zone active : {selectedZone}</span>
            </div>
          </div>

          {/* Success Notification */}
          {isSubmittedSuccess && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-5 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-bold text-emerald-900 font-serif" dir="rtl">
                  بارك الله فيك وجزاك الله خيرا
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit']">
                  Votre {reportingType === 'PONCTUEL' ? 'remontée ponctuelle' : 'reporting périodique'} a bien été transmis au Bureau MDF.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
                  Le dossier est enregistré avec le statut <strong>"Nouveau"</strong>. Vous recevrez une réponse et le suivi de l'avancement dans votre onglet historique.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={handleResetForm}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-black rounded-2xl shadow-md transition-all cursor-pointer text-xs"
                >
                  Nouveau signalement
                </button>
                <button
                  onClick={() => setActiveSubTab('history')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  Consulter mes remontées
                </button>
              </div>
            </div>
          )}

          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* If Remontée Ponctuelle: Sujet & Objectif */}
            {reportingType === 'PONCTUEL' && (
              <div className="bg-white rounded-3xl p-6 border-2 border-purple-300 shadow-sm space-y-4">
                <div className="border-b border-purple-100 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Objet de la Remontée Ponctuelle</span>
                  </h3>
                  <span className="text-[11px] font-black bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
                    Ponctuel
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Sujet de l'intervention / Problème <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sujet}
                    onChange={(e) => setSujet(e.target.value)}
                    placeholder="Ex: Demande urgente de caution logement pour un étudiant à Rennes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Section 1: Informations Générales */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="border-b border-emerald-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>1. Identité du Référent & Zone</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Adresse e-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: referent.zone@mbokdefrance.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all"
                  />
                </div>

                {/* Nom du Référent */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nom du référent <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={referentName}
                    onChange={(e) => setReferentName(e.target.value)}
                    placeholder="Prénom et nom"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all"
                  />
                </div>

                {/* Zone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Zone géographique MDF <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all cursor-pointer"
                  >
                    {customZones.map((z) => (
                      <option key={z.id} value={z.name}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {reportingType === 'PONCTUEL' ? 'Date du signalement' : 'Semaine du (Lundi)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={semaineLundi}
                    onChange={(e) => setSemaineLundi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all cursor-pointer"
                  />
                </div>

              </div>
            </div>

            {/* Priority Notion: Normal, Important, Urgent */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="border-b border-emerald-100 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Priorité du Signalement</span>
                </h3>
                <PriorityBadge priority={priority} urgenceLevel={urgenceLevel} size="md" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Normal */}
                <button
                  type="button"
                  onClick={() => handleSelectPriority('NORMAL')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    priority === 'NORMAL'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">🟢 Normal</p>
                    <p className="text-[10px] text-slate-500">Traitement standard de routine</p>
                  </div>
                </button>

                {/* Important */}
                <button
                  type="button"
                  onClick={() => handleSelectPriority('IMPORTANT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    priority === 'IMPORTANT'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-950">🟠 Important</p>
                    <p className="text-[10px] text-slate-500">À traiter rapidement</p>
                  </div>
                </button>

                {/* Urgent */}
                <button
                  type="button"
                  onClick={() => handleSelectPriority('URGENT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    priority === 'URGENT'
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 shrink-0 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-rose-950">🔴 Urgent</p>
                    <p className="text-[10px] text-slate-500">Intervention requise</p>
                  </div>
                </button>
              </div>

              {/* Internal 1-5 scale toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Niveau d'urgence interne (1 à 5) :
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-700">
                    Niveau {urgenceLevel}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSelectUrgenceLevel(lvl)}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        urgenceLevel === lvl
                          ? lvl >= 4
                            ? 'bg-rose-600 text-white shadow-xs'
                            : lvl === 3
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Contenu du signalement */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="border-b border-emerald-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>
                    {reportingType === 'PONCTUEL' ? '2. Description du Problème & Besoin' : '2. Vie de la Zone & Nouveaux Contacts'}
                  </span>
                </h3>
              </div>

              {/* For Périodique: Nouveaux contacts */}
              {reportingType === 'PERIODIQUE' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nombre de nouveaux contactés cette semaine <span className="text-xs font-normal text-slate-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={nouveauxContactes}
                    onChange={(e) => setNouveauxContactes(e.target.value)}
                    placeholder="Ex: 3 nouveaux arrivants, ou 5 prises de contact"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all"
                  />
                </div>
              )}

              {/* Situations prioritaires / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {reportingType === 'PONCTUEL'
                    ? 'Description détaillée du problème rencontré'
                    : 'Situations prioritaires / Cas particuliers'}{' '}
                  <span className={reportingType === 'PONCTUEL' ? 'text-red-500' : 'text-slate-500 font-normal'}>
                    {reportingType === 'PONCTUEL' ? '*' : '(optionnel)'}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500">
                  {reportingType === 'PONCTUEL'
                    ? "Expliquez la situation avec précision : personnes concernées, démarches déjà tentées, urgence."
                    : "Étudiants en difficulté, démarches administratives, recherche urgente de logement ou d'emploi."}
                </p>
                <textarea
                  rows={4}
                  required={reportingType === 'PONCTUEL'}
                  value={situationsPrioritaires}
                  onChange={(e) => setSituationsPrioritaires(e.target.value)}
                  placeholder={
                    reportingType === 'PONCTUEL'
                      ? "Ex: Un membre nouvellement arrivé à Brest n'a pas de solution d'hébergement pour la rentrée..."
                      : "Décris brièvement les situations nécessitant une attention..."
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all resize-none"
                />
              </div>

              {/* Activités locales menées (uniquement en périodique) */}
              {reportingType === 'PERIODIQUE' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Activités locales menées cette semaine <span className="text-xs font-normal text-slate-500">(optionnel)</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Réunions de zone, visites fraternelles, recensement, entraide ou projets locaux.
                  </p>
                  <textarea
                    rows={3}
                    value={activitesLocales}
                    onChange={(e) => setActivitesLocales(e.target.value)}
                    placeholder="Ex: Réunion de coordination tenue le samedi, visite d'un nouveau membre..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none transition-all resize-none"
                  />
                </div>
              )}
            </div>

            {/* Section 3: Pièces jointes (Documents éventuels) */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="border-b border-emerald-100 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-600" />
                  <span>3. Pièces jointes / Documents (Optionnel)</span>
                </h3>
                <span className="text-[11px] text-purple-900 font-bold bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {piecesJointes.length} document{piecesJointes.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.zip"
                className="hidden"
              />

              <div className="space-y-3">
                {/* Unified Drag and drop / File Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-purple-500 bg-purple-50 scale-[0.99] shadow-inner'
                      : 'border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50/60'
                  }`}
                >
                  <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      Glissez-déposez vos fichiers ici ou <span className="text-purple-600 underline">cliquez pour parcourir</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Formats acceptés : PDF, Word, Excel, Images (PNG, JPG), ZIP
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Ajouter des fichiers</span>
                  </button>
                </div>

                {/* Attached files list */}
                {piecesJointes.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-slate-700">Documents joints à la transmission :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {piecesJointes.map((doc) => (
                        <div
                          key={doc.id || doc.name}
                          className="flex items-center justify-between bg-purple-50/80 p-2.5 rounded-xl border border-purple-200 text-xs text-purple-950 shadow-2xs hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="p-1.5 bg-purple-200/70 text-purple-800 rounded-lg shrink-0">
                              {doc.name.toLowerCase().endsWith('.pdf') ? (
                                <FileText className="w-3.5 h-3.5 text-red-600" />
                              ) : doc.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/) ? (
                                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                              ) : doc.name.toLowerCase().match(/\.(xls|xlsx|csv)$/) ? (
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Paperclip className="w-3.5 h-3.5 text-purple-700" />
                              )}
                            </span>
                            <div className="truncate">
                              <p className="font-bold truncate text-slate-900 text-xs">{doc.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {doc.size ? formatFileSize(doc.size) : 'Document joint'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                download={doc.name}
                                title="Télécharger ou afficher"
                                className="p-1 text-purple-600 hover:text-purple-900 rounded-lg hover:bg-purple-100 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(doc.id)}
                              title="Supprimer ce document"
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Appui & Liaison Bureau */}
            {reportingType === 'PERIODIQUE' && (
              <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
                <div className="border-b border-emerald-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>4. Besoin d'un retour du Bureau national</span>
                  </h3>
                </div>

                {/* As-tu besoin d'un retour du Bureau ? */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800">
                    As-tu besoin d'un retour ou d'un appui du Bureau pour ce reporting ? <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setBesoinRetourBureau(true)}
                      className={`flex-1 p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        besoinRetourBureau
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Oui, j'ai besoin d'un retour</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBesoinRetourBureau(false);
                        setDetailsDemandeRetour('');
                      }}
                      className={`flex-1 p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        !besoinRetourBureau
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Non, simple reporting de routine</span>
                    </button>
                  </div>
                </div>

                {/* Détails demande si Oui */}
                {besoinRetourBureau && (
                  <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-300 space-y-2 animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-amber-950">
                      Précise la demande pour le Bureau national <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-amber-800">
                      Précise de quoi tu as besoin : contacts, budget, document officiel, arbitrage ou décision du Bureau...
                    </p>
                    <textarea
                      rows={3}
                      required={besoinRetourBureau}
                      value={detailsDemandeRetour}
                      onChange={(e) => setDetailsDemandeRetour(e.target.value)}
                      placeholder="Précise les points sur lesquels tu attends une réponse..."
                      className="w-full bg-white border border-amber-300 rounded-2xl p-3 text-xs text-slate-900 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200/60 transition-all resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions matching application style */}
            <div className="flex items-center justify-end pt-2 pb-8">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 text-emerald-950 font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>
                  {reportingType === 'PONCTUEL' ? 'Transmettre la remontée ponctuelle' : 'Transmettre mon reporting'}
                </span>
              </button>
            </div>

          </form>

        </div>
      ) : (
        /* History of previous reports */
        <div className="space-y-5">
          {/* Tracking Workflow Info Banner (Interactive Filter) */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit']">
                    Suivi Opérationnel & Réponses du Bureau
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    Cliquez sur une étape pour filtrer vos signalements selon leur statut.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                {historyStatusFilter === 'ALL' ? 'Toutes vos remontées' : `Filtre actif : ${historyStatusFilter}`}
              </span>
            </div>

            {/* Visual 4-step interactive flow */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              
              {/* Step 1: All / Reporting Envoyé */}
              <button
                type="button"
                onClick={() => setHistoryStatusFilter('ALL')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  historyStatusFilter === 'ALL'
                    ? 'bg-white/25 border-emerald-400 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-white/10 border-white/10 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-lg font-black flex items-center justify-center text-[10px] shrink-0 ${
                    historyStatusFilter === 'ALL' ? 'bg-emerald-400 text-slate-950' : 'bg-blue-500/30 text-blue-300'
                  }`}>
                    1
                  </span>
                  <div>
                    <p className="font-bold text-white text-[11px]">Reporting Envoyé</p>
                    <p className="text-[10px] text-slate-300">Tous vos envois</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white shrink-0">
                  {myTotalCount}
                </span>
              </button>

              {/* Step 2: Nouveau (Bureau) */}
              <button
                type="button"
                onClick={() => setHistoryStatusFilter(historyStatusFilter === 'NOUVEAU' ? 'ALL' : 'NOUVEAU')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  historyStatusFilter === 'NOUVEAU'
                    ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400 shadow-sm'
                    : 'bg-white/10 border-white/10 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-lg font-black flex items-center justify-center text-[10px] shrink-0 ${
                    historyStatusFilter === 'NOUVEAU' ? 'bg-blue-400 text-slate-950' : 'bg-blue-500/30 text-blue-300'
                  }`}>
                    2
                  </span>
                  <div>
                    <p className="font-bold text-white text-[11px]">Nouveau (Bureau)</p>
                    <p className="text-[10px] text-slate-300">En attente d'ouverture</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  myNewCount > 0 ? 'bg-blue-500 text-white' : 'bg-white/20 text-slate-300'
                }`}>
                  {myNewCount}
                </span>
              </button>

              {/* Step 3: En cours d'action */}
              <button
                type="button"
                onClick={() => setHistoryStatusFilter(historyStatusFilter === 'EN_COURS' ? 'ALL' : 'EN_COURS')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  historyStatusFilter === 'EN_COURS'
                    ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                    : 'bg-white/10 border-white/10 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-lg font-black flex items-center justify-center text-[10px] shrink-0 ${
                    historyStatusFilter === 'EN_COURS' ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/30 text-amber-300'
                  }`}>
                    3
                  </span>
                  <div>
                    <p className="font-bold text-white text-[11px]">En cours d'action</p>
                    <p className="text-[10px] text-slate-300">Prise en charge active</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  myEnCoursCount > 0 ? 'bg-amber-500 text-slate-950' : 'bg-white/20 text-slate-300'
                }`}>
                  {myEnCoursCount}
                </span>
              </button>

              {/* Step 4: Traité & Réglé */}
              <button
                type="button"
                onClick={() => setHistoryStatusFilter(historyStatusFilter === 'TRAITE' ? 'ALL' : 'TRAITE')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  historyStatusFilter === 'TRAITE'
                    ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-white/10 border-white/10 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-lg font-black flex items-center justify-center text-[10px] shrink-0 ${
                    historyStatusFilter === 'TRAITE' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-500/30 text-emerald-300'
                  }`}>
                    4
                  </span>
                  <div>
                    <p className="font-bold text-white text-[11px]">Traité & Réglé</p>
                    <p className="text-[10px] text-slate-300">Retour visible</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  myTraiteCount > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-white/20 text-slate-300'
                }`}>
                  {myTraiteCount}
                </span>
              </button>

            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  Historique de vos remontées & reportings
                </h3>
                <p className="text-xs text-slate-500">
                  {historyStatusFilter !== 'ALL'
                    ? `Affichage des signalements au statut "${historyStatusFilter}" (${filteredMyReports.length} résultat${filteredMyReports.length > 1 ? 's' : ''})`
                    : "Retrouvez ici tous les rapports et remontées ponctuelles transmis par vos soins avec l'avancement et les retours du Bureau."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {historyStatusFilter !== 'ALL' && (
                  <button
                    onClick={() => setHistoryStatusFilter('ALL')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 border border-slate-200"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                    <span>Réinitialiser filtre</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSubTab('form')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Nouveau signalement</span>
                </button>
              </div>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Vous n'avez pas encore envoyé de reporting ou remontée.</p>
                <button
                  onClick={() => setActiveSubTab('form')}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                >
                  Remplir mon premier signalement
                </button>
              </div>
            ) : filteredMyReports.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Aucun signalement ne correspond au filtre sélectionné.</p>
                <button
                  onClick={() => setHistoryStatusFilter('ALL')}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                >
                  Voir tous mes signalements ({myTotalCount})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMyReports.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 shadow-2xs space-y-3.5 transition-all cursor-pointer group"
                    onClick={() => onOpenReportDetail(r)}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <ReportTypeBadge type={r.type} size="sm" />
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            Zone : {r.zone}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                          {r.sujet || `Semaine du lundi ${r.semaineLundi}`}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                          r.status === 'TRAITE'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : r.status === 'EN_COURS'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'TRAITE' ? 'bg-emerald-600' : r.status === 'EN_COURS' ? 'bg-amber-600' : 'bg-blue-600'
                          }`} />
                          {r.status === 'TRAITE' ? 'Traité & Réglé' : r.status === 'EN_COURS' ? 'En cours' : 'Nouveau'}
                        </span>
                        <PriorityBadge priority={r.priority} urgenceLevel={r.urgenceLevel} size="sm" />
                      </div>
                    </div>

                    {/* Compact Workflow Stepper with lastActivity */}
                    <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                      <ReportingWorkflowStepper report={r} variant="compact" />
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2">
                      {r.situationsPrioritaires || r.activitesLocales || 'Remontée standard de routine.'}
                    </div>

                    {/* Bureau Notes Message Card */}
                    {r.bureauNotes ? (
                      <div className="bg-emerald-50/90 p-3 rounded-xl border-2 border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1 text-emerald-900">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Message du Bureau :</span>
                          </span>
                          {r.reviewedBy && (
                            <span className="text-[10px] text-emerald-700 italic">Par {r.reviewedBy}</span>
                          )}
                        </div>
                        <p className="pl-4.5 font-semibold text-emerald-950">« {r.bureauNotes} »</p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>En attente de retour du Bureau administratif</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span>Activité : {new Date(r.lastActivityAt || r.updatedAt || r.createdAt).toLocaleDateString('fr-FR')}</span>
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:underline">
                        <span>Voir suivi complet</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

