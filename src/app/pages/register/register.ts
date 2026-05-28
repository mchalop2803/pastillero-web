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

      this.error = 'El nombre es obligatorio';
      this.errorField = 'name';

      return;
    }

    if (!nameRegex.test(this.name)) {

      this.error =
        'El nombre solo puede contener letras';

      this.errorField = 'name';

      return;
    }

    if (this.name.length > 30) {

      this.error = 'Máximo 30 caracteres';
      this.errorField = 'name';

      return;
    }

    // =========================
    // APELLIDOS
    // =========================

    if (!this.surname) {

      this.error =
        'Los apellidos son obligatorios';

      this.errorField = 'surname';

      return;
    }

    if (!nameRegex.test(this.surname)) {

      this.error =
        'Los apellidos solo pueden contener letras';

      this.errorField = 'surname';

      return;
    }

    // =========================
    // EMAIL
    // =========================

    if (!this.email) {

      this.error =
        'El email es obligatorio';

      this.errorField = 'email';

      return;
    }

    if (!emailRegex.test(this.email)) {

      this.error =
        'Introduce un email válido';

      this.errorField = 'email';

      return;
    }

    // =========================
    // PASSWORD
    // =========================

    if (!this.password) {

      this.error =
        'La contraseña es obligatoria';

      this.errorField = 'password';

      return;
    }

    if (this.password.length < 6) {

      this.error =
        'Mínimo 6 caracteres';

      this.errorField = 'password';

      return;
    }

    const hasLetter =
      /[A-Za-z]/.test(this.password);

    const hasNumber =
      /\d/.test(this.password);

    if (!hasLetter || !hasNumber) {

      this.error =
        'Debe contener letras y números';

      this.errorField = 'password';

      return;
    }

    // =========================
    // DNI
    // =========================

    if (!this.nif) {

      this.error =
        'El DNI es obligatorio';

      this.errorField = 'nif';

      return;
    }

    if (!nifRegex.test(this.nif)) {

      this.error =
        'Formato DNI incorrecto (12345678A)';

      this.errorField = 'nif';

      return;
    }

    // =========================
    // TELÉFONO
    // =========================

    if (!this.phone) {

      this.error =
        'El teléfono es obligatorio';

      this.errorField = 'phone';

      return;
    }

    if (!phoneRegex.test(this.phone)) {

      this.error =
        'El teléfono debe tener 9 dígitos';

      this.errorField = 'phone';

      return;
    }

    // =========================
    // EDAD
    // =========================

    if (
      this.age === null ||
      this.age === undefined
    ) {

      this.error =
        'La edad es obligatoria';

      this.errorField = 'age';

      return;
    }

    if (this.age < 1 || this.age > 120) {

      this.error =
        'Introduce una edad válida';

      this.errorField = 'age';

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

          this.error =
            'El email ya está en uso';

          this.errorField = 'email';

          break;

        case 'auth/invalid-email':

          this.error =
            'Introduce un email válido';

          this.errorField = 'email';

          break;

        case 'auth/weak-password':

          this.error =
            'La contraseña es demasiado débil';

          this.errorField = 'password';

          break;

        default:

          this.error =
            'Error al registrar usuario';
      }

    } finally {

      this.loading = false;
    }
  }

  goToLogin() {

    this.router.navigate(['/login']);
  }
}
