import React, { useState } from 'react';
import { Member, WeeklyReport, CustomZone, AppUser, AppSettings, AuditLog, ReportingStatus } from '@shared/types';
import { AdminHeader } from '../components/AdminHeader';
import { AdminNavigation, AdminActiveTab } from '../components/AdminNavigation';
import { AdminOverviewDashboard } from '../modules/dashboard/AdminOverviewDashboard';
import { AdminRemonteesListView } from '../modules/remontees/AdminRemonteesListView';
import { AdminSuiviCasView } from '../modules/cas/AdminSuiviCasView';
import { PilotageDashboardView } from '../../../web-cartographie/src/modules/reportings/PilotageDashboardView';
import { UserManagementView } from '../../../web-cartographie/src/components/UserManagementView';
import { AuditLogsView } from '../../../web-cartographie/src/components/AuditLogsView';
import { SettingsView } from '../../../web-cartographie/src/components/SettingsView';
import { ReportDetailModal } from '../../../web-cartographie/src/modules/reportings/ReportDetailModal';
import { ReportingService } from '../../../web-cartographie/src/services/reportingService';

interface AppAdminProps {
  currentUser: AppUser | null;
  members: Member[];
  customZones: CustomZone[];
  reports: WeeklyReport[];
  appSettings: AppSettings;
  users: AppUser[];
  auditLogs: AuditLog[];
  onUpdateReports: (reports: WeeklyReport[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateUsers: (users: AppUser[]) => void;
  onAddAuditLog: (log: { category: string; action: string; details: string }) => void;
  onLogout: () => void;
  onSwitchPortal: (portal: 'cartographie' | 'referent' | 'admin' | 'formulaire') => void;
}

export const AppAdmin: React.FC<AppAdminProps> = ({
  currentUser,
  members,
  customZones,
  reports,
  appSettings,
  users,
  auditLogs,
  onUpdateReports,
  onUpdateSettings,
  onUpdateUsers,
  onAddAuditLog,
  onLogout,
  onSwitchPortal
}) => {
  const [activeTab, setActiveTab] = useState<AdminActiveTab>('dashboard');
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  const urgentCount = reports.filter(r => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;
  const enAttenteCount = reports.filter(r => r.status === 'NOUVEAU').length;

  const handleUpdateStatus = (reportId: string, status: ReportingStatus, bureauNotes?: string) => {
    const updated = ReportingService.updateReportStatus(reportId, status, bureauNotes, reports);
    onUpdateReports(updated);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(updated.find(r => r.id === reportId) || null);
    }
    onAddAuditLog({
      category: 'data',
      action: `Mise à jour statut dossier ${reportId}`,
      details: `Nouveau statut: ${status}`
    });
  };

  const handleAssignResponsable = (reportId: string, responsableId: string, responsableName: string) => {
    const updated = ReportingService.assignResponsable(reportId, responsableId, responsableName, reports);
    onUpdateReports(updated);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(updated.find(r => r.id === reportId) || null);
    }
    onAddAuditLog({
      category: 'data',
      action: `Assignation responsable dossier ${reportId}`,
      details: `Responsable: ${responsableName}`
    });
  };

  const handleAddResponse = (reportId: string, content: string, newStatus?: ReportingStatus) => {
    const updated = ReportingService.addResponse(
      reportId,
      {
        authorName: currentUser?.nom || 'Bureau National MDF',
        authorRole: 'bureau',
        content
      },
      reports
    );
    onUpdateReports(updated);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(updated.find(r => r.id === reportId) || null);
    }
    onAddAuditLog({
      category: 'data',
      action: `Réponse Bureau sur dossier ${reportId}`,
      details: content.slice(0, 50) + '...'
    });
  };

  const handleDeleteReport = (reportId: string) => {
    const updated = reports.filter(r => r.id !== reportId);
    onUpdateReports(updated);
    setSelectedReport(null);
    onAddAuditLog({
      category: 'data',
      action: `Suppression dossier ${reportId}`,
      details: 'Suppression définitive effectuée par le Bureau'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Admin Header */}
      <AdminHeader
        currentUser={currentUser}
        onLogout={onLogout}
        onSwitchPortal={onSwitchPortal}
      />

      {/* Admin Navigation Tabs */}
      <AdminNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        urgentCount={urgentCount}
        enAttenteCount={enAttenteCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <AdminOverviewDashboard
            reports={reports}
            members={members}
            customZones={customZones}
            users={users}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectReport={(report) => setSelectedReport(report)}
          />
        )}

        {activeTab === 'remontees' && (
          <AdminRemonteesListView
            reports={reports}
            customZones={customZones}
            onSelectReport={(report) => setSelectedReport(report)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'cas' && (
          <AdminSuiviCasView
            reports={reports}
            users={users}
            onSelectReport={(report) => setSelectedReport(report)}
            onAssignResponsable={handleAssignResponsable}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'pilotage' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <PilotageDashboardView
              reports={reports}
              members={members}
              customZones={customZones}
              onSelectReport={(report) => setSelectedReport(report)}
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <UserManagementView
              users={users}
              currentUserRole={currentUser?.role || 'admin'}
              customZones={customZones}
              onAddUser={(newUser) => {
                const updated = [...users, { ...newUser, id: `usr-${Date.now()}` }];
                onUpdateUsers(updated);
              }}
              onUpdateUser={(updatedUser) => {
                const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
                onUpdateUsers(updated);
              }}
              onDeleteUser={(userId) => {
                const updated = users.filter(u => u.id !== userId);
                onUpdateUsers(updated);
              }}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <AuditLogsView logs={auditLogs} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <SettingsView
              settings={appSettings}
              onSave={onUpdateSettings}
              onReset={() => {}}
            />
          </div>
        )}
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={!!selectedReport}
          userRole={currentUser?.role || 'admin'}
          currentUserName={currentUser?.nom}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteReport}
          onAddResponse={handleAddResponse}
        />
      )}
    </div>
  );
};

export default AppAdmin;
