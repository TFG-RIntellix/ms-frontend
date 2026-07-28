import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
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
