// src/app/services/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande.model';
// import { environment } from '../../environments/environment'; // si tu utilises environment

@Injectable({ providedIn: 'root' })
export class CommandeService {
  // Si tu as environment: private apiUrl = `${environment.apiUrl}/commandes`;
  private apiUrl = 'http://192.168.168.241:8081/api/commandes';

  constructor(private http: HttpClient) {}

  /** Récupérer TOUTES les commandes */
  getAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}`);
  }

  /** Récupérer une commande par ID (objet unique) */
  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  /** Récupérer la commande EN COURS d’un client (objet unique, pas tableau) */
  getCommandeEnCoursByClient(userId: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/client/${userId}/en_cours`);
  }

  /** Récupérer les commandes d’un client (liste) */
  getByClient(clientId: number): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/client/${clientId}`);
  }

  /** Récupérer les commandes d’un transporteur (liste) */
  getByTransporteur(transporteurId: number): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/transporteur/${transporteurId}`);
  }

  /** Créer une commande */
  create(payload: Partial<Commande>): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, payload);
  }

  /** Mettre à jour une commande */
  update(id: number, payload: Partial<Commande>): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}`, payload);
  }

  /** Supprimer une commande */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
