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

  errors: any = {};

  loading = false;

  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {}

  async register() {

    this.errors = {};

    // limpiar espacios
    this.name = this.name.trim();
    this.surname = this.surname.trim();
    this.email = this.email.trim();
    this.password = this.password.trim();
    this.nif = this.nif.trim();
    this.phone = this.phone.trim();

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    const nifRegex = /^[0-9]{8}[A-Za-z]$/;
    const phoneRegex = /^[0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasErrors = false;

    // =====================
    // NOMBRE
    // =====================
    if (!this.name) {
      this.errors.name = 'El nombre es obligatorio';
      hasErrors = true;
    } else if (!nameRegex.test(this.name)) {
      this.errors.name = 'Solo letras permitidas';
      hasErrors = true;
    } else if (this.name.length > 30) {
      this.errors.name = 'Máximo 30 caracteres';
      hasErrors = true;
    }

    // =====================
    // APELLIDOS
    // =====================
    if (!this.surname) {
      this.errors.surname = 'Los apellidos son obligatorios';
      hasErrors = true;
    } else if (!nameRegex.test(this.surname)) {
      this.errors.surname = 'Solo letras permitidas';
      hasErrors = true;
    }

    // =====================
    // EMAIL
    // =====================
    if (!this.email) {
      this.errors.email = 'El email es obligatorio';
      hasErrors = true;
    } else if (!emailRegex.test(this.email)) {
      this.errors.email = 'Email inválido';
      hasErrors = true;
    }

    // =====================
    // PASSWORD
    // =====================
    if (!this.password) {
      this.errors.password = 'La contraseña es obligatoria';
      hasErrors = true;
    } else if (this.password.length < 6) {
      this.errors.password = 'Mínimo 6 caracteres';
      hasErrors = true;
    } else if (!/[A-Za-z]/.test(this.password) || !/\d/.test(this.password)) {
      this.errors.password = 'Debe contener letras y números';
      hasErrors = true;
    }

    // =====================
    // DNI
    // =====================
    if (!this.nif) {
      this.errors.nif = 'El DNI es obligatorio';
      hasErrors = true;
    } else if (!nifRegex.test(this.nif)) {
      this.errors.nif = 'Formato incorrecto (12345678A)';
      hasErrors = true;
    }

    // =====================
    // TELÉFONO
    // =====================
    if (!this.phone) {
      this.errors.phone = 'El teléfono es obligatorio';
      hasErrors = true;
    } else if (!phoneRegex.test(this.phone)) {
      this.errors.phone = 'Debe tener 9 dígitos';
      hasErrors = true;
    }

    // =====================
    // EDAD
    // =====================
    if (this.age === null || this.age === undefined) {
      this.errors.age = 'La edad es obligatoria';
      hasErrors = true;
    } else if (this.age < 1 || this.age > 120) {
      this.errors.age = 'Edad no válida';
      hasErrors = true;
    }

    // si hay errores, NO continuar
    if (hasErrors) return;

    // =====================
    // FIREBASE
    // =====================
    try {

      this.loading = true;

      const userCredential =
        await createUserWithEmailAndPassword(
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

      switch (err.code) {

        case 'auth/email-already-in-use':
          this.errors.email = 'El email ya está en uso';
          break;

        case 'auth/invalid-email':
          this.errors.email = 'Email inválido';
          break;

        case 'auth/weak-password':
          this.errors.password = 'Contraseña débil';
          break;

        default:
          this.errors.general = 'Error al registrar usuario';
      }

    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}