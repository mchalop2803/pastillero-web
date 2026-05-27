import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css']
})
export class DashboardLayoutComponent implements OnInit {

  // =========================
  // USER
  // =========================
  userName = 'Usuario';

  // =========================
  // SIDEBAR
  // =========================
  isSidebarOpen = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit() {

    const user = this.auth.currentUser;

    if (user) {

      this.userName =
        user.displayName ||
        user.email ||
        'Usuario';
    }
  }

  // =========================
  // LOGOUT
  // =========================
  logout() {

    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  // =========================
  // SIDEBAR
  // =========================
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}