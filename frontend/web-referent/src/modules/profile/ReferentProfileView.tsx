import React from 'react';
import { AppUser, Member } from '@shared/types';
import { User, MapPin, Mail, Phone, ShieldCheck, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface ReferentProfileViewProps {
  currentUser: AppUser | null;
  currentZone: string;
  zoneMembersCount: number;
}

export const ReferentProfileView: React.FC<ReferentProfileViewProps> = ({
  currentUser,
  currentZone,
  zoneMembersCount
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0">
            {currentUser?.nom?.charAt(0) || 'R'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> Référent Régional Officiel
            </div>
            <h1 className="text-2xl font-black text-slate-900">{currentUser?.nom || 'Référent MDF'}</h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">Mbok de France — Antenne {currentZone}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Mail className="w-3.5 h-3.5 text-emerald-700" />
                <span>{currentUser?.email || 'referent@mbokdefrance.fr'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zone {currentZone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsibilities & Mission Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Périmètre de votre Antenne</span>
          </h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Membres rattachés :</span>
              <span className="font-black text-sm text-emerald-700">{zoneMembersCount} adhérents</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Zone géographique :</span>
              <span className="font-bold text-slate-900">{currentZone}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Statut du mandat :</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Actif
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-slate-900">Charte du Référent MDF</h2>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>Assurer un accueil bienveillant des nouveaux arrivants et faciliter leur intégration.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>Garantir la confidentialité absolue des coordonnées et informations personnelles des membres.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>Transmettre régulièrement les comptes-rendus d'activité et alerter en cas de situation urgente.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
