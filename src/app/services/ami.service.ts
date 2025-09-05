import { Injectable } from '@angular/core';
import { HttpClient , HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';
import { Ami } from '../models/ami.model';

export type RelationStatus =
  | 'NONE'
  | 'PENDING_SENT'
  | 'PENDING_RECEIVED'
  | 'ACCEPTED'
  | 'REFUSED'
  | 'UNKNOWN';

export interface RelationStatusResponse {
  status: RelationStatus;
  invitationId?: number;
}
@Injectable({ providedIn: 'root' })
export class AmiService {
  // mets l’URL de ton backend. Idéalement, lis ça depuis environment.ts
  private readonly baseUrl = 'http://192.168.177.241:8081/api/amis';

  constructor(private http: HttpClient) {}

  // GET /api/amis/{userId}/liste
  getAmis(userId: number): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.baseUrl}/${userId}/liste`);
  }

 

  // PUT /api/amis/accepter
  accepter(ami: Ami): Observable<Ami> {
    return this.http.put<Ami>(`${this.baseUrl}/accepter`, ami);
  }

  // PUT /api/amis/refuser
  refuser(ami: Ami): Observable<Ami> {
    return this.http.put<Ami>(`${this.baseUrl}/refuser`, ami);
  }
  
  inviter(demandeurId: number, recepteurId: number): Observable<Ami> {
  const payload = {
    utilisateur_demandeur: demandeurId,
    utilisateur_recepteur: recepteurId
  };
  return this.http.post<Ami>(`${this.baseUrl}/inviter`, payload);
  
}
getStatus(u1: number, u2: number): Observable<RelationStatusResponse> {
    const params = new HttpParams()
      .set('u1', String(u1))
      .set('u2', String(u2));
    return this.http.get<RelationStatusResponse>(`${this.baseUrl}/status`, { params });
  }
  getReceivedInvitationSenders(userId: number): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(
      `${this.baseUrl}/invitations/recues/demandeurs?userId=${userId}`
    );
  }
  // ami.service.ts
accepterInvitationParUtilisateurs(demandeurId: number, recepteurId: number) {
  return this.http.put<any>(
    `${this.baseUrl}/accepter?demandeurId=${demandeurId}&recepteurId=${recepteurId}`,
    {}
  );
}

refuserInvitationParUtilisateurs(demandeurId: number, recepteurId: number) {
  return this.http.put<any>(
    `${this.baseUrl}/refuser?demandeurId=${demandeurId}&recepteurId=${recepteurId}`,
    {}
  );
}

}
