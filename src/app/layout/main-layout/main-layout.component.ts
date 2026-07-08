import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen flex bg-surface-50">
      <app-sidebar class="shrink-0" />
      <main class="flex-1 p-6 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `
})
export class MainLayoutComponent {}
