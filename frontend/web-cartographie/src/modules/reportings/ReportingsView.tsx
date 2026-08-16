import React, { useState } from 'react';
import { WeeklyReport, AppUser, CustomZone, UserRole, ReportingStatus, Member } from '@shared/types';
import { ReferentReportingForm } from './ReferentReportingForm';
import { AdminReportingView } from './AdminReportingView';
import { ReportDetailModal } from './ReportDetailModal';
import { Calendar, LayoutDashboard, Send, ArrowLeft } from 'lucide-react';

interface ReportingsViewProps {
  reports: WeeklyReport[];
  currentUser: AppUser | null;
  customZones: CustomZone[];
  members?: Member[];
  userRole: UserRole;
  onSubmitReport: (reportData: Omit<WeeklyReport, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus, bureauNotes?: string) => void;
  onDeleteReport: (reportId: string) => void;
}

export const ReportingsView: React.FC<ReportingsViewProps> = ({
  reports,
  currentUser,
  customZones,
  members = [],
  userRole,
  onSubmitReport,
  onUpdateStatus,
  onDeleteReport
}) => {
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'form'>('dashboard');

  // Filter reports submitted by current referent or belonging to their zone
  const myReports = React.useMemo(() => {
    if (!currentUser) return reports;

    // Direct match by ID, Email, Name, or Zone
    const matched = reports.filter((r) => {
      if (r.referentId && currentUser.id && r.referentId === currentUser.id) return true;
      if (currentUser.email && r.email && r.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser.name && r.referentName && r.referentName.toLowerCase() === currentUser.name.toLowerCase()) return true;
      if (currentUser.region && r.zone && r.zone.toLowerCase() === currentUser.region.toLowerCase()) return true;
      if (currentUser.assignedZoneIds && currentUser.assignedZoneIds.length > 0) {
        const zoneObj = customZones.find((z) => currentUser.assignedZoneIds?.includes(z.id));
        if (zoneObj && r.zone && r.zone.toLowerCase() === zoneObj.name.toLowerCase()) return true;
      }
      return false;
    });

    // If no direct match, return all reports for their territory or all reports if admin
    return matched.length > 0 ? matched : reports;
  }, [reports, currentUser, customZones]);

  const handleOpenReportDetail = (report: WeeklyReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  // Keep selectedReport in sync with real-time updates
  React.useEffect(() => {
    if (selectedReport) {
      const fresh = reports.find((r) => r.id === selectedReport.id);
      if (fresh) {
        setSelectedReport(fresh);
      }
    }
  }, [reports]);

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      
      {/* If Admin wants to switch to Referent Form for manual input/testing */}
      {userRole === 'admin' && adminViewMode === 'form' && (
        <div className="flex items-center justify-between bg-emerald-100/60 p-3.5 px-5 rounded-2xl border border-emerald-300">
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Mode saisie reporting (Vue Référent de zone)
          </span>
          <button
            onClick={() => setAdminViewMode('dashboard')}
            className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au tableau de bord des remontées</span>
          </button>
        </div>
      )}

      {/* Render depending on role and mode */}
      {userRole === 'referent' || (userRole === 'admin' && adminViewMode === 'form') ? (
        <ReferentReportingForm
          currentUser={currentUser}
          customZones={customZones}
          members={members}
          myReports={myReports}
          onSubmitReport={(data) => {
            onSubmitReport(data);
            if (userRole === 'admin') {
              setAdminViewMode('dashboard');
            }
          }}
          onOpenReportDetail={handleOpenReportDetail}
        />
      ) : (
        <AdminReportingView
          reports={reports}
          customZones={customZones}
          members={members}
          userRole={userRole}
          onOpenReportDetail={handleOpenReportDetail}
          onUpdateStatus={onUpdateStatus}
          onDeleteReport={onDeleteReport}
          onOpenNewReportForm={() => setAdminViewMode('form')}
        />
      )}

      {/* Detail & Response Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={isDetailModalOpen}
        userRole={userRole}
        currentUserName={currentUser?.name}
        onClose={handleCloseDetail}
        onUpdateStatus={(id, status, notes) => {
          onUpdateStatus(id, status, notes);
          if (selectedReport && selectedReport.id === id) {
            setSelectedReport({
              ...selectedReport,
              status,
              bureauNotes: notes !== undefined ? notes : selectedReport.bureauNotes
            });
          }
        }}
        onDelete={(id) => {
          onDeleteReport(id);
          handleCloseDetail();
        }}
      />

    </div>
  );
};
