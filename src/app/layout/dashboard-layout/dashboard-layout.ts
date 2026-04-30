import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule],
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