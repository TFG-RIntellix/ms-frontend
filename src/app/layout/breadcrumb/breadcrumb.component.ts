import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
/**
 * Dumb Component for displaying navigation breadcrumbs.
 * Subscribes to the BreadcrumbService to render the current route path dynamically.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-breadcrumb',
  imports: [CommonModule, BreadcrumbModule],
  template: `
    <div class="mb-4" *ngIf="(breadcrumbService.breadcrumbs$ | async) as breadcrumbs">
      <p-breadcrumb 
        *ngIf="breadcrumbs.length > 0"
        [model]="breadcrumbs" 
        [home]="homeIcon">
      </p-breadcrumb>
    </div>
  `
})
export class BreadcrumbComponent {
  public readonly breadcrumbService = inject(BreadcrumbService);
  public homeIcon = { icon: 'pi pi-home', routerLink: '/' };
}
