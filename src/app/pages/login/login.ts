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
      .catch((err) => {
        console.error(err);
        this.error = 'Email o contraseña incorrectos';
      })
      .finally(() => {
        this.loading = false;
      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}