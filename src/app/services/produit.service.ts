// src/app/services/produit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/produit.model';
// import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  // Si vous avez un environment: private apiUrl = `${environment.apiUrl}/produits`;
  private apiUrl = 'http://192.168.168.241:8081/api/produits';

  constructor(private http: HttpClient) {}

  /** Récupérer tous les produits */
  getAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  /** Récupérer un produit par ID (objet unique) */
  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  /** Récupérer les produits d'une commande (FK id_commande) */
  getByCommande(idCommande: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/commande/${idCommande}`);
    // Si votre backend préfère un query param:
    // const params = new HttpParams().set('id_commande', idCommande);
    // return this.http.get<Produit[]>(this.apiUrl, { params });
  }

  /** Création d'un produit */
  create(payload: Partial<Produit> | FormData): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, payload);
  }


  /** Mise à jour d'un produit */
  update(id: number, payload: Partial<Produit>): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, payload);
  }

  /** Suppression d'un produit */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** (Optionnel) Recherche par nom/type */
  search(options: { nom?: string; type?: string }): Observable<Produit[]> {
    let params = new HttpParams();
    if (options.nom)  params = params.set('nom', options.nom);
    if (options.type) params = params.set('type', options.type);
    return this.http.get<Produit[]>(`${this.apiUrl}/search`, { params });
  }

 
uploadProduitImage(file: File) {
  const fd = new FormData();
  fd.append('image', file);
  return this.http.post<{ success: boolean; url?: string; message: string }>(
    'http://192.168.168.241:8081/api/produits/upload',
    fd
  );
}
  
}
