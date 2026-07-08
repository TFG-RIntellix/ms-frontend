import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="h-screen w-64 bg-surface-900 text-white flex flex-col shadow-lg">
      <div class="p-6 flex items-center gap-3 border-b border-surface-800">
        <div class="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center">
          <i class="pi pi-chart-line text-white text-lg"></i>
        </div>
        <span class="text-xl font-semibold tracking-tight">RIntellix</span>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1">
        <a
          routerLink="/requests"
          routerLinkActive="active-nav"
          class="nav-link"
        >
          <i class="pi pi-users"></i>
          <span>Solicitudes</span>
        </a>
        <a
          routerLink="/simulations"
          routerLinkActive="active-nav"
          class="nav-link"
        >
          <i class="pi pi-chart-line"></i>
          <span>Simulaciones</span>
        </a>
        <a
          routerLink="/reports"
          routerLinkActive="active-nav"
          class="nav-link"
        >
          <i class="pi pi-file-pdf"></i>
          <span>Informes</span>
        </a>
      </nav>

      <div class="p-4 border-t border-surface-800">
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-surface-800 hover:bg-surface-700 transition"
          (click)="logout()"
        >
          <i class="pi pi-sign-out"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: `
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: background-color 0.2s, color 0.2s;
    }
    .nav-link:hover {
      background-color: #1e293b;
      color: #fff;
    }
    .active-nav {
      background-color: #F30005;
      color: #fff !important;
    }
    .active-nav:hover {
      background-color: #DC2626;
    }
  `
})
export class SidebarComponent {
  private keycloak = inject(Keycloak);

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin + '/login' });
  }
}
