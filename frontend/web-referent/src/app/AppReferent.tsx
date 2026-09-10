import React, { useState } from 'react';
import { Member, WeeklyReport, CustomZone, AppUser, ReportingStatus } from '@shared/types';
import { ReferentHeader } from '../components/ReferentHeader';
import { ReferentNavigation, ReferentTab } from '../components/ReferentNavigation';
import { ReferentDashboardView } from '../modules/dashboard/ReferentDashboardView';
import { ReferentZoneView } from '../modules/zone/ReferentZoneView';
import { ReferentMembersView } from '../modules/members/ReferentMembersView';
import { NouveauReportingView } from '../modules/reporting/NouveauReportingView';
import { MesRemonteesView } from '../modules/reporting/MesRemonteesView';
import { ReferentProfileView } from '../modules/profile/ReferentProfileView';
import { ReportDetailModal } from '../../../web-cartographie/src/modules/reportings/ReportDetailModal';
import { MemberModal } from '../../../web-cartographie/src/components/MemberModal';
import { ReportingService } from '../../../web-cartographie/src/services/reportingService';
import { DocumentsView } from '../../../web-cartographie/src/modules/documents/DocumentsView';
import { RencontresView } from '../../../web-cartographie/src/modules/rencontres/RencontresView';
import { RencontreService } from '../../../web-cartographie/src/services/rencontreService';

interface AppReferentProps {
  currentUser: AppUser | null;
  members: Member[];
  customZones: CustomZone[];
  reports: WeeklyReport[];
  onUpdateReports: (reports: WeeklyReport[]) => void;
  onLogout: () => void;
  onSwitchPortal: (portal: 'cartographie' | 'referent' | 'admin' | 'formulaire' | 'rencontre') => void;
}

export const AppReferent: React.FC<AppReferentProps> = ({
  currentUser,
  members,
  customZones,
  reports,
  onUpdateReports,
  onLogout,
  onSwitchPortal
}) => {
  const [activeTab, setActiveTab] = useState<ReferentTab>('dashboard');
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // User's assigned zone or fallback
  const currentZone = currentUser?.zone || 'Île-de-France';

  // Filter members and reports for this referent's zone
  const zoneMembers = members.filter(m => {
    if (!currentUser?.zone || currentUser.role === 'admin') return true;
    return m.zone?.toLowerCase() === currentUser.zone.toLowerCase() ||
           m.region?.toLowerCase().includes(currentUser.zone.toLowerCase()) ||
           m.departement?.toLowerCase().includes(currentUser.zone.toLowerCase());
  });

  const zoneReports = reports.filter(r => {
    if (currentUser?.role === 'admin') return true;
    return r.zone?.toLowerCase() === currentZone.toLowerCase() || r.referentId === currentUser?.id;
  });

  const pendingCount = zoneReports.filter(r => r.status === 'NOUVEAU' || r.status === 'EN_COURS').length;

  const handleCreateReport = (reportData: Omit<WeeklyReport, 'id' | 'createdAt'>) => {
    const created = ReportingService.createReport(reportData, reports);
    onUpdateReports([created, ...reports]);
    showToast('Nouveau reporting enregistré.');
    setActiveTab('my_reports');
  };

  const handleAddResponse = (reportId: string, content: string) => {
    const updated = ReportingService.addResponse(
      reportId,
      {
        authorName: currentUser?.nom || 'Référent',
        authorRole: 'referent',
        content
      },
      reports
    );
    onUpdateReports(updated);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(updated.find(r => r.id === reportId) || null);
    }
    showToast('Réponse ajoutée.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f8f3] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Referent Header */}
      <ReferentHeader
        currentUser={currentUser}
        onLogout={onLogout}
        onSwitchPortal={onSwitchPortal}
        userZone={currentZone}
      />

      {/* Referent Navigation Tabs */}
      <ReferentNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
        activeRencontreResponsesCount={RencontreService.getActiveRencontreResponsesCount()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'rencontres' && (
          <RencontresView
            userRole="referent"
            currentUser={currentUser}
            members={zoneMembers}
            onShowToast={showToast}
            onOpenPublicSurvey={() => {
              onSwitchPortal('rencontre');
            }}
            onSelectMember={(m) => setSelectedMember(m)}
          />
        )}

        {activeTab === 'dashboard' && (
          <ReferentDashboardView
            currentUser={currentUser}
            zoneMembers={zoneMembers}
            zoneReports={zoneReports}
            currentZone={currentZone}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectReport={(report) => setSelectedReport(report)}
          />
        )}

        {activeTab === 'zone' && (
          <ReferentZoneView
            currentZone={currentZone}
            zoneMembers={zoneMembers}
            customZones={customZones}
          />
        )}

        {activeTab === 'members' && (
          <ReferentMembersView
            members={zoneMembers}
            currentZone={currentZone}
            onSelectMember={(member) => setSelectedMember(member)}
          />
        )}

        {activeTab === 'new_report' && (
          <NouveauReportingView
            currentUser={currentUser}
            currentZone={currentZone}
            onSubmitReport={handleCreateReport}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'my_reports' && (
          <MesRemonteesView
            reports={zoneReports}
            currentZone={currentZone}
            onSelectReport={(report) => setSelectedReport(report)}
            onNewReportClick={() => setActiveTab('new_report')}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsView
            userRole="referent"
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <ReferentProfileView
            currentUser={currentUser}
            currentZone={currentZone}
            zoneMembersCount={zoneMembers.length}
          />
        )}
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={!!selectedReport}
          userRole={currentUser?.role || 'referent'}
          currentUserName={currentUser?.nom}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={(id, status, notes) => {
            const updated = reports.map(r => r.id === id ? { ...r, status, bureauNotes: notes } : r);
            onUpdateReports(updated);
            setSelectedReport(updated.find(r => r.id === id) || null);
          }}
          onAddResponse={handleAddResponse}
        />
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          userRole={currentUser?.role || 'referent'}
        />
      )}
    </div>
  );
};

export default AppReferent;
