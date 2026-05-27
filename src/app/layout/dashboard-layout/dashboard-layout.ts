import { Component } from '@angular/core';
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
export class DashboardLayoutComponent {

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}