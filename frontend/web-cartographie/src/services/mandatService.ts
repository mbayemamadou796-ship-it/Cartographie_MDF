import { Mandat, MandatRealisation, MandatDocument, MandatBilan, MandatStatus, RealisationStatus } from '../types';
import { ApiService } from './apiService';

const MANDATS_STORAGE_KEY = 'mbok_de_france_mandats_v1';

export const INITIAL_MANDATS: Mandat[] = [
  {
    id: 'mandat-2026-2028',
    intitule: 'Mandat 2026 — 2028',
    dateDebut: '2026-01-01',
    dateFin: '2028-12-31',
    description: 'Mandat axé sur la structuration territoriale, le déploiement de la plateforme numérique et le renforcement des pôles d\'entraide économique et professionnelle pour la diaspora.',
    responsables: [
      'Mamadou Mbaye (Président)',
      'Amina Diop (Secrétaire Générale)',
      'Ousmane Traoré (Trésorier National)',
      'Fatou Ndiaye (Responsable Solidarité & Intégration)'
    ],
    statut: 'EN_COURS',
    realisations: [
      {
        id: 'real-2026-01',
        mandatId: 'mandat-2026-2028',
        titre: 'Lancement du Portail Cartographique & Annuaire Connecté',
        description: 'Mise en ligne de la nouvelle infrastructure de cartographie interactive avec géolocalisation des membres et pilotage des zones territoriales.',
        date: '2026-02-15',
        categorie: 'PROJETS_NUMERIQUES',
        responsable: 'Mamadou Mbaye',
        statut: 'TERMINE',
        indicateurs: 'Plus de 350 membres cartographiés et 12 référents territoriaux équipés.',
        createdAt: '2026-01-10T10:00:00.000Z',
        documents: [
          {
            id: 'doc-real-01',
            name: 'Spécifications_Fonctionnelles_Plateforme_MDF.pdf',
            category: 'PROJET',
            size: 1450000,
            type: 'application/pdf',
            dateAjout: '2026-01-15'
          }
        ]
      },
      {
        id: 'real-2026-02',
        mandatId: 'mandat-2026-2028',
        titre: 'Tournée Régionale d\'installation des 12 Référents Territoriaux',
        description: 'Rencontres dans les 12 grandes régions de France pour formaliser les relais locaux, former les référents et distribuer les kits d\'accueil.',
        date: '2026-04-20',
        categorie: 'ORGANISATION',
        responsable: 'Amina Diop',
        statut: 'EN_COURS',
        indicateurs: '7 régions visitées sur 12 au 1er semestre.',
        createdAt: '2026-01-20T10:00:00.000Z',
        documents: [
          {
            id: 'doc-real-02',
            name: 'Feuille_De_Route_Tournee_Regionale_2026.pdf',
            category: 'FEUILLE_DE_ROUTE',
            size: 890000,
            type: 'application/pdf',
            dateAjout: '2026-01-22'
          }
        ]
      },
      {
        id: 'real-2026-03',
        mandatId: 'mandat-2026-2028',
        titre: 'Mise en place du Fonds Solidarité Nouveaux Arrivants & Étudiants',
        description: 'Création d\'un guichet d\'orientation d\'urgence et constitution d\'une réserve solidaire pour les primo-arrivants.',
        date: '2026-06-10',
        categorie: 'ACTIONS_SOCIALES',
        responsable: 'Fatou Ndiaye',
        statut: 'EN_COURS',
        indicateurs: 'Convention signée avec 3 partenaires associatifs.',
        createdAt: '2026-02-01T10:00:00.000Z',
        documents: []
      },
      {
        id: 'real-2026-04',
        mandatId: 'mandat-2026-2028',
        titre: 'Grande Conférence Annuelle de l\'Entraide Diaspora (Paris)',
        description: 'Organisation du rassemblement national annuel des cadres, entrepreneurs et étudiants de la communauté.',
        date: '2026-11-14',
        categorie: 'EVENEMENTS',
        responsable: 'Ousmane Traoré',
        statut: 'A_FAIRE',
        indicateurs: 'Objectif : 400 participants et 15 tables rondes.',
        createdAt: '2026-02-10T10:00:00.000Z',
        documents: []
      }
    ],
    documents: [
      {
        id: 'doc-m-01',
        name: 'PV_Assemblee_Generale_Elective_Mandat_2026_2028.pdf',
        category: 'PROCES_VERBAL',
        size: 1200000,
        type: 'application/pdf',
        dateAjout: '2026-01-05',
        description: 'Procès-verbal de l\'AG élective du 05 janvier 2026 portant élection du Bureau National.'
      },
      {
        id: 'doc-m-02',
        name: 'Plan_Strategique_MDF_2026_2028.pdf',
        category: 'FEUILLE_DE_ROUTE',
        size: 2800000,
        type: 'application/pdf',
        dateAjout: '2026-01-12',
        description: 'Feuille de route quinquennale et priorités d\'actions de l\'association.'
      },
      {
        id: 'doc-m-03',
        name: 'Budget_Previsionnel_National_2026.pdf',
        category: 'RAPPORT',
        size: 650000,
        type: 'application/pdf',
        dateAjout: '2026-01-20',
        description: 'Budget prévisionnel voté en conseil d\'administration.'
      }
    ],
    bilan: {
      objectifsInitiaux: '• Couvrir l\'intégralité des 12 régions métropolitaines avec un référent actif.\n• Digitaliser la gestion des adhésions et le reporting territorial.\n• Doubler le nombre de membres accompagnés lors de leur première année en France.',
      objectifsRealises: '• Plateforme numérique opérationnelle et adoptée.\n• Déploiement actif des 12 référents avec espace dédié et remontées hebdomadaires.',
      objectifsNonRealises: '• Finalisation du partenariat avec les universités régionales encore en négociation.',
      principalesRealisations: '• Structuration des pôles régionaux.\n• Numérisation complète des flux d\'inscription et validation.',
      difficultes: '• Hétérogénéité des temps de réponse selon les zones d\'affluence.',
      resultats: '• 350+ membres enregistrés\n• 12 zones autonomes\n• Taux de satisfaction de 94%',
      recommandationsSuivant: '• Poursuivre l\'automatisation des relances de cotisations et développer une application mobile compagnon.',
      dateBilan: '2026-08-15',
      redigePar: 'Bureau Exécutif National'
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'mandat-2024-2026',
    intitule: 'Mandat 2024 — 2026',
    dateDebut: '2024-01-01',
    dateFin: '2025-12-31',
    description: 'Mandat de consolidation post-création, structuration des statuts juridiques, déploiement des premières antennes locales et création du réseau d\'entraide universitaire.',
    responsables: [
      'Abdoulaye Kane (Président sortant)',
      'Mariama Diallo (Secrétaire Générale)',
      'Cheikh Seck (Trésorier)'
    ],
    statut: 'ARCHIVE',
    realisations: [
      {
        id: 'real-2024-01',
        mandatId: 'mandat-2024-2026',
        titre: 'Refonte des Statuts & Règlement Intérieur v2.0',
        description: 'Mise en conformité juridique de l\'association loi 1901 et clarification des modalités d\'adhésion.',
        date: '2024-03-18',
        categorie: 'ORGANISATION',
        responsable: 'Abdoulaye Kane',
        statut: 'ARCHIVE',
        indicateurs: 'Adopté à 98% des voix en AG Extraordinaire.',
        createdAt: '2024-02-01T10:00:00.000Z',
        documents: [
          {
            id: 'doc-real-old-1',
            name: 'Statuts_Adoptes_AGE_2024.pdf',
            category: 'PROCES_VERBAL',
            size: 1100000,
            type: 'application/pdf',
            dateAjout: '2024-03-20'
          }
        ]
      },
      {
        id: 'real-2024-02',
        mandatId: 'mandat-2024-2026',
        titre: 'Création du Livret d\'Accueil du Nouvel Adhérent',
        description: 'Édition et distribution de 500 exemplaires du guide pratique pour accompagner les primo-arrivants dans leurs démarches.',
        date: '2024-09-01',
        categorie: 'VIE_ASSOCIATIVE',
        responsable: 'Mariama Diallo',
        statut: 'ARCHIVE',
        indicateurs: '500 livrets distribués lors de la rentrée universitaire.',
        createdAt: '2024-06-15T10:00:00.000Z',
        documents: []
      },
      {
        id: 'real-2024-03',
        mandatId: 'mandat-2024-2026',
        titre: 'Partenariat Logement & Hébergement Temporaire',
        description: 'Signature d\'un accord avec 3 résidences étudiantes pour le dépannage d\'urgence en début d\'année.',
        date: '2025-05-12',
        categorie: 'PARTENARIATS',
        responsable: 'Cheikh Seck',
        statut: 'ARCHIVE',
        indicateurs: '42 étudiants relogés en urgence.',
        createdAt: '2025-01-10T10:00:00.000Z',
        documents: []
      }
    ],
    documents: [
      {
        id: 'doc-m-old-01',
        name: 'Rapport_Moral_Et_Financier_Mandat_2024_2026.pdf',
        category: 'RAPPORT',
        size: 3400000,
        type: 'application/pdf',
        dateAjout: '2025-12-28',
        description: 'Bilan d\'activité exhaustif présenté lors de l\'Assemblée Générale de fin de mandat.'
      },
      {
        id: 'doc-m-old-02',
        name: 'Bilan_Financier_Certifie_2024_2025.pdf',
        category: 'BILAN',
        size: 980000,
        type: 'application/pdf',
        dateAjout: '2025-12-30',
        description: 'Comptes de résultats et bilan financier certifié par la commission aux comptes.'
      }
    ],
    bilan: {
      objectifsInitiaux: '• Structurer juridiquement l\'association.\n• Établir les premières antennes régionales (IDF, Auvergne-Rhône-Alpes, Bretagne).\n• Créer un livret d\'accueil standardisé.',
      objectifsRealises: '• Statuts mis à jour et validés en préfecture.\n• 3 antennes régionales pilotes opérationnelles.\n• 150 membres actifs réguliers.',
      objectifsNonRealises: '• Pas d\'outil informatique centralisé (gestion manuelle sous tableur Excel qui a montré ses limites).',
      principalesRealisations: '• Rédaction des livrets d\'accueil et signature des premiers partenariats de solidarité.',
      difficultes: '• Lourdeur de la gestion manuelle sur fichiers partagés et dispersion des données d\'adhésion.',
      resultats: '• Solde financier positif de 14 500 € transmis au mandat 2026-2028.\n• 42 situations d\'urgence résolues.',
      recommandationsSuivant: '• Impératif de développer une plateforme web sécurisée de cartographie et de gestion des membres.',
      dateBilan: '2025-12-31',
      redigePar: 'Abdoulaye Kane (Président sortant)'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2025-12-31T23:59:59.000Z'
  }
];

export class MandatService {
  static getMandats(): Mandat[] {
    try {
      const data = localStorage.getItem(MANDATS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erreur lecture mandats', e);
    }
    return INITIAL_MANDATS;
  }

  static saveMandats(mandats: Mandat[]): void {
    try {
      localStorage.setItem(MANDATS_STORAGE_KEY, JSON.stringify(mandats));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mbok_mandats_updated', { detail: mandats }));
      }
    } catch (e) {
      console.error('Erreur sauvegarde mandats', e);
    }
    // Synchronisation Supabase (session bureau requise, no-op sinon)
    ApiService.syncMandats(mandats);
  }

  static createMandat(data: Omit<Mandat, 'id' | 'createdAt' | 'realisations' | 'documents'>): Mandat {
    const mandats = this.getMandats();
    const newMandat: Mandat = {
      ...data,
      id: `mandat-${Date.now()}`,
      realisations: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mandats.unshift(newMandat);
    this.saveMandats(mandats);
    return newMandat;
  }

  static updateMandat(id: string, updates: Partial<Mandat>): Mandat[] {
    const mandats = this.getMandats();
    const idx = mandats.findIndex((m) => m.id === id);
    if (idx !== -1) {
      mandats[idx] = {
        ...mandats[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveMandats(mandats);
    }
    return mandats;
  }

  /**
   * Fusionne les mandats du serveur avec le cache local (par updatedAt : la
   * version la plus récente gagne ; un mandat local absent du serveur est
   * conservé — la synchronisation le re-poussera).
   */
  static mergeServerMandats(server: Mandat[]): void {
    const local = this.getMandats();
    const merged = server.map((sm) => {
      const lm = local.find((l) => l.id === sm.id);
      return lm && (lm.updatedAt || '') > (sm.updatedAt || '') ? lm : sm;
    });
    const extraLocal = local.filter((l) => !server.some((sm) => sm.id === l.id));
    this.saveMandats([...extraLocal, ...merged]);
  }

  /** Rafraîchit les mandats depuis le serveur (bureau, niveaux admin). */
  static async refreshFromServer(): Promise<void> {
    const server = await ApiService.fetchMandats();
    if (server) this.mergeServerMandats(server);
  }

  static deleteMandat(id: string): Mandat[] {
    const mandats = this.getMandats().filter((m) => m.id !== id);
    this.saveMandats(mandats);
    return mandats;
    if (ApiService.hasSession()) ApiService.deleteMandat(id);
  }

  // Realisations Sub-management
  static addRealisation(mandatId: string, realisation: Omit<MandatRealisation, 'id' | 'mandatId' | 'createdAt'>): Mandat[] {
    const mandats = this.getMandats();
    const idx = mandats.findIndex((m) => m.id === mandatId);
    if (idx !== -1) {
      const newReal: MandatRealisation = {
        ...realisation,
        id: `real-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        mandatId,
        documents: realisation.documents || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mandats[idx].realisations = [newReal, ...(mandats[idx].realisations || [])];
      mandats[idx].updatedAt = new Date().toISOString();
      this.saveMandats(mandats);
    }
    return mandats;
  }

  static updateRealisation(mandatId: string, realId: string, updates: Partial<MandatRealisation>): Mandat[] {
    const mandats = this.getMandats();
    const mIdx = mandats.findIndex((m) => m.id === mandatId);
    if (mIdx !== -1) {
      mandats[mIdx].realisations = (mandats[mIdx].realisations || []).map((r) => {
        if (r.id === realId) {
          return {
            ...r,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });
      mandats[mIdx].updatedAt = new Date().toISOString();
      this.saveMandats(mandats);
    }
    return mandats;
  }

  static deleteRealisation(mandatId: string, realId: string): Mandat[] {
    const mandats = this.getMandats();
    const mIdx = mandats.findIndex((m) => m.id === mandatId);
    if (mIdx !== -1) {
      mandats[mIdx].realisations = (mandats[mIdx].realisations || []).filter((r) => r.id !== realId);
      mandats[mIdx].updatedAt = new Date().toISOString();
      this.saveMandats(mandats);
    }
    return mandats;
  }

  // Documents linked to Mandat
  static addDocumentToMandat(mandatId: string, doc: Omit<MandatDocument, 'id' | 'dateAjout'>): Mandat[] {
    const mandats = this.getMandats();
    const mIdx = mandats.findIndex((m) => m.id === mandatId);
    if (mIdx !== -1) {
      const newDoc: MandatDocument = {
        ...doc,
        id: `doc-m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dateAjout: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      };
      mandats[mIdx].documents = [newDoc, ...(mandats[mIdx].documents || [])];
      mandats[mIdx].updatedAt = new Date().toISOString();
      this.saveMandats(mandats);
    }
    return mandats;
  }

  static deleteDocumentFromMandat(mandatId: string, docId: string): Mandat[] {
    const mandats = this.getMandats();
    const mIdx = mandats.findIndex((m) => m.id === mandatId);
    if (mIdx !== -1) {
      mandats[mIdx].documents = (mandats[mIdx].documents || []).filter((d) => d.id !== docId);
      mandats[mIdx].updatedAt = new Date().toISOString();
      this.saveMandats(mandats);
    }
    return mandats;
  }

  // Bilan saving
  static saveBilan(mandatId: string, bilan: MandatBilan): Mandat[] {
    const mandats = this.getMandats();
    const mIdx = mandats.findIndex((m) => m.id === mandatId);
    if (mIdx !== -1) {
      mandats[mIdx].bilan = {
        ...bilan,
        dateBilan: bilan.dateBilan || new Date().toISOString().split('T')[0]
      };
      mandats[mIdx].updatedAt = new Date().toISOString();
      this.saveMandats(mandats);
    }
    return mandats;
  }
}
