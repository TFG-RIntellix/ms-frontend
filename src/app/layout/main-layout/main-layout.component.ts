import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
/**
 * The root Shell component of the application.
 * Manages the top-level layout structure including the sidebar, top navigation for mobile, and the main content router outlet.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="h-screen flex bg-surface-50 overflow-hidden relative w-full">
      @if (sidebarOpen()) {
        <div class="fixed inset-0 bg-surface-900/50 z-20 md:hidden" (click)="toggleSidebar()"></div>
      }
      <app-sidebar class="shrink-0 fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:static md:translate-x-0"
                   [class.-translate-x-full]="!sidebarOpen()"
                   [class.translate-x-0]="sidebarOpen()" />
      <main class="flex-1 p-4 sm:p-6 overflow-auto flex flex-col w-full min-w-0">
        <div class="flex items-center gap-3 mb-4 md:hidden">
          <button type="button" class="p-2 rounded-lg bg-white shadow-sm border border-surface-200 text-surface-600 hover:bg-surface-50" (click)="toggleSidebar()">
            <i class="pi pi-bars text-lg"></i>
          </button>
          <span class="font-bold text-lg text-surface-900 tracking-tight">RIntellix</span>
        </div>
        <app-breadcrumb></app-breadcrumb>
        <router-outlet />
      </main>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);

  /**
   * Toggles the visibility of the mobile sidebar overlay.
   */
  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
