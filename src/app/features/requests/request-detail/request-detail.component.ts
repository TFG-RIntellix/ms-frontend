import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RequestService } from '../../../core/services/request.service';
import { RequestDetails } from '../../../core/models/request.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { CurrencyValuePipe } from '../../../shared/ui/currency-value/currency-value.pipe';
import { RequestTypeLabelPipe } from '../../../shared/pipes/request-type-label.pipe';
import { requestTypeLabel } from '../../../core/utils/labels';
import { LoanFieldsComponent } from '../components/loan-fields.component';
import { CreditCardFieldsComponent } from '../components/credit-card-fields.component';
import { MortgageFieldsComponent } from '../components/mortgage-fields.component';
import { DetailFieldComponent } from '../../../shared/ui/detail-field/detail-field.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    DividerModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyValuePipe,
    RequestTypeLabelPipe,
    LoanFieldsComponent,
    CreditCardFieldsComponent,
    MortgageFieldsComponent,
    DetailFieldComponent
  ],
  template: `
    @if (isLoading()) {
      <div class="flex justify-center items-center h-[calc(100vh-100px)]">
        <div class="rintellix-spinner"></div>
      </div>
    } @else {
      @let req = request()!;
      <app-page-header [title]="pageTitle()" [subtitle]="req.requestId" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <p-card styleClass="rounded-xl shadow-sm">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 text-surface-900">
                <i class="pi pi-user"></i>
                <span>Datos del cliente</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-detail-field label="Nombre">{{ req.partyName }}</app-detail-field>
                <app-detail-field label="NIF">{{ req.partyNIF ?? '-' }}</app-detail-field>
                <app-detail-field label="Teléfono">{{ req.partyPhoneNumber ?? '-' }}</app-detail-field>
                <app-detail-field label="Email">{{ req.partyEmail ?? '-' }}</app-detail-field>
                <app-detail-field label="Dirección">{{ req.partyAddress ?? '-' }}</app-detail-field>
              </div>
            </ng-template>
          </p-card>

          <p-card styleClass="rounded-xl shadow-sm">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 text-surface-900">
                <i class="pi pi-briefcase"></i>
                <span>Situación laboral y económica</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <app-detail-field label="Situación laboral">{{ req.partyLaboralSituation ?? '-' }}</app-detail-field>
                <app-detail-field label="Ingresos anuales">{{ req.partyIncome | currencyValue:req.currency }}</app-detail-field>
              </div>
            </ng-template>
          </p-card>

          <p-card styleClass="rounded-xl shadow-sm">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 text-surface-900">
                <i class="pi pi-file"></i>
                <span>Detalle del producto</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              @switch (req.requestType) {
                @case ('TARJETA_CREDITO') {
                  <app-credit-card-fields [request]="req" />
                }
                @case ('HIPOTECA') {
                  <app-mortgage-fields [request]="req" />
                }
                @default {
                  <app-loan-fields [request]="req" />
                }
              }
            </ng-template>
          </p-card>
        </div>

        <div class="space-y-6">
          <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500">
            <ng-template pTemplate="content">
              <app-detail-field label="Importe principal">
                <span class="text-3xl font-bold text-surface-900">{{ mainAmount(req) | currencyValue:req.currency }}</span>
              </app-detail-field>

              <p-divider />

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-surface-500">Estado</span>
                  <app-status-badge [status]="req.status" />
                </div>
                <div class="flex justify-between">
                  <span class="text-surface-500">Producto</span>
                  <span class="font-medium">{{ req.requestType | requestTypeLabel }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-surface-500">Fecha solicitud</span>
                  <span class="font-medium">{{ req.requestDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-surface-500">Última revisión</span>
                  <span class="font-medium">{{ req.lastReviewDate | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              <p-divider />

              <div class="grid grid-cols-1 gap-2">
                <p-button
                  styleClass="w-full"
                  label="Ver scoring"
                  icon="pi pi-chart-bar"
                  [routerLink]="['/requests', req.requestId, 'scoring']"
                />
                <p-button
                  styleClass="w-full"
                  label="Simular escenario"
                  icon="pi pi-sliders-h"
                  [outlined]="true"
                  [routerLink]="['/requests', req.requestId, 'simulate']"
                />
              </div>
            </ng-template>
          </p-card>
        </div>
      </div>
    }
  `
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);

  request = signal<RequestDetails | undefined>(undefined);
  isLoading = signal(true);

  pageTitle = computed(() => {
    const req = this.request();
    if (!req) return 'Solicitud';
    return `${requestTypeLabel[req.requestType] ?? req.requestType} de ${req.partyName}`;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/requests']);
      return;
    }

    this.requestService.get(id).subscribe({
      next: req => {
        this.request.set(req);
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/requests'])
    });
  }

  mainAmount(req: RequestDetails): number {
    if (req.requestType === 'TARJETA_CREDITO') {
      return req.requestedCreditLimit ?? 0;
    }
    return req.requestedAmount ?? 0;
  }
}
