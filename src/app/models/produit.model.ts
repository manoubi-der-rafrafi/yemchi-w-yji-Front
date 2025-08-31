// Modèle TypeScript pour la table 'produit'
export interface Produit {
  id: number;

  nom: string | null;
  type: string | null;

  // décimaux (5,2) / (6,2) côté TS -> number
  largeur: number | null;
  profondeur: number | null;
  hauteur: number | null;
  poids: number | null;

  quantite: number | null;

  facade: string | null;
  description: string | null;

  image1: string | null;
  image2: string | null;
  image3: string | null;
  prix: number | null;
  // clé étrangère vers commande
  commande?: { id: number };
}
