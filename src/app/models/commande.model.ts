import { Utilisateur } from "./utilisateur.model";

// src/app/models/commande.model.ts
export interface Commande {
  id: number;
  localisation_depart: string;
  destination: string;
  date_debut: string | null;   // format ISO (ex: "2025-08-10T12:30:00")
  date_fin: string | null;
  date_demande: string;        // générée automatiquement
  statut: 'annulee' | 'en_attente' | 'en_cours' | 'livree' | 'confirmer';
  prix: number;
  mode_paiement: 'carte' | 'cash' | 'en_ligne';
  instructions: string | null;
  id_client:  { id: number } | Utilisateur;
  id_transporteur: number | null;
}
