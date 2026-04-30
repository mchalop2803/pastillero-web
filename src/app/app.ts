import { Component, inject, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {

  private auth = inject(Auth);

  loading = true;

  constructor(private router: Router) {}

  async ngOnInit() {
    const user = await firstValueFrom(authState(this.auth));

    if (!user) {
      this.router.navigate(['/login']);
    } else {
      this.loading = false;
    }
  }
}