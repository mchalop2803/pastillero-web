import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signOut,
  user
} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);

  user$ = authState(this.auth);

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  async getCurrentUser() {
    return await firstValueFrom(user(this.auth));
  }

  isLoggedIn() {
    return !!this.auth.currentUser;
  }
}