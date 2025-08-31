import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Utilisateur } from '../models/utilisateur.model'; // <-- adapte le chemin si besoin

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiLogin = 'http://192.168.168.241:8081/api/utilisateur/login';
  private apiRegister = 'http://192.168.168.241:8081/api/utilisateur/register';
  // (optionnel) endpoint pour récupérer l'utilisateur courant
  private apiMe = 'http://192.168.168.241:8081/api/utilisateur/me';
  private baseUrl = 'http://192.168.168.241:8081/api/utilisateur';
  // Etat de connexion
  private connectedSubject: BehaviorSubject<boolean>;
  public isConnected$: Observable<boolean>;

  // Flux utilisateur courant
  private userSubject = new BehaviorSubject<Utilisateur | null>(this.getStoredUser());
  public user$ = this.userSubject.asObservable();
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.connectedSubject = new BehaviorSubject<boolean>(this.hasToken());
    this.isConnected$ = this.connectedSubject.asObservable();
  }

  /** ---------- AUTH ---------- */

  login(credentials: any): Observable<any> {
  return this.http.post(this.apiLogin, credentials).pipe(
    tap((res: any) => {
      console.log('[Login] Réponse complète du backend =', res);

      // Si le backend renvoie directement l'utilisateur :
      const user = res as Utilisateur;

      // (Si tu ajoutes plus tard un token dans la réponse, gère-le ici)
      // const token = res?.token || null;
      // if (token) this.setToken(token);

      // Sauvegarder l'utilisateur dans localStorage
      this.setUser(user);
    })
  );
}


  register(userData: any): Observable<any> {
    return this.http.post(this.apiRegister, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // <--- IMPORTANT
      this.connectedSubject.next(false);
      this.userSubject.next(null);
    }
  }

  /** ---------- STOCKAGE LOCAL ---------- */

  

  setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('token', token);
    this.connectedSubject.next(true);
  }

  private getStoredUser(): Utilisateur | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Utilisateur;
    } catch {
      return null;
    }
  }

  /** ---------- HELPERS ---------- */

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem('token');
  }

  getRole(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      const u = JSON.parse(raw) as Utilisateur;
      return (u as any)?.role ?? null;
    } catch {
      return null;
    }
  }

  /** ---------- (Optionnel) Récupérer l'utilisateur courant depuis l'API ---------- */

  

  
    setUser(user: Utilisateur) {
      localStorage.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
    }
  

  

  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.baseUrl}/id/${id}`);
  }

  uploadImageProfil(file: File) {
    const fd = new FormData();
    
    fd.append('image', file);
    return this.http.post<{ success: boolean; url?: string; message: string }>(
      this.baseUrl + "/upload",
      fd
    );
  }
  getCurrentUser(): Observable<Utilisateur> {
    const cached = this.userSubject.value || this.getStoredUser(); // relit localStorage si besoin
    if (!cached?.id) {
      // 🚫 Pas d’utilisateur → on N’APPELLE PAS l’API
      return EMPTY;
    }
    // ✅ Appel existant : GET /api/utilisateur/id/{id}
    return this.getById(cached.id).pipe(
      tap(u => this.setUser(u)) // maj du cache local
    );
  }

  /** Optionnel mais recommandé : synchroniser le local après update */
  update(id: number, patch: Partial<Utilisateur>): Observable<Utilisateur> {
    console.log("ppp"+patch);
    return this.http.put<Utilisateur>(`${this.baseUrl}/${id}`, patch).pipe(
      tap(u => this.setUser(u)) // 👈 garde le local aligné avec la BDD
    );
  }
  // services/auth.service.ts (ajoute ceci dans la classe)
leaveAppBeacon(): void {
  const id = this.userSubject?.value?.id; // selon ton implémentation du BehaviorSubject
  if (!id) return;
  const body = new Blob([JSON.stringify({ statut: 'inactif' })], { type: 'application/json' });
  // Endpoint POST pour le beacon (voir back ci-dessous)
  navigator.sendBeacon(`${this.baseUrl}/${id}/status`, body);
}

}
