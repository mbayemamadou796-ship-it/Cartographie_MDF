import { UsefulDocument, DocumentCategory, DocumentPublishStatus, DocumentVersion } from '../types';

const DOCUMENTS_STORAGE_KEY = 'mbok_de_france_useful_docs_v1';

export const INITIAL_DOCUMENTS: UsefulDocument[] = [
  // 1. Présentation de MDF
  {
    id: 'doc-pres-01',
    name: 'Plaquette Institutionnelle & Présentation MDF',
    description: 'Document officiel de présentation de l\'Association Mbok de France, son histoire, sa gouvernance, ses missions et son rayonnement.',
    category: 'PRESENTATION',
    fileName: 'MDF_Plaquette_Institutionnelle_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 2450000,
    version: '1.4',
    datePublication: '2026-01-15',
    dateMiseAJour: '2026-02-10',
    statut: 'PUBLIE',
    ordreAffichage: 1,
    authorName: 'Bureau National MDF',
    tags: ['Présentation', 'Institutionnel', 'MDF', 'Vision'],
    content: `# PLAQUETTE INSTITUTIONNELLE — MBOK DE FRANCE (MDF)
**Association Loi 1901 — Union, Fraternité, Solidarité & Développement**

---

### 1. HISTORIQUE & FONDATION
Fondée pour rassembler et soutenir la diaspora, les ressortissants et les sympathisants, **Mbok de France (MDF)** s'est imposée comme une référence de cohésion sociale, d'entraide agissante et de valorisation culturelle en France.

### 2. NOTRE MISSION & RAISON D'ÊTRE
- **Fédérer** les membres autour de valeurs universelles de fraternité et de dignité.
- **Accompagner** l'intégration harmonieuse des primo-arrivants, étudiants et familles en France.
- **Soutenir** les initiatives économiques, professionnelles et carrières de nos membres.
- **Rayonner** à travers la culture, le dialogue intergénérationnel et la transmission des savoirs.

### 3. GOUVERNANCE & ORGANISATION
L'association s'articule autour de trois organes majeurs :
1. **L'Assemblée Générale Souveraine** : Réunit l'ensemble des adhérents à jour de cotisation.
2. **Le Conseil d'Administration & Bureau National** : Organe exécutif veillant au déploiement des orientations stratégiques.
3. **Le Collège des Référents Territoriaux** : Relais locaux assurant l'écoute de terrain, les remontées hebdomadaires et l'animation des 9 zones géographiques.

### 4. MAILLAGE TERRITORIAL & CARTOGRAPHIE
Avec plus de 9 grandes régions d'implantation (Île-de-France, Rhône-Alpes, PACA, Hauts-de-France, Grand Est, Occitanie, Nouvelle-Aquitaine, Normandie, Bretagne/Pays de la Loire), MDF déploie une cartographie interactive permettant de localiser chaque antenne et référent en temps réel.

### 5. CONTACTS OFFICIELS
- **Siège social** : Paris, France
- **Contact Général** : contact@mbokdefrance.org
- **Assistance Urgence Solidarité** : urgence@mbokdefrance.org`,
    versionsHistorique: [
      {
        id: 'v-1.0',
        version: '1.0',
        date: '2024-01-10',
        notes: 'Version initiale de fondation',
        fileName: 'MDF_Plaquette_v1.0.pdf'
      },
      {
        id: 'v-1.4',
        version: '1.4',
        date: '2026-02-10',
        notes: 'Actualisation des axes 2026-2028 et intégration de la cartographie',
        fileName: 'MDF_Plaquette_Institutionnelle_2026.pdf'
      }
    ]
  },
  {
    id: 'doc-pres-02',
    name: 'Synthèse des Axes Stratégiques & Vision 2026-2028',
    description: 'Synthèse exécutive des 5 piliers d\'action : Accueil, Intégration, Emploi & Carrières, Culture, et Solidarité Territoriale.',
    category: 'PRESENTATION',
    fileName: 'MDF_Axes_Strategiques_2026_2028.pdf',
    fileType: 'application/pdf',
    fileSize: 1120000,
    version: '1.0',
    datePublication: '2026-01-20',
    dateMiseAJour: '2026-01-20',
    statut: 'PUBLIE',
    ordreAffichage: 2,
    authorName: 'Pôle Stratégie MDF',
    tags: ['Stratégie', 'Feuille de route', 'Objectifs'],
    content: `# FEUILLE DE ROUTE STRATÉGIQUE 2026 — 2028
**Plan d'Action National de l'Association Mbok de France**

---

### AXE 1 : ACCUEIL ET PARRAINAGE DES NOUVEAUX ARRIVANTS
- Mise en place d'un kit d'accueil dématérialisé pour chaque nouvel adhérent.
- Désignation systématique d'un parrain ou d'une marraine sous 7 jours ouvrés.
- Accompagnement aux premières démarches administratives (logement, CAF, CPAM, titre de séjour).

### AXE 2 : INSERTION PROFESSIONNELLE, EMPLOI & ENTREPRENEURIAT
- Création du réseau d'entraide professionnelle "MDF Talents".
- Ateliers CV, simulations d'entretiens et mentorat de carrière.
- Mise en valeur des entrepreneurs et professionnels indépendants de la communauté.

### AXE 3 : SOLIDARITÉ AGISSANTE & FONDS DE SECOURS D'URGENCE
- Disponibilité 7j/7 du guichet de médiation sociale d'urgence.
- Prise en charge des situations critiques (dépannage alimentaire, soutien d'urgence, assistance administrative).
- Reporting hebdomadaire obligatoire des référents territoriaux pour détection précoce des vulnérabilités.

### AXE 4 : CULTURE, JEUNESSE & DIALOGUE INTERGÉNÉRATIONNEL
- Organisation du Gala Annuel et des Rencontres Culturelles Régionales.
- Transmission linguistique, mémoire associative et valorisation des réussites académiques.

### AXE 5 : TRANSFORMATION DIGITALE & GOUVERNANCE TRANSPARENTE
- Cartographie numérique interactive des membres et des référents.
- Registre permanent des mandats, bilans d'activités et traçabilité des décisions.`
  },

  // 2. Documents officiels
  {
    id: 'doc-off-01',
    name: 'Statuts Officiels de l\'Association Mbok de France',
    description: 'Texte fondateur régissant l\'association loi 1901 déposé en préfecture, fixant l\'objet social, la composition du bureau et les assemblées.',
    category: 'OFFICIELS',
    fileName: 'MDF_Statuts_Officiels_v2.1.pdf',
    fileType: 'application/pdf',
    fileSize: 1850000,
    version: '2.1',
    datePublication: '2024-03-20',
    dateMiseAJour: '2026-01-10',
    statut: 'PUBLIE',
    ordreAffichage: 1,
    authorName: 'Secrétariat Général',
    tags: ['Statuts', 'Juridique', 'Loi 1901', 'Officiel'],
    content: `# STATUTS DE L'ASSOCIATION « MBOK DE FRANCE » (MDF)
**Association régie par la loi du 1er juillet 1901 et le décret du 16 août 1901**

---

### ARTICLE 1 — DÉNOMINATION
Il est fondé entre les adhérents aux présents statuts une association régie par la loi du 1er juillet 1901, ayant pour titre : **MBOK DE FRANCE (MDF)**.

### ARTICLE 2 — OBJET SOCIAL
L'association a pour objet :
1. De resserrer les liens de solidarité, d'entraide et de fraternité entre ses membres résidant en France ;
2. De faciliter l'accueil, l'orientation et l'intégration des personnes nouvellement installées ;
3. De promouvoir les échanges socio-culturels, éducatifs et professionnels ;
4. De mener des actions humanitaires et caritatives d'urgence en France et à l'international.

### ARTICLE 3 — SIÈGE SOCIAL
Le siège social est fixé en région parisienne (Île-de-France). Il pourra être transféré par simple décision du Conseil d'Administration.

### ARTICLE 4 — DURÉE
La durée de l'association est illimitée.

### ARTICLE 5 — COMPOSITION & ADHÉSION
L'association se compose de :
- Membres d'honneur ;
- Membres bienfaiteurs ;
- Membres actifs (adhérents à jour de leur cotisation annuelle).

Pour faire partie de l'association, il faut souscrire au bulletin d'adhésion, s'engager à respecter les statuts, le règlement intérieur et la charte éthique.

### ARTICLE 6 — LE BUREAU NATIONAL & LE CONSEIL D'ADMINISTRATION
L'association est administrée par un Conseil d'Administration élu en Assemblée Générale pour une durée de deux (2) ans.
Le Bureau exécutif comprend au minimum :
- Un(e) Président(e) ;
- Un(e) Secrétaire Général(e) ;
- Un(e) Trésorier(e) Général(e) ;
- Des Responsables de Pôles (Affaires Sociales, Communication, Coordination Territoriale).

### ARTICLE 7 — COLLÈGE DES RÉFÉRENTS TERRITORIAUX
L'association institue un Collège des Référents Territoriaux couvrant les zones géographiques métropolitaines. Les référents sont chargés de la coordination locale, du recensement et du reporting hebdomadaire.

### ARTICLE 8 — ASSEMBLÉES GÉNÉRALES
L'Assemblée Générale Ordinaire se réunit une fois par an. Elle approuve les rapports moral et financier et fixe les orientations générales.`,
    versionsHistorique: [
      {
        id: 'v-1.0',
        version: '1.0',
        date: '2022-02-14',
        notes: 'Statuts constitutifs initiaux',
        fileName: 'MDF_Statuts_v1.0.pdf'
      },
      {
        id: 'v-2.0',
        version: '2.0',
        date: '2024-03-20',
        notes: 'Mise en conformité lors de l\'AG Extraordinaire 2024',
        fileName: 'MDF_Statuts_v2.0.pdf'
      },
      {
        id: 'v-2.1',
        version: '2.1',
        date: '2026-01-10',
        notes: 'Intégration du Collège des Référents Territoriaux',
        fileName: 'MDF_Statuts_Officiels_v2.1.pdf'
      }
    ]
  },
  {
    id: 'doc-off-02',
    name: 'Règlement Intérieur National',
    description: 'Modalités de fonctionnement interne, droits et devoirs des adhérents, cotisations, règles de tenue des réunions régionales.',
    category: 'OFFICIELS',
    fileName: 'MDF_Reglement_Interieur_v2.1.pdf',
    fileType: 'application/pdf',
    fileSize: 950000,
    version: '2.1',
    datePublication: '2024-04-05',
    dateMiseAJour: '2026-01-15',
    statut: 'PUBLIE',
    ordreAffichage: 2,
    authorName: 'Secrétariat Général',
    tags: ['Règlement', 'Cotisations', 'Discipline', 'Organisation'],
    content: `# RÈGLEMENT INTÉRIEUR NATIONAL — MBOK DE FRANCE (MDF)
**Complément aux Statuts Officiels — Adopté en Assemblée Générale**

---

### SECTION 1 : COTISATIONS ET QUALITÉ DE MEMBRE
- **Montant de la cotisation annuelle** : Fixé à 30 € par an pour les membres réguliers, et 15 € pour les étudiants et demandeurs d'emploi.
- **Paiement** : Payable en début d'exercice associatif par virement bancaire, carte ou lors des permanences.
- La qualité de membre ouvre droit à l'accès au réseau d'entraide, à la cartographie, aux permanences et au vote en AG.

### SECTION 2 : DROITS ET DEVOIRS DES ADHÉRENTS
- Chaque membre s'engage à observer un comportement courtois, fraternel et bienveillant dans tous les canaux de communication physiques et virtuels de MDF.
- Les attaques personnelles, propos discriminatoires ou comportements diffamatoires entraînent la radiation immédiate après avis de la Commission de Discipline.

### SECTION 3 : DISPOSITIF DE REMONTÉES DES RÉFÉRENTS (REPORTING)
- Les Référents Territoriaux ont l'obligation d'alimenter l'espace reporting chaque semaine ou dès la survenance d'un cas nécessitant une intervention d'urgence.
- Tout cas d'urgence sociale (niveau 4 ou 5) fait l'objet d'une alerte prioritaire transmise au Bureau National sous 24h.

### SECTION 4 : CONFIDENTIALITÉ ET PROTECTION DES DONNÉES (RGPD)
- Les informations personnelles, coordonnées, adresses et situations financières des membres sont strictement confidentielles.
- L'utilisation des coordonnées du répertoire à des fins commerciales ou politiques tierces est rigoureusement interdite.`,
    versionsHistorique: [
      {
        id: 'v-2.0',
        version: '2.0',
        date: '2024-04-05',
        notes: 'Version adoptée en AG 2024'
      },
      {
        id: 'v-2.1',
        version: '2.1',
        date: '2026-01-15',
        notes: 'Précisions sur les modalités du reporting territorial des référents'
      }
    ]
  },
  {
    id: 'doc-off-03',
    name: 'Charte Éthique & Valeurs de l\'Entraide',
    description: 'Principes de neutralité, bienveillance, solidarité agissante et respect mutuel au sein de la communauté Mbok de France.',
    category: 'OFFICIELS',
    fileName: 'MDF_Charte_Ethique_Valeurs.pdf',
    fileType: 'application/pdf',
    fileSize: 640000,
    version: '1.2',
    datePublication: '2024-05-01',
    dateMiseAJour: '2025-09-10',
    statut: 'PUBLIE',
    ordreAffichage: 3,
    authorName: 'Commission Éthique',
    tags: ['Charte', 'Valeurs', 'Éthique'],
    content: `# CHARTE ÉTHIQUE & VALEURS DE L'ENTRAIDE — MDF

---

### NOS CINQ ENGAGEMENTS FONDAMENTAUX :

1. **FRATERNITÉ AGISSANTE** : Chaque membre est un frère, une sœur. L'écoute et le soutien mutuel priment en toute circonstance.
2. **NEUTRALITÉ POLITIQUE & CONFESSIONNELLE** : Mbok de France est un espace laïque et pluraliste dédié exclusivement à l'entraide sociale, à la solidarité et à la culture.
3. **TRANSPARENCE ET INTÉGRITÉ** : Toute gestion de fonds ou contribution financière fait l'objet d'un reçu officiel et d'une reddition de comptes rigoureuse.
4. **CONFIDENTIALITÉ ET DIGNITÉ HUMAINE** : Les situations de précarité ou d'urgence sont traitées avec la plus stricte discrétion et le respect absolu des personnes.
5. **ENGAGEMENT CITOYEN & ÉPANOUISSEMENT EN FRANCE** : Nous encourageons la réussite professionnelle, académique et l'engagement associatif constructif de nos membres dans la société française.`
  },

  // 3. Guide du nouvel adhérent
  {
    id: 'doc-guide-01',
    name: 'Livret d\'Accueil & Guide du Nouvel Adhérent',
    description: 'Le manuel complet indispensable remis à tout nouvel arrivant : démarches d\'arrivée, contacts clés, accompagnement territorial et vie de l\'association.',
    category: 'GUIDE_ADHERENT',
    fileName: 'MDF_Livret_Accueil_Nouvel_Adherent_v3.0.pdf',
    fileType: 'application/pdf',
    fileSize: 3200000,
    version: '3.0',
    datePublication: '2024-09-01',
    dateMiseAJour: '2026-01-25',
    statut: 'PUBLIE',
    ordreAffichage: 1,
    authorName: 'Pôle Accueil & Intégration',
    tags: ['Accueil', 'Nouveaux Adhérents', 'Livret', 'Guide', 'Essentiel'],
    content: `# LIVRET D'ACCUEIL DU NOUVEL ADHÉRENT — MDF
**Bienvenue dans la grande famille Mbok de France !**

---

### ÉTAPE 1 : PRISE DE CONTACT AVEC VOTRE RÉFÉRENT DE ZONE
Dès votre inscription validée, consultez la rubrique **Annuaire & Carte** ou contactez votre référent régional pour être accueilli dans votre antenne locale.

### ÉTAPE 2 : LES DÉMARCHES PRIORITAIRES À VOTRE ARRIVÉE
- **Logement** : Demande d'attestation d'hébergement, dossier caution Visale, démarches Action Logement.
- **Santé (CPAM)** : Ouverture des droits Assurance Maladie (formulaire S1106 / carte Vitale).
- **Aides au logement (CAF)** : Simulation et dépôt en ligne sur le portail caf.fr.
- **Séjour & Préfecture** : Dépôt de dossier de titre de séjour sur la plateforme nationale ANEF.

### ÉTAPE 3 : PARTICIPER AUX PERMANENCES & ATELIERS
- Réunions d'échanges mensuelles dans votre région.
- Ateliers CV, coaching insertion et parrainage d'études.
- Événements sportifs et culturels annuels.`,
    versionsHistorique: [
      {
        id: 'v-2.0',
        version: '2.0',
        date: '2024-09-01',
        notes: 'Version papier distribuée aux étudiants'
      },
      {
        id: 'v-3.0',
        version: '3.0',
        date: '2026-01-25',
        notes: 'Refonte complète avec QR code, liens vers la cartographie et contacts référents'
      }
    ]
  },
  {
    id: 'doc-guide-02',
    name: 'Fiche Mémo : Accompagnement & Parrainage Référent',
    description: 'Fiche méthodologique à destination du Référent pour structurer le premier contact et le suivi des 3 premiers mois du nouvel adhérent.',
    category: 'GUIDE_ADHERENT',
    fileName: 'MDF_Fiche_Memo_Parrainage_Referent.pdf',
    fileType: 'application/pdf',
    fileSize: 450000,
    version: '1.1',
    datePublication: '2025-10-12',
    dateMiseAJour: '2026-02-01',
    statut: 'PUBLIE',
    ordreAffichage: 2,
    authorName: 'Coordination des Référents',
    tags: ['Référents', 'Parrainage', 'Méthode', 'Onboarding'],
    content: `# GUIDE MÉTHODOLOGIQUE DU PARRAINAGE — RÉFÉRENT RÉGIONAL

---

### LES 3 RENDEZ-VOUS CLÉS DU SUIVI :

1. **J+7 (Premier contact téléphonique de bienvenue)** :
   - Présentation du référent et de l'antenne locale.
   - Vérification de l'état du logement et des besoins urgents.
   - Ajout au groupe WhatsApp / canal de communication local.

2. **M+1 (Bilan d'intégration & démarches administratives)** :
   - Point d'étape sur le compte bancaire, CAF, CPAM et titre de séjour.
   - Orientation vers les ateliers d'insertion ou de soutien linguistique.

3. **M+3 (Autonomie & engagement)** :
   - Évaluation de la stabilisation de la situation.
   - Proposition d'engagement comme bénévole actif au sein de l'association.`
  },

  // 4. Informations pratiques
  {
    id: 'doc-info-01',
    name: 'Annuaire des Permanences & Numéros d\'Urgence MDF',
    description: 'Coordonnées directes des responsables nationaux, des référents de chaque région, ainsi que les lignes de secours et d\'orientation.',
    category: 'INFOS_PRATIQUES',
    fileName: 'MDF_Annuaire_Permanences_Contacts_Utiles.pdf',
    fileType: 'application/pdf',
    fileSize: 580000,
    version: '2.0',
    datePublication: '2026-01-10',
    dateMiseAJour: '2026-02-18',
    statut: 'PUBLIE',
    ordreAffichage: 1,
    authorName: 'Bureau National',
    tags: ['Contacts', 'Permanences', 'Téléphones', 'Urgences'],
    content: `# ANNUAIRE DES PERMANENCES & LIGNES D'URGENCE MDF

---

### CONTACTS DU BUREAU NATIONAL :
- **Présidence MDF** : president@mbokdefrance.org | 01 42 XX XX 01
- **Secrétariat Général** : contact@mbokdefrance.org | 01 42 XX XX 02
- **Commission Solidarité & Urgences** : urgence@mbokdefrance.org | 06 59 XX XX 99

### LIGNES PUBLIQUES D'URGENCE EN FRANCE :
- **Samu (Urgences Médicales)** : 15
- **Police Secours** : 17
- **Sapeurs-Pompiers** : 18
- **Numéro d'Urgence Européen** : 112
- **Hébergement d'Urgence (SIAO)** : 115
- **Enfance en Danger** : 119`
  },
  {
    id: 'doc-info-02',
    name: 'Guide Pratique : Démarches Administratives & Titres de Séjour',
    description: 'Fiche d\'orientation pratique sur les démarches en préfecture, ANEF, CAF, CPAM, renouvellement de titre et accompagnement juridique partenaire.',
    category: 'INFOS_PRATIQUES',
    fileName: 'MDF_Guide_Demarches_Administratives_France.pdf',
    fileType: 'application/pdf',
    fileSize: 1650000,
    version: '1.5',
    datePublication: '2025-06-15',
    dateMiseAJour: '2026-01-30',
    statut: 'PUBLIE',
    ordreAffichage: 2,
    authorName: 'Cellule Juridique & Sociale',
    tags: ['Démarches', 'Préfecture', 'Séjour', 'CAF', 'CPAM'],
    content: `# GUIDE PRATIQUE DES DÉMARCHES ADMINISTRATIVES EN FRANCE

---

### 1. TITRES DE SÉJOUR & PLATEFORME ANEF
- Démarches entièrement dématérialisées sur : *administration-etrangers-en-france.interieur.gouv.fr*
- Dépôt de demande de renouvellement : à effectuer obligatoirement entre **2 à 4 mois** avant expiration du titre.
- Pièces maîtresses : Justificatif de domicile de moins de 3 mois, passeport en cours de validité, photos e-photo, justificatifs de ressources.

### 2. SÉCURITÉ SOCIALE (AMELI / CPAM)
- Inscription primo-arrivant sur : *etudiant-etranger.ameli.fr* ou dépôt formulaire S1106.
- Documents : Copie du titre de séjour/visa validé, acte de naissance légalisé/apostillé, RIB au nom de l'intéressé.

### 3. AIDE AU LOGEMENT (CAF)
- Demande d'APL en ligne sur *caf.fr*.
- Prérequis : Bail signé, quittance de loyer, attestation de loyer complétée par le bailleur.`
  },

  // 5. Formulaires & Modèles
  {
    id: 'doc-form-01',
    name: 'Formulaire d\'Adhésion Papier Officiel (À imprimer)',
    description: 'Fiche d\'inscription papier standardisée pour les rencontres présentielles et permanences lorsque le candidat ne dispose pas d\'accès web.',
    category: 'FORMULAIRES',
    fileName: 'MDF_Bulletin_Adhesion_Papier_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 320000,
    version: '2.0',
    datePublication: '2026-01-05',
    dateMiseAJour: '2026-01-05',
    statut: 'PUBLIE',
    ordreAffichage: 1,
    authorName: 'Secrétariat Général',
    tags: ['Formulaire', 'Adhésion', 'Papier', 'Inscription'],
    content: `# BULLETIN D'ADHÉSION OFFICIEL 2026 — MBOK DE FRANCE

---

### IDENTIFICATION DE L'ADHÉRENT(E)
- **Nom** : ___________________________
- **Prénom(s)** : ________________________
- **Date et lieu de naissance** : ___/___/______ à ___________________
- **Profession / Études** : ________________________________________

### COORDONNÉES EN FRANCE
- **Adresse postale** : _____________________________________________
- **Code Postal & Ville** : [ _______ ]  ____________________________
- **Téléphone portable** : _________________________________________
- **Courriel (Email)** : ___________________________________________
- **Région / Zone géographique MDF** : ______________________________

### COTISATION ANNUELLE
[ ] Membre régulier : 30 €
[ ] Étudiant / Demandeur d'emploi : 15 €
[ ] Membre bienfaiteur : Montant libre (____ €)

### ENGAGEMENT & SIGNATURE
Je déclare avoir pris connaissance des Statuts, du Règlement Intérieur et de la Charte Éthique de l'Association Mbok de France et m'engage à les respecter fidèlement.

Fait à : ___________________, le ___/___/2026
**Signature de l'adhérent(e)** :`
  },
  {
    id: 'doc-form-02',
    name: 'Modèle de Compte-Rendu de Réunion Régionale',
    description: 'Trame Word / PDF prête à l\'emploi pour rédiger les comptes rendus des réunions d\'antenne et rencontres territoriales.',
    category: 'FORMULAIRES',
    fileName: 'MDF_Trame_Compte_Rendu_Reunion_Locale.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 180000,
    version: '1.3',
    datePublication: '2025-04-10',
    dateMiseAJour: '2026-01-12',
    statut: 'PUBLIE',
    ordreAffichage: 2,
    authorName: 'Secrétariat Général',
    tags: ['Modèle', 'Compte-rendu', 'Trame', 'Référents'],
    content: `# MODÈLE TYPE — COMPTE RENDU DE RÉUNION RÉGIONALE MDF

---

**Antenne Régionale / Zone** : ________________________________
**Date et Horaires** : Le ___/___/2026 de ___h___ à ___h___
**Lieu de tenue** : __________________________________________
**Rédacteur du compte-rendu** : _______________________________

### 1. PARTICIPANTS
- **Présents** :
- **Excusés** :

### 2. ORDRE DU JOUR
1. Tour de table et accueil des nouveaux arrivants
2. Point d'avancement des actions locales
3. Remontées de cas sociaux ou d'urgence
4. Questions diverses et calendrier de la prochaine rencontre

### 3. SYNTHÈSE DES DISCUSSIONS ET DÉCISIONS
[Rédiger ici les points clés abordés et les décisions validées en séance]

### 4. ACTIONS À MENER & CALENDRIER
- Action 1 : Porteur : _____________ | Échéance : ___/___/2026
- Action 2 : Porteur : _____________ | Échéance : ___/___/2026`
  },
  {
    id: 'doc-form-03',
    name: 'Dossier de Demande d\'Aide Sociale & Secours d\'Urgence',
    description: 'Formulaire confidentiel de demande d\'intervention de la commission solidarité pour aide d\'urgence, caution ou dépannage ponctuel.',
    category: 'FORMULAIRES',
    fileName: 'MDF_Dossier_Demande_Aide_Solidarite.pdf',
    fileType: 'application/pdf',
    fileSize: 240000,
    version: '1.0',
    datePublication: '2025-11-20',
    dateMiseAJour: '2025-11-20',
    statut: 'PUBLIE',
    ordreAffichage: 3,
    authorName: 'Commission Solidarité',
    tags: ['Aide', 'Urgence', 'Solidarité', 'Formulaire'],
    content: `# DOSSIER DE DEMANDE D'AIDE SOCIALE D'URGENCE (CONFIDENTIEL)

---

### DEMANDEUR
- **Nom & Prénom** : _______________________________________
- **Zone géographique** : ___________________________________
- **Téléphone** : __________________________________________

### NATURE DU BESOIN D'URGENCE
[ ] Dépannage alimentaire d'urgence
[ ] Secours d'hébergement temporaire
[ ] Aide aux frais de santé non couverts
[ ] Assistance démarches préfecture / recours
[ ] Autre besoin urgent

### EXPOSÉ DE LA SITUATION
[Décrire brièvement le contexte, les démarches déjà engagées et le montant ou la nature exacte de l'aide sollicitée]

---
### AVIS DU RÉFÉRENT TERRITORIAL
- **Nom du Référent** : ____________________________________
- **Avis motivé** : [ ] Très Favorable  [ ] Favorable  [ ] Réservé
- **Observations** : ______________________________________`
  }
];

export class DocumentService {
  static getDocuments(): UsefulDocument[] {
    try {
      const data = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (data) {
        const parsed: UsefulDocument[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge missing content from INITIAL_DOCUMENTS if not present
          return parsed.map((d) => {
            const defaultMatch = INITIAL_DOCUMENTS.find((init) => init.id === d.id);
            if (defaultMatch && !d.content) {
              return { ...d, content: defaultMatch.content };
            }
            return d;
          });
        }
      }
    } catch (e) {
      console.error('Erreur lecture documents utiles', e);
    }
    return INITIAL_DOCUMENTS;
  }

  static saveDocuments(docs: UsefulDocument[]): void {
    try {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mbok_documents_updated', { detail: docs }));
      }
    } catch (e) {
      console.error('Erreur sauvegarde documents', e);
    }
  }

  static createDocument(docData: Omit<UsefulDocument, 'id' | 'datePublication' | 'dateMiseAJour'>): UsefulDocument {
    const docs = this.getDocuments();
    const today = new Date().toISOString().split('T')[0];
    const newDoc: UsefulDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      datePublication: today,
      dateMiseAJour: today,
      versionsHistorique: [
        {
          id: `v-${docData.version || '1.0'}`,
          version: docData.version || '1.0',
          date: today,
          notes: 'Version initiale publiée',
          fileName: docData.fileName,
          fileSize: docData.fileSize,
          authorName: docData.authorName || 'Administrateur MDF'
        }
      ]
    };
    docs.unshift(newDoc);
    this.saveDocuments(docs);
    return newDoc;
  }

  static updateDocument(id: string, updates: Partial<UsefulDocument>): UsefulDocument[] {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx !== -1) {
      const today = new Date().toISOString().split('T')[0];
      docs[idx] = {
        ...docs[idx],
        ...updates,
        dateMiseAJour: today
      };
      this.saveDocuments(docs);
    }
    return docs;
  }

  static replaceDocumentFile(
    id: string,
    fileData: { fileName: string; fileType: string; fileSize?: number; fileUrl?: string; newVersion: string; updateNotes?: string; authorName?: string; content?: string }
  ): UsefulDocument[] {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx !== -1) {
      const doc = docs[idx];
      const today = new Date().toISOString().split('T')[0];
      const newVersionLog: DocumentVersion = {
        id: `v-${fileData.newVersion}`,
        version: fileData.newVersion,
        date: today,
        notes: fileData.updateNotes || `Mise à jour du fichier (${fileData.fileName})`,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        authorName: fileData.authorName || 'Administrateur MDF',
        fileUrl: fileData.fileUrl
      };

      const versions = doc.versionsHistorique || [];
      if (!versions.some((v) => v.version === doc.version)) {
        versions.unshift({
          id: `v-${doc.version}`,
          version: doc.version,
          date: doc.dateMiseAJour || doc.datePublication,
          notes: 'Version antérieure archivée',
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          authorName: doc.authorName
        });
      }

      docs[idx] = {
        ...doc,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize || doc.fileSize,
        fileUrl: fileData.fileUrl || doc.fileUrl,
        version: fileData.newVersion,
        dateMiseAJour: today,
        content: fileData.content || doc.content,
        versionsHistorique: [newVersionLog, ...versions]
      };

      this.saveDocuments(docs);
    }
    return docs;
  }

  static deleteDocument(id: string): UsefulDocument[] {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    this.saveDocuments(docs);
    return docs;
  }

  static togglePublishStatus(id: string): UsefulDocument[] {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx !== -1) {
      const current = docs[idx].statut;
      docs[idx].statut = current === 'PUBLIE' ? 'BROUILLON' : 'PUBLIE';
      docs[idx].dateMiseAJour = new Date().toISOString().split('T')[0];
      this.saveDocuments(docs);
    }
    return docs;
  }

  static downloadDocument(doc: UsefulDocument): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const contentToDownload = doc.content || `=====================================================
ASSOCIATION MBOK DE FRANCE (MDF) - DOCUMENT OFFICIEL
=====================================================
Titre : ${doc.name}
Catégorie : ${doc.category}
Version : v${doc.version}
Date de publication : ${doc.datePublication}
Dernière mise à jour : ${doc.dateMiseAJour}
Auteur / Source : ${doc.authorName || 'Bureau National MDF'}
Nom du fichier d'origine : ${doc.fileName}
=====================================================

DESCRIPTION & INSTRUCTIONS :
${doc.description}

MOTS-CLÉS :
${(doc.tags || []).join(', ')}

=====================================================
CONTENU DU DOCUMENT :
=====================================================
Document officiel certifié par l'Association Mbok de France (MDF).`;

    const blob = new Blob([contentToDownload], { type: doc.fileType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.name.replace(/[^a-z0-9_-]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
