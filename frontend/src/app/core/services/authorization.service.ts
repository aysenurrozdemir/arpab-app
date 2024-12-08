import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";

@Injectable({providedIn: 'root'})
export class AuthorizationService {
  private readonly TOKEN_KEY = 'token';

  constructor() {
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  removeAuthentication(): void {
    localStorage.clear();
    location.href = environment.domainForLocalhost;
    // degıstır deploy alırken domain olarak
  }

}
