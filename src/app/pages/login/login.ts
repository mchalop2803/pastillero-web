import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {

    this.error = '';
    this.loading = true;

    this.auth.login(this.email, this.password)
      .then(() => {

        this.router.navigate(['/home']);

      })
      .catch((err: any) => {

        console.error(err);

        switch (err.code) {

          case 'auth/user-not-found':
            this.error = 'No existe ninguna cuenta con este correo';
            break;

          case 'auth/wrong-password':
            this.error = 'La contraseña es incorrecta';
            break;

          case 'auth/invalid-email':
            this.error = 'El formato del correo no es válido';
            break;

          case 'auth/invalid-credential':
            this.error = 'Correo o contraseña incorrectos';
            break;

          case 'auth/too-many-requests':
            this.error = 'Demasiados intentos. Inténtalo más tarde';
            break;

          default:
            this.error = 'Error al iniciar sesión';
        }

      })
      .finally(() => {

        this.loading = false;

      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}