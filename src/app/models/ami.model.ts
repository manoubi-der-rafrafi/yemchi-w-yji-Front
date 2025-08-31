import { Utilisateur } from './utilisateur.model';

export type StatutAmi = 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE'; // adapte si tu renvoies en minuscules

export interface Ami {
  id?: number;
  utilisateur_demandeur?: Utilisateur; // si ton backend renvoie l’objet Utilisateur
  utilisateur_recepteur?: Utilisateur; // idem
  // OU, si tu préfères juste les IDs depuis le back, utilise plutôt:
  // utilisateur_demandeur_id?: number;
  // utilisateur_recepteur_id?: number;

  statut?: StatutAmi;
  cree_le?: string; // ISO string
  maj_le?: string;  // ISO string
}
