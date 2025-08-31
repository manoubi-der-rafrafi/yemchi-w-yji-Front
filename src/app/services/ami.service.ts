import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';
import { Ami } from '../models/ami.model';

@Injectable({ providedIn: 'root' })
export class AmiService {
  // mets l’URL de ton backend. Idéalement, lis ça depuis environment.ts
  private readonly baseUrl = 'http://localhost:8081/api/amis';

  constructor(private http: HttpClient) {}

  // GET /api/amis/{userId}/liste
  getAmis(userId: number): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.baseUrl}/${userId}/liste`);
  }

  // POST /api/amis/inviter
  inviter(payload: { utilisateur_demandeur: number; utilisateur_recepteur: number }): Observable<Ami> {
    return this.http.post<Ami>(`${this.baseUrl}/inviter`, payload);
  }

  // PUT /api/amis/accepter
  accepter(ami: Ami): Observable<Ami> {
    return this.http.put<Ami>(`${this.baseUrl}/accepter`, ami);
  }

  // PUT /api/amis/refuser
  refuser(ami: Ami): Observable<Ami> {
    return this.http.put<Ami>(`${this.baseUrl}/refuser`, ami);
  }
}
