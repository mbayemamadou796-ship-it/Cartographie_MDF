import React from 'react';
import { ReportingPriority, ReportingType } from '@shared/types';
import { AlertTriangle, AlertCircle, CheckCircle2, Zap, FileText } from 'lucide-react';

interface PriorityBadgeProps {
  priority?: ReportingPriority;
  urgenceLevel?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  urgenceLevel,
  size = 'md',
  showLabel = true
}) => {
  // Resolve priority if not explicitly provided
  const resolvedPriority: ReportingPriority = priority || (
    urgenceLevel && urgenceLevel >= 4 ? 'URGENT' :
    urgenceLevel === 3 ? 'IMPORTANT' : 'NORMAL'
  );

  const config = {
    URGENT: {
      label: '🔴 Urgent',
      text: 'Urgent',
      subtext: urgenceLevel ? `Niveau ${urgenceLevel}/5` : 'Intervention requise',
      dotColor: 'bg-rose-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-800',
      borderColor: 'border-rose-300',
      ringColor: 'ring-rose-200/70',
      icon: AlertTriangle
    },
    IMPORTANT: {
      label: '🟠 Important',
      text: 'Important',
      subtext: urgenceLevel ? `Niveau ${urgenceLevel}/5` : 'À traiter rapidement',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
      ringColor: 'ring-amber-200/70',
      icon: AlertCircle
    },
    NORMAL: {
      label: '🟢 Normal',
      text: 'Normal',
      subtext: urgenceLevel ? `Niveau ${urgenceLevel}/5` : 'Routine',
      dotColor: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      ringColor: 'ring-emerald-200/70',
      icon: CheckCircle2
    }
  }[resolvedPriority];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl gap-2 font-bold'
  }[size];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center border font-semibold tracking-wide transition-all shadow-2xs ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} ${resolvedPriority === 'URGENT' ? 'animate-pulse' : ''}`} />
      <span>{showLabel ? config.label : config.text}</span>
    </span>
  );
};

interface ReportTypeBadgeProps {
  type?: ReportingType;
  size?: 'sm' | 'md';
}

export const ReportTypeBadge: React.FC<ReportTypeBadgeProps> = ({
  type = 'PERIODIQUE',
  size = 'md'
}) => {
  const isPonctuel = type === 'PONCTUEL';
  
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5 rounded-md gap-1' 
    : 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-bold';

  return isPonctuel ? (
    <span className={`inline-flex items-center bg-purple-50 text-purple-900 border border-purple-300 font-bold shadow-2xs ${sizeClasses}`}>
      <Zap className="w-3 h-3 text-purple-600 fill-purple-200" />
      <span>Remontée Ponctuelle</span>
    </span>
  ) : (
    <span className={`inline-flex items-center bg-blue-50 text-blue-900 border border-blue-200 font-medium ${sizeClasses}`}>
      <FileText className="w-3 h-3 text-blue-600" />
      <span>Reporting Périodique</span>
    </span>
  );
};
