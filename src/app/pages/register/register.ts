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

  // NUEVO
  errors: any = {};

  loading = false;

  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {}

  async register() {

    // NUEVO
    this.errors = {};

    // =========================
    // LIMPIAR ESPACIOS
    // =========================

    this.name = this.name.trim();
    this.surname = this.surname.trim();
    this.email = this.email.trim();
    this.password = this.password.trim();
    this.nif = this.nif.trim();
    this.phone = this.phone.trim();

    // =========================
    // VALIDACIONES
    // =========================

    const nameRegex =
      /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;

    const nifRegex =
      /^[0-9]{8}[A-Za-z]$/;

    const phoneRegex =
      /^[0-9]{9}$/;

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // =========================
    // NOMBRE
    // =========================

    if (!this.name) {

      this.errors.name =
        'El nombre es obligatorio';

      return;
    }

    if (!nameRegex.test(this.name)) {

      this.errors.name =
        'El nombre solo puede contener letras';

      return;
    }

    if (this.name.length > 30) {

      this.errors.name =
        'Máximo 30 caracteres';

      return;
    }

    // =========================
    // APELLIDOS
    // =========================

    if (!this.surname) {

      this.errors.surname =
        'Los apellidos son obligatorios';

      return;
    }

    if (!nameRegex.test(this.surname)) {

      this.errors.surname =
        'Los apellidos solo pueden contener letras';

      return;
    }

    // =========================
    // EMAIL
    // =========================

    if (!this.email) {

      this.errors.email =
        'El email es obligatorio';

      return;
    }

    if (!emailRegex.test(this.email)) {

      this.errors.email =
        'Introduce un email válido';

      return;
    }

    // =========================
    // PASSWORD
    // =========================

    if (!this.password) {

      this.errors.password =
        'La contraseña es obligatoria';

      return;
    }

    if (this.password.length < 6) {

      this.errors.password =
        'Mínimo 6 caracteres';

      return;
    }

    const hasLetter =
      /[A-Za-z]/.test(this.password);

    const hasNumber =
      /\d/.test(this.password);

    if (!hasLetter || !hasNumber) {

      this.errors.password =
        'Debe contener letras y números';

      return;
    }

    // =========================
    // DNI
    // =========================

    if (!this.nif) {

      this.errors.nif =
        'El DNI es obligatorio';

      return;
    }

    if (!nifRegex.test(this.nif)) {

      this.errors.nif =
        'Formato DNI incorrecto (12345678A)';

      return;
    }

    // =========================
    // TELÉFONO
    // =========================

    if (!this.phone) {

      this.errors.phone =
        'El teléfono es obligatorio';

      return;
    }

    if (!phoneRegex.test(this.phone)) {

      this.errors.phone =
        'El teléfono debe tener 9 dígitos';

      return;
    }

    // =========================
    // EDAD
    // =========================

    if (
      this.age === null ||
      this.age === undefined
    ) {

      this.errors.age =
        'La edad es obligatoria';

      return;
    }

    if (this.age < 1 || this.age > 120) {

      this.errors.age =
        'Introduce una edad válida';

      return;
    }

    // =========================
    // FIREBASE
    // =========================

    try {

      this.loading = true;

      const userCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          this.email,
          this.password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName:
            `${this.name} ${this.surname}`
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

          this.errors.email =
            'El email ya está en uso';

          break;

        case 'auth/invalid-email':

          this.errors.email =
            'Introduce un email válido';

          break;

        case 'auth/weak-password':

          this.errors.password =
            'La contraseña es demasiado débil';

          break;

        default:

          alert('Error al registrar usuario');
      }

    } finally {

      this.loading = false;
    }
  }

  goToLogin() {

    this.router.navigate(['/login']);
  }
}
