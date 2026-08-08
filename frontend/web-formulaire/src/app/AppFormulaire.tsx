import React from 'react';
import { FormulaireMemberView } from '../components/FormulaireMemberView';

interface AppFormulaireProps {
  onSwitchToBureau?: () => void;
  logoUrl?: string;
}

export const AppFormulaire: React.FC<AppFormulaireProps> = ({ onSwitchToBureau, logoUrl }) => {
  return (
    <FormulaireMemberView onSwitchToBureau={onSwitchToBureau} logoUrl={logoUrl} />
  );
};

export default AppFormulaire;

