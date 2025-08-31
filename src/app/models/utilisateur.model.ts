// src/app/models/utilisateur.ts

export type Role = 'client' | 'transporteur' | 'admin';
export type Statut = 'actif' | 'inactif' | 'banni';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;     // 'YYYY-MM-DD'
  email: string;
  mot_de_passe?: string;       // souvent non renvoyé par l'API -> en option
  telephone?: string;
  role?: Role;
  adresse?: string;

  image?: string | null;       // <-- nouveau champ (URL/chemin ou null)

  statut?: Statut;
  date_creation?: string;      // ISO 8601
}
