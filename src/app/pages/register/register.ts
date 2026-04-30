import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Database, ref, set } from '@angular/fire/database';

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
  loading = false;

  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {}

  async register() {

    this.error = '';

    if (!this.email || !this.password || !this.name ||
        !this.surname || !this.nif || !this.phone || !this.age) {
        this.error = 'Please fill all fields';
        return;
    }

    try {

        this.loading = true;

        const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
        );

        const uid = userCredential.user.uid;

        const userData = {
        id: uid,
        name: this.name,
        surname: this.surname,
        nif: this.nif,
        phone: this.phone,
        age: this.age
        };

        await set(ref(this.db, `users/${uid}`), userData);

        this.router.navigate(['/login']);

    } catch (err) {
        console.error(err);
        this.error = 'Error registering user';
    } finally {
        this.loading = false;
    }
    }

    goToLogin() {
      this.router.navigate(['/login']);
    }
}