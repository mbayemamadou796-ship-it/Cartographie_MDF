import { DemandeMember } from '../types';

const DEMANDES_STORAGE_KEY = 'mbok_de_france_demandes_v1';

export class DemandeService {
  static getDemandes(): DemandeMember[] {
    try {
      const data = localStorage.getItem(DEMANDES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erreur lors de la lecture des demandes", e);
      return [];
    }
  }

  static saveDemandes(demandes: DemandeMember[]): void {
    try {
      localStorage.setItem(DEMANDES_STORAGE_KEY, JSON.stringify(demandes));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mbok_demandes_updated', { detail: demandes }));
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde des demandes", e);
    }
  }

  static submitDemande(demandeData: Omit<DemandeMember, 'id' | 'status' | 'createdAt'>): DemandeMember {
    const existing = this.getDemandes();
    const newDemande: DemandeMember = {
      ...demandeData,
      id: `dem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'EN_ATTENTE',
      createdAt: new Date().toISOString()
    };
    existing.unshift(newDemande);
    this.saveDemandes(existing);
    return newDemande;
  }

  static updateDemandeStatus(id: string, status: 'VALIDEE' | 'REFUSEE', validatedBy?: string, rejectionReason?: string): DemandeMember[] {
    const demandes = this.getDemandes();
    const index = demandes.findIndex(d => d.id === id);
    if (index !== -1) {
      demandes[index].status = status;
      demandes[index].updatedAt = new Date().toISOString();
      if (status === 'VALIDEE') {
        demandes[index].validatedAt = new Date().toISOString();
        demandes[index].validatedBy = validatedBy || 'Administrateur MDF';
      } else if (status === 'REFUSEE') {
        demandes[index].rejectionReason = rejectionReason || 'Information incomplète ou non conforme.';
      }
      this.saveDemandes(demandes);
    }
    return demandes;
  }
}
