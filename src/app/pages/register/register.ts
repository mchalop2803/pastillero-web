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

  error = '';
  errorField = '';

  loading = false;

  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {}

  async register() {

    this.error = '';
    this.errorField = '';

    // =========================
    // VALIDACIONES
    // =========================

    if (!this.name) {
      this.error = 'El nombre es obligatorio';
      this.errorField = 'name';
      return;
    }

    if (!this.surname) {
      this.error = 'Los apellidos son obligatorios';
      this.errorField = 'surname';
      return;
    }

    if (!this.email) {
      this.error = 'El correo electrónico es obligatorio';
      this.errorField = 'email';
      return;
    }

    if (!this.password) {
      this.error = 'La contraseña es obligatoria';
      this.errorField = 'password';
      return;
    }

    if (!this.nif) {
      this.error = 'El DNI es obligatorio';
      this.errorField = 'nif';
      return;
    }

    if (!this.phone) {
      this.error = 'El teléfono es obligatorio';
      this.errorField = 'phone';
      return;
    }

    if (!this.age) {
      this.error = 'La edad es obligatoria';
      this.errorField = 'age';
      return;
    }

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nameRegex.test(this.name)) {
      this.error = 'El nombre solo puede contener letras';
      this.errorField = 'name';
      return;
    }

    if (!nameRegex.test(this.surname)) {
      this.error = 'Los apellidos solo pueden contener letras';
      this.errorField = 'surname';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.error = 'Introduce un correo electrónico válido';
      this.errorField = 'email';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      this.errorField = 'password';
      return;
    }

    const nifRegex = /^[0-9]{8}[A-Za-z]$/;

    if (!nifRegex.test(this.nif)) {
      this.error = 'El DNI debe tener formato 12345678A';
      this.errorField = 'nif';
      return;
    }

    const phoneRegex = /^[0-9]{9}$/;

    if (!phoneRegex.test(this.phone)) {
      this.error = 'El teléfono debe contener 9 dígitos';
      this.errorField = 'phone';
      return;
    }

    if (this.age < 1 || this.age > 120) {
      this.error = 'Introduce una edad válida';
      this.errorField = 'age';
      return;
    }

    // =========================
    // REGISTRO FIREBASE
    // =========================

    try {

      this.loading = true;

      const userCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          this.email,
          this.password
        );

      // 🔥 GUARDAR NOMBRE EN AUTH
      await updateProfile(
        userCredential.user,
        {
          displayName: `${this.name} ${this.surname}`
        }
      );

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

      await set(
        ref(this.db, `users/${uid}`),
        userData
      );

      this.router.navigate(['/login']);

    } catch (err: any) {

      console.error(err);

      switch (err.code) {

        case 'auth/email-already-in-use':
          this.error = 'Este correo ya está registrado';
          this.errorField = 'email';
          break;

        case 'auth/invalid-email':
          this.error = 'Correo electrónico inválido';
          this.errorField = 'email';
          break;

        case 'auth/weak-password':
          this.error = 'La contraseña es demasiado débil';
          this.errorField = 'password';
          break;

        default:
          this.error = 'Error al registrar usuario';
      }

    } finally {

      this.loading = false;

    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}