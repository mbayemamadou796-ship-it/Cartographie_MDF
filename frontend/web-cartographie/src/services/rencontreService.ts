import { Rencontre, RencontreResponse, RencontreParticipation, RencontreDureePresence, Member } from '@shared/types';
import { ApiService } from './apiService';

export const LOCAL_STORAGE_RENCONTRES_KEY = 'mbok_de_france_rencontres_v1';
export const LOCAL_STORAGE_RESPONSES_KEY = 'mbok_de_france_rencontre_responses_v1';

export const INITIAL_RENCONTRES: Rencontre[] = [
  {
    id: 'rencontre-2026',
    nom: 'Rencontre MDF 2026',
    annee: 2026,
    description: "Grande rencontre annuelle nationale des membres et sympathisants de l'association Mbok de France (MDF). Un moment privilégié de fraternité, d'échanges, d'ateliers et de partage.",
    messageAccueil: `السلام عليكم ورحمة الله وبركاته

Nous avons le plaisir de vous annoncer que la rencontre MDF 2026 se tiendra du 25 au 27 décembre à Toulouse.

Afin de bien préparer l'événement, nous vous invitons à répondre à ce formulaire.

Votre réponse nous permettra d'organiser au mieux la rencontre et d'anticiper les besoins logistiques.`,
    dateDebut: '2026-12-25',
    dateFin: '2026-12-27',
    dateAffichage: 'Du 25 au 27 décembre 2026',
    lieu: 'Toulouse',
    adresse: '424 Montgay, 31560 Nailloux, Toulouse',
    dateLimite: '2026-11-30',
    dateLimiteAffichage: '30 novembre 2026',
    statut: 'SONDAGE_OUVERT',
    isDefault: true,
    bureauNotes: "Objectif de 150 participants. Coordination logistique avec l'antenne Occitanie et les référents régionaux.",
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'rencontre-2025',
    nom: 'Rencontre MDF 2025',
    annee: 2025,
    description: 'Rencontre annuelle MDF 2025 organisée à Rennes (Bretagne). Bilan moral, assemblée générale et ateliers de cohésion.',
    messageAccueil: 'Rencontre annuelle tenue avec succès à Rennes du 26 au 28 décembre 2025.',
    dateDebut: '2025-12-26',
    dateFin: '2025-12-28',
    dateAffichage: 'Du 26 au 28 décembre 2025',
    lieu: 'Rennes',
    adresse: 'Espace Associatif & Culturel, 35000 Rennes',
    dateLimite: '2025-11-30',
    dateLimiteAffichage: '30 novembre 2025',
    statut: 'TERMINEE',
    isDefault: false,
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-12-29T18:00:00Z'
  }
];

export const INITIAL_RESPONSES: RencontreResponse[] = [
  {
    id: 'resp-001',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-001',
    nom: 'Diallo',
    prenom: 'Aïssatou',
    email: 'aissatou.diallo@mdf-france.org',
    telephone: '01 48 20 12 34',
    zone: 'Île-de-France',
    referentName: 'Aïssatou Diallo',
    ville: 'Saint-Denis',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Accueil', 'Logistique'],
    autrePrecision: '',
    remarques: "Je coordonnerai le groupe Île-de-France pour le départ groupé en train/covoiturage.",
    dateReponse: '2026-08-10T14:22:00Z',
    createdAt: '2026-08-10T14:22:00Z'
  },
  {
    id: 'resp-002',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-002',
    nom: 'Martin',
    prenom: 'Camille',
    email: 'camille.martin@mdf-france.org',
    telephone: '01 40 25 80 00',
    zone: 'Île-de-France',
    referentName: 'Aïssatou Diallo',
    ville: 'Paris',
    participation: 'OUI',
    dureePresence: 'WEEK_END',
    aideOrganisation: true,
    domainesAide: ['Accueil', 'Autre'],
    autrePrecision: 'Assistance médicale de premiers secours si besoin',
    remarques: 'Présente samedi matin à dimanche fin d’après-midi.',
    dateReponse: '2026-08-11T09:15:00Z',
    createdAt: '2026-08-11T09:15:00Z'
  },
  {
    id: 'resp-003',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-010',
    nom: 'Mbaye',
    prenom: 'Modou',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '02 99 12 34 56',
    zone: 'Bretagne',
    referentName: 'Modou Mbaye',
    ville: 'Rennes',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Logistique', 'Transport', 'Installation / rangement'],
    autrePrecision: '',
    remarques: 'Départ en minibus depuis Rennes avec 8 places disponibles.',
    dateReponse: '2026-08-12T11:45:00Z',
    createdAt: '2026-08-12T11:45:00Z'
  },
  {
    id: 'resp-004',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-003',
    nom: 'Benali',
    prenom: 'Karim',
    email: 'karim.benali@mdf-france.org',
    telephone: '04 91 23 45 67',
    zone: "Provence-Alpes-Côte d'Azur",
    referentName: 'Bureau Central',
    ville: 'Marseille',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Communication', 'Accueil'],
    autrePrecision: '',
    remarques: 'Disponible pour animer les ateliers thématiques et prises de vue photo.',
    dateReponse: '2026-08-13T16:10:00Z',
    createdAt: '2026-08-13T16:10:00Z'
  },
  {
    id: 'resp-005',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-005',
    nom: 'Traoré',
    prenom: 'Fatou',
    email: 'fatou.traore@mdf-france.org',
    telephone: '05 61 22 33 44',
    zone: 'Occitanie',
    referentName: 'Bureau Central',
    ville: 'Toulouse',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Cuisine / repas', 'Installation / rangement', 'Accueil'],
    autrePrecision: 'Coordination locale sur Nailloux / Toulouse',
    remarques: 'Sur place à Toulouse, disponible dès la veille pour préparer la salle.',
    dateReponse: '2026-08-14T08:30:00Z',
    createdAt: '2026-08-14T08:30:00Z'
  },
  {
    id: 'resp-006',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-006',
    nom: 'Bernard',
    prenom: 'Julien',
    email: 'julien.bernard@mdf-france.org',
    telephone: '03 20 55 66 77',
    zone: 'Hauts-de-France',
    referentName: 'Bureau Central',
    ville: 'Lille',
    participation: 'OUI',
    dureePresence: 'WEEK_END',
    aideOrganisation: false,
    remarques: 'Arrivée samedi 9h en TGV.',
    dateReponse: '2026-08-15T18:00:00Z',
    createdAt: '2026-08-15T18:00:00Z'
  },
  {
    id: 'resp-007',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-004',
    nom: 'Nguyen',
    prenom: 'Thi Minh',
    email: 'thi.nguyen@mdf-france.org',
    telephone: '04 72 34 56 78',
    zone: 'Auvergne-Rhône-Alpes',
    referentName: 'Bureau Central',
    ville: 'Lyon',
    participation: 'INCERTAIN',
    aideOrganisation: false,
    remarques: 'En attente de confirmation de mon planning de garde professionnelle.',
    dateReponse: '2026-08-16T12:20:00Z',
    createdAt: '2026-08-16T12:20:00Z'
  },
  {
    id: 'resp-008',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-007',
    nom: 'Kone',
    prenom: 'Moussa',
    email: 'moussa.kone@mdf-france.org',
    telephone: '03 88 11 22 33',
    zone: 'Grand Est',
    referentName: 'Bureau Central',
    ville: 'Strasbourg',
    participation: 'NON',
    aideOrganisation: false,
    remarques: 'Malheureusement en voyage familial à cette période.',
    dateReponse: '2026-08-17T19:40:00Z',
    createdAt: '2026-08-17T19:40:00Z'
  },
  {
    id: 'resp-009',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-011',
    nom: 'Sow',
    prenom: 'Abdoulaye',
    email: 'abdoulaye.sow@mdf-france.org',
    telephone: '06 12 34 56 78',
    zone: 'Île-de-France',
    referentName: 'Aïssatou Diallo',
    ville: 'Montreuil',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Logistique', 'Cuisine / repas'],
    autrePrecision: '',
    remarques: 'Prêt à aider pour la restauration.',
    dateReponse: '2026-08-18T10:05:00Z',
    createdAt: '2026-08-18T10:05:00Z'
  },
  {
    id: 'resp-010',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-012',
    nom: 'Camara',
    prenom: 'Mariama',
    email: 'mariama.camara@mdf-france.org',
    telephone: '07 89 01 23 45',
    zone: 'Île-de-France',
    referentName: 'Aïssatou Diallo',
    ville: 'Créteil',
    participation: 'OUI',
    dureePresence: 'WEEK_END',
    aideOrganisation: true,
    domainesAide: ['Accueil', 'Communication'],
    autrePrecision: '',
    remarques: 'Je peux tenir le stand d’accueil et distribuer les badges.',
    dateReponse: '2026-08-19T15:30:00Z',
    createdAt: '2026-08-19T15:30:00Z'
  },
  {
    id: 'resp-011',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-013',
    nom: 'Diouf',
    prenom: 'Cheikh',
    email: 'cheikh.diouf@mdf-france.org',
    telephone: '06 55 44 33 22',
    zone: 'Occitanie',
    referentName: 'Bureau Central',
    ville: 'Montpellier',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Transport', 'Logistique'],
    autrePrecision: 'Covoiturage depuis Montpellier',
    remarques: '3 places disponibles dans ma voiture au départ de Montpellier.',
    dateReponse: '2026-08-20T17:15:00Z',
    createdAt: '2026-08-20T17:15:00Z'
  },
  {
    id: 'resp-012',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-014',
    nom: 'Ba',
    prenom: 'Ousmane',
    email: 'ousmane.ba@mdf-france.org',
    telephone: '06 77 88 99 00',
    zone: 'Bretagne',
    referentName: 'Modou Mbaye',
    ville: 'Brest',
    participation: 'OUI',
    dureePresence: 'TROIS_JOURS',
    aideOrganisation: true,
    domainesAide: ['Transport', 'Installation / rangement'],
    remarques: 'Je voyage avec l’équipe Bretagne.',
    dateReponse: '2026-08-21T11:00:00Z',
    createdAt: '2026-08-21T11:00:00Z'
  },
  {
    id: 'resp-013',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-015',
    nom: 'Gueye',
    prenom: 'Ibrahima',
    email: 'ibrahima.gueye@mdf-france.org',
    telephone: '06 22 11 00 33',
    zone: 'Nouvelle-Aquitaine',
    referentName: 'Bureau Central',
    ville: 'Bordeaux',
    participation: 'OUI',
    dureePresence: 'WEEK_END',
    aideOrganisation: false,
    remarques: 'Présent avec grand plaisir !',
    dateReponse: '2026-08-22T14:40:00Z',
    createdAt: '2026-08-22T14:40:00Z'
  },
  {
    id: 'resp-014',
    rencontreId: 'rencontre-2026',
    memberId: 'mdf-016',
    nom: 'Fall',
    prenom: 'Aminata',
    email: 'aminata.fall@mdf-france.org',
    telephone: '07 11 22 33 44',
    zone: 'Île-de-France',
    referentName: 'Aïssatou Diallo',
    ville: 'Cergy',
    participation: 'INCERTAIN',
    aideOrganisation: false,
    remarques: 'Validation en cours avec mon employeur.',
    dateReponse: '2026-08-23T09:20:00Z',
    createdAt: '2026-08-23T09:20:00Z'
  }
];

// Channel for cross-tab and cross-iframe sync
const SYNC_CHANNEL_NAME = 'mdf_rencontres_sync_v1';
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {
  // Graceful fallback
}

export class RencontreService {
  /**
   * Helper unifié pour synchroniser en temps réel n'importe quelle vue
   */
  static subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleSync = () => {
      try {
        callback();
      } catch (err) {
        console.error('Error in Rencontre sync callback:', err);
      }
    };

    window.addEventListener('mdf_rencontres_updated', handleSync);
    window.addEventListener('mdf_rencontre_responses_updated', handleSync);
    window.addEventListener('storage', handleSync);

    if (syncChannel) {
      syncChannel.onmessage = handleSync;
    }

    return () => {
      window.removeEventListener('mdf_rencontres_updated', handleSync);
      window.removeEventListener('mdf_rencontre_responses_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }

  /**
   * Émet les événements de synchronisation locaux et distants
   */
  private static notifySync(type: 'rencontres' | 'responses'): void {
    if (typeof window === 'undefined') return;
    try {
      if (type === 'rencontres') {
        window.dispatchEvent(new CustomEvent('mdf_rencontres_updated'));
      } else {
        window.dispatchEvent(new CustomEvent('mdf_rencontre_responses_updated'));
      }

      if (syncChannel) {
        syncChannel.postMessage({ type, timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Sync notification warning:', e);
    }
  }

  /**
   * Récupère la liste de toutes les rencontres
   */
  static getRencontres(): Rencontre[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RENCONTRES_KEY);
      if (saved) {
        const list: Rencontre[] = JSON.parse(saved);
        // Ensure rencontre-2026 has the latest official intro text
        const r2026 = list.find(r => r.id === 'rencontre-2026');
        if (r2026 && (!r2026.messageAccueil || r2026.messageAccueil.includes('Assalamou'))) {
          r2026.messageAccueil = INITIAL_RENCONTRES[0].messageAccueil;
          this.saveRencontres(list);
        }
        return list;
      }
    } catch (e) {
      console.error('Erreur lecture rencontres:', e);
    }
    this.saveRencontres(INITIAL_RENCONTRES);
    return INITIAL_RENCONTRES;
  }

  /**
   * Sauvegarde la liste des rencontres
   */
  static saveRencontres(rencontres: Rencontre[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_RENCONTRES_KEY, JSON.stringify(rencontres));
      this.notifySync('rencontres');
    } catch (e) {
      console.error('Erreur sauvegarde rencontres:', e);
    }
    // Synchronisation Supabase (bureau : session requise, no-op sinon)
    ApiService.syncRencontres(rencontres);
  }

  /**
   * Récupère la rencontre active par défaut (ex: Rencontre 2026)
   */
  static getActiveRencontre(): Rencontre {
    const list = this.getRencontres();
    const active = list.find(r => r.isDefault && r.statut === 'SONDAGE_OUVERT') 
      || list.find(r => r.statut === 'SONDAGE_OUVERT')
      || list.find(r => r.annee === 2026)
      || list[0];
    return active || INITIAL_RENCONTRES[0];
  }

  /**
   * Récupère une rencontre par son identifiant
   */
  static getRencontreById(id: string): Rencontre | undefined {
    return this.getRencontres().find(r => r.id === id);
  }

  /**
   * Crée ou met à jour une rencontre
   */
  static saveRencontre(rencontre: Rencontre): Rencontre[] {
    const list = this.getRencontres();
    const index = list.findIndex(r => r.id === rencontre.id);
    let updated: Rencontre[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...rencontre, updatedAt: new Date().toISOString() };
    } else {
      updated = [rencontre, ...list];
    }

    if (rencontre.isDefault) {
      updated = updated.map(r => r.id === rencontre.id ? r : { ...r, isDefault: false });
    }

    this.saveRencontres(updated);
    return updated;
  }

  /**
   * Supprime une rencontre
   */
  static deleteRencontre(id: string): Rencontre[] {
    const list = this.getRencontres().filter(r => r.id !== id);
    this.saveRencontres(list);
    if (ApiService.hasSession()) ApiService.deleteRencontre(id);
    return list;
  }

  /**
   * Récupère les réponses à un sondage
   */
  static getResponses(rencontreId?: string): RencontreResponse[] {
    try {
      // La vérité partagée est Supabase : le cache local démarre VIDE —
      // aucune réponse de démonstration n'est injectée.
      const saved = localStorage.getItem(LOCAL_STORAGE_RESPONSES_KEY);
      const responses: RencontreResponse[] = saved ? JSON.parse(saved) : [];
      if (rencontreId) {
        return responses.filter(r => r.rencontreId === rencontreId);
      }
      return responses;
    } catch (e) {
      console.error('Erreur lecture réponses:', e);
      return [];
    }
  }

  /**
   * Sauvegarde les réponses
   */
  static saveResponses(responses: RencontreResponse[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_RESPONSES_KEY, JSON.stringify(responses));
      this.notifySync('responses');
    } catch (e) {
      console.error('Erreur sauvegarde réponses:', e);
    }
    // Synchronisation Supabase (bureau : session requise, no-op sinon)
    ApiService.syncRencontreResponses(responses);
  }

  /**
   * Vérifie si un membre a déjà répondu (Prévention des doublons)
   */
  static checkExistingResponse(rencontreId: string, memberId?: string, email?: string, telephone?: string): RencontreResponse | null {
    const responses = this.getResponses(rencontreId);
    
    // 1. Check by memberId if present
    if (memberId) {
      const found = responses.find(r => r.memberId === memberId);
      if (found) return found;
    }

    // 2. Check by cleaned email
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const found = responses.find(r => r.email && r.email.trim().toLowerCase() === cleanEmail);
      if (found) return found;
    }

    // 3. Check by cleaned telephone
    if (telephone && telephone.trim()) {
      const cleanTel = telephone.replace(/\s+/g, '');
      const found = responses.find(r => r.telephone && r.telephone.replace(/\s+/g, '') === cleanTel);
      if (found) return found;
    }

    return null;
  }

  /**
   * Enregistre une nouvelle réponse ou met à jour une réponse existante
   * Retourne un objet de résultat avec validation anti-doublon
   */
  static submitResponse(response: Omit<RencontreResponse, 'id' | 'createdAt' | 'dateReponse'> & { id?: string }): { success: boolean; isDuplicate?: boolean; response?: RencontreResponse; error?: string } {
    const responses = this.getResponses();

    // Check duplicate if no specific id to edit
    if (!response.id) {
      const existing = this.checkExistingResponse(response.rencontreId, response.memberId, response.email, response.telephone);
      if (existing) {
        return {
          success: false,
          isDuplicate: true,
          response: existing,
          error: `Vous avez déjà répondu au sondage de cette rencontre le ${new Date(existing.dateReponse).toLocaleDateString('fr-FR')}.`
        };
      }
    }

    const now = new Date().toISOString();
    let savedRecord: RencontreResponse;

    if (response.id) {
      // Update existing
      const index = responses.findIndex(r => r.id === response.id);
      if (index >= 0) {
        savedRecord = {
          ...responses[index],
          ...response,
          updatedAt: now
        } as RencontreResponse;
        responses[index] = savedRecord;
      } else {
        savedRecord = {
          ...response,
          id: response.id,
          createdAt: now,
          dateReponse: now
        } as RencontreResponse;
        responses.unshift(savedRecord);
      }
    } else {
      // Create new
      savedRecord = {
        ...response,
        id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        dateReponse: now
      } as RencontreResponse;
      responses.unshift(savedRecord);
    }

    this.saveResponses(responses);
    // Application publique (aucune session bureau) : la réponse part vers le
    // backend via l'endpoint public — le serveur re-vérifie l'anti-doublon.
    if (!ApiService.hasSession()) {
      ApiService.submitPublicRencontreResponse(savedRecord);
    }
    return { success: true, response: savedRecord };
  }

  /**
   * Rafraîchit rencontres + réponses depuis le serveur (bureau).
   * Fusion par updatedAt : un changement local récent (statut, notes...) n'est
   * jamais écrasé par une réponse serveur partie avant lui — la version la
   * plus récente gagne, et la synchronisation re-poussera le local au serveur.
   */
  static async refreshFromServer(): Promise<void> {
    const [serverRencontres, serverResponses] = await Promise.all([
      ApiService.fetchRencontres(),
      ApiService.fetchRencontreResponses()
    ]);

    if (serverRencontres) {
      const local = this.getRencontres();
      const merged = serverRencontres.map((sr) => {
        const lr = local.find((l) => l.id === sr.id);
        return lr && (lr.updatedAt || '') > (sr.updatedAt || '') ? lr : sr;
      });
      const extraLocal = local.filter((l) => !serverRencontres.some((sr) => sr.id === l.id));
      this.saveRencontres([...extraLocal, ...merged]);
    }

    if (serverResponses) {
      const local = this.getResponses();
      const merged = serverResponses.map((sr) => {
        const lr = local.find((l) => l.id === sr.id);
        return lr && (lr.updatedAt || '') > (sr.updatedAt || '') ? lr : sr;
      });
      const extraLocal = local.filter((l) => !serverResponses.some((sr) => sr.id === l.id));
      this.saveResponses([...extraLocal, ...merged]);
    }
  }

  /**
   * Rafraîchit les rencontres pour l'application PUBLIQUE web-rencontre :
   * un visiteur n'a pas le localStorage du bureau — le serveur fait foi
   * (sans les notes internes, filtrées côté API).
   */
  static async refreshPublicRencontres(): Promise<void> {
    const serverRencontres = await ApiService.fetchPublicRencontres();
    if (serverRencontres && serverRencontres.length > 0) {
      this.saveRencontres(serverRencontres);
    }
  }

  /**
   * Supprime une réponse
   */
  static deleteResponse(id: string): RencontreResponse[] {
    const list = this.getResponses().filter(r => r.id !== id);
    this.saveResponses(list);
    if (ApiService.hasSession()) ApiService.deleteRencontreResponse(id);
    return list;
  }

  /**
   * Nombre de réponses pour la rencontre active
   */
  static getActiveRencontreResponsesCount(): number {
    const active = this.getActiveRencontre();
    if (!active) return 0;
    return this.getResponses(active.id).length;
  }

  /**
   * Calcule les indicateurs statistiques pour une rencontre
   */
  static getRencontreStats(rencontreId: string) {
    const responses = this.getResponses(rencontreId);
    const total = responses.length;

    const ouiList = responses.filter(r => r.participation === 'OUI');
    const nonList = responses.filter(r => r.participation === 'NON');
    const incertainList = responses.filter(r => r.participation === 'INCERTAIN');

    const ouiCount = ouiList.length;
    const nonCount = nonList.length;
    const incertainCount = incertainList.length;

    const troisJoursCount = ouiList.filter(r => r.dureePresence === 'TROIS_JOURS').length;
    const weekendCount = ouiList.filter(r => r.dureePresence === 'WEEK_END').length;

    const aideVolontaires = responses.filter(r => r.aideOrganisation);
    const aideCount = aideVolontaires.length;

    // Répartition par zone
    const zoneMap: Record<string, { total: number; participants: number; aide: number }> = {};
    responses.forEach(r => {
      const z = r.zone || 'Non renseignée';
      if (!zoneMap[z]) {
        zoneMap[z] = { total: 0, participants: 0, aide: 0 };
      }
      zoneMap[z].total += 1;
      if (r.participation === 'OUI') {
        zoneMap[z].participants += 1;
      }
      if (r.aideOrganisation) {
        zoneMap[z].aide += 1;
      }
    });

    const zoneStats = Object.entries(zoneMap)
      .map(([zone, data]) => ({ zone, ...data }))
      .sort((a, b) => b.participants - a.participants);

    // Répartition par référent
    const referentMap: Record<string, { referent: string; zone: string; participants: number; aide: number }> = {};
    responses.forEach(r => {
      const ref = r.referentName || 'Bureau MDF';
      if (!referentMap[ref]) {
        referentMap[ref] = { referent: ref, zone: r.zone || '', participants: 0, aide: 0 };
      }
      if (r.participation === 'OUI') {
        referentMap[ref].participants += 1;
      }
      if (r.aideOrganisation) {
        referentMap[ref].aide += 1;
      }
    });

    const referentStats = Object.values(referentMap).sort((a, b) => b.participants - a.participants);

    // Répartition par domaine d'aide
    const domaineMap: Record<string, RencontreResponse[]> = {
      'Logistique': [],
      'Transport': [],
      'Installation / rangement': [],
      'Cuisine / repas': [],
      'Accueil': [],
      'Communication': [],
      'Autre': []
    };

    aideVolontaires.forEach(r => {
      if (r.domainesAide && r.domainesAide.length > 0) {
        r.domainesAide.forEach(dom => {
          if (domaineMap[dom]) {
            domaineMap[dom].push(r);
          } else {
            domaineMap[dom] = [r];
          }
        });
      } else if (r.autrePrecision) {
        domaineMap['Autre'].push(r);
      }
    });

    return {
      total,
      ouiCount,
      nonCount,
      incertainCount,
      troisJoursCount,
      weekendCount,
      aideCount,
      participationRate: total > 0 ? Math.round((ouiCount / total) * 100) : 0,
      aideRate: total > 0 ? Math.round((aideCount / total) * 100) : 0,
      zoneStats,
      referentStats,
      domaineMap
    };
  }
}
