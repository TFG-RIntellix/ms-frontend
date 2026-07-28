import { Component , ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="h-screen flex bg-surface-50 overflow-hidden">
      <app-sidebar class="shrink-0" />
      <main class="flex-1 p-6 overflow-auto">
        <app-breadcrumb></app-breadcrumb>
        <router-outlet />
      </main>
    </div>
  `
})
export class MainLayoutComponent {}
