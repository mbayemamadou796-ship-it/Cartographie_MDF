import { DemandeMember } from '../types';
import { ApiService } from './apiService';

const DEMANDES_STORAGE_KEY = 'mbok_de_france_demandes_v1';

/**
 * Demandes d'adhésion / mise à jour.
 *
 * Même philosophie que le reste de l'application : le localStorage est le
 * cache local (affichage instantané, mode offline), le backend Supabase est
 * la vérité partagée entre appareils :
 * - submitDemande (formulaire public, non authentifié) écrit le cache puis
 *   pousse vers POST /api/public/demandes en arrière-plan ;
 * - l'espace bureau synchronise l'état via ApiService.syncDemandes /
 *   fetchDemandes (voir App.tsx).
 */
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
    // Envoi vers le backend en arrière-plan : l'expérience du formulaire
    // public reste identique même si l'API est momentanément indisponible.
    ApiService.submitPublicDemande(newDemande);
    return newDemande;
  }

  /** Vrai si une demande EN_ATTENTE avec le même e-mail ou téléphone existe déjà localement. */
  static hasPendingLocalDemande(email: string, telephone: string): boolean {
    const normEmail = (email || '').trim().toLowerCase();
    const normTel = (telephone || '').replace(/\s/g, '');
    return this.getDemandes().some(
      (d) =>
        d.status === 'EN_ATTENTE' &&
        ((normEmail && (d.email || '').trim().toLowerCase() === normEmail) ||
          (normTel && (d.telephone || '').replace(/\s/g, '') === normTel))
    );
  }

  /**
   * Soumission avec vérification anti-doublon : refuse si une demande est déjà
   * en attente pour le même e-mail/téléphone (cache local ou serveur — 409).
   * Hors ligne, la demande est conservée localement ('offline').
   */
  static async submitDemandeVerified(
    demandeData: Omit<DemandeMember, 'id' | 'status' | 'createdAt'>
  ): Promise<{ status: 'ok' | 'duplicate' | 'offline'; demande: DemandeMember | null }> {
    if (this.hasPendingLocalDemande(demandeData.email, demandeData.telephone)) {
      return { status: 'duplicate', demande: null };
    }

    const newDemande: DemandeMember = {
      ...demandeData,
      id: `dem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'EN_ATTENTE',
      createdAt: new Date().toISOString()
    };

    const result = await ApiService.submitPublicDemande(newDemande);
    if (result.duplicate) {
      return { status: 'duplicate', demande: null };
    }

    const existing = this.getDemandes();
    existing.unshift(result.demande ?? newDemande);
    this.saveDemandes(existing);
    return { status: result.ok ? 'ok' : 'offline', demande: result.demande ?? newDemande };
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
