import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'driver' | 'client';
  driver?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreUser();
  }

  private restoreUser() {
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        // ignore
      }
    }
    const token = this.getToken();
    if (token) {
      this.fetchUser().subscribe({
        error: () => {
          // Keep saved user if network temporary error or ignore
        }
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  setUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRole(): string {
    return this.currentUserSubject.value?.role || 'client';
  }

  currentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isAgent(): boolean {
    return this.getRole() === 'agent';
  }

  isDriver(): boolean {
    return this.getRole() === 'driver';
  }

  isClient(): boolean {
    return this.getRole() === 'client';
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        const token = response?.token || response?.access_token;
        if (token) {
          this.setToken(token);
        }
        if (response.user) {
          this.setUser(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        const token = response?.token || response?.access_token;
        if (token) {
          this.setToken(token);
        }
        if (response.user) {
          this.setUser(response.user);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => this.removeToken(),
        error: () => this.removeToken()
      })
    );
  }

  fetchUser(): Observable<any> {
    return this.http.get<User>(`${this.apiUrl}/user`).pipe(
      tap(user => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }
}
