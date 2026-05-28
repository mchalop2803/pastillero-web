import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile
} from '@angular/fire/auth';

import {
  Database,
  ref,
  set
} from '@angular/fire/database';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  email = '';
  password = '';
  name = '';
  surname = '';
  nif = '';
  phone = '';
  age: number | null = null;

  errors: { [key: string]: string } = {};
  loading = false;

  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================
  // HELPERS
  // =========================

  setError(field: string, message: string) {
    this.errors[field] = message;
  }

  clearError(field: string) {
    delete this.errors[field];
    delete this.errors['general'];
  }

  setEmailError(message: string) {
    this.errors['email'] = message;
  }

  // =========================
  // REGISTER
  // =========================

  async register() {

    this.errors = {};

    // =========================
    // VALIDACIONES VACÍOS
    // =========================

    if (!this.name) this.setError('name', 'El nombre es obligatorio');
    if (!this.surname) this.setError('surname', 'Los apellidos son obligatorios');
    if (!this.email) this.setEmailError('El correo electrónico es obligatorio');
    if (!this.password) this.setError('password', 'La contraseña es obligatoria');
    if (!this.nif) this.setError('nif', 'El DNI es obligatorio');
    if (!this.phone) this.setError('phone', 'El teléfono es obligatorio');
    if (!this.age && this.age !== 0) this.setError('age', 'La edad es obligatoria');

    // =========================
    // VALIDACIONES FORMATOS
    // =========================

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nifRegex = /^[0-9]{8}[A-Za-z]$/;
    const phoneRegex = /^[0-9]{9}$/;

    if (this.name && !nameRegex.test(this.name)) {
      this.setError('name', 'El nombre solo puede contener letras');
    }

    if (this.surname && !nameRegex.test(this.surname)) {
      this.setError('surname', 'Los apellidos solo pueden contener letras');
    }

    if (this.email && !emailRegex.test(this.email)) {
      this.setEmailError('Introduce un correo electrónico válido');
    }

    if (this.password && this.password.length < 6) {
      this.setError('password', 'La contraseña debe tener al menos 6 caracteres');
    }

    if (this.nif && !nifRegex.test(this.nif)) {
      this.setError('nif', 'El DNI debe tener formato 12345678A');
    }

    if (this.phone && !phoneRegex.test(this.phone)) {
      this.setError('phone', 'El teléfono debe contener 9 dígitos');
    }

    if (this.age && (this.age < 1 || this.age > 120)) {
      this.setError('age', 'Introduce una edad válida');
    }

    // =========================
    // BLOQUEAR SI HAY ERRORES
    // =========================

    if (Object.keys(this.errors).length > 0) return;

    // =========================
    // FIREBASE
    // =========================

    try {

      this.loading = true;

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      await updateProfile(userCredential.user, {
        displayName: `${this.name} ${this.surname}`
      });

      const uid = userCredential.user.uid;

      const userData = {
        id: uid,
        name: this.name,
        surname: this.surname,
        nif: this.nif,
        phone: this.phone,
        age: this.age,
        email: this.email
      };

      await set(ref(this.db, `users/${uid}`), userData);

      this.router.navigate(['/login']);

    } catch (err: any) {

      this.loading = false;

      switch (err.code) {

        case 'auth/email-already-in-use':
        case 'auth/email-already-exists':
          this.setEmailError('Este correo ya está registrado');
          break;

        case 'auth/invalid-email':
          this.setEmailError('Correo electrónico inválido');
          break;

        case 'auth/weak-password':
          this.setError('password', 'La contraseña es demasiado débil');
          break;

        default:
          this.setError('general', 'Error al registrar usuario');
      }

    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}