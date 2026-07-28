import { Component, OnInit, computed, inject, signal , ChangeDetectionStrategy} from '@angular/core';
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
import { DynamicFormComponent } from '../../../shared/ui/dynamic-form/dynamic-form.component';
import { DynamicField } from '../../../shared/models/dynamic-form.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { employmentStatusOptions } from '../../../core/utils/labels';
import { DetailFieldComponent } from '../../../shared/ui/detail-field/detail-field.component';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-request-detail',
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
    DetailFieldComponent,
    DynamicFormComponent,
    SpinnerComponent
  ],
  template: `
    @if (isLoading()) {
      <app-spinner height="calc(100vh - 100px)"></app-spinner>
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
              <app-dynamic-form
                [fields]="fields()"
                [readonly]="true"
                [hideSubmit]="true"
              />
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
  readonly employmentOptions = employmentStatusOptions;
  fields = computed<DynamicField[]>(() => this.buildFields(this.request()));
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
  private buildFields(req: RequestDetails | undefined): DynamicField[] {
    if (!req) return [];
    
    const requestType = req.requestType ?? 'PRESTAMO';
    const common: DynamicField[] = [
      { key: 'employmentStatus', sourceKey: 'partyLaboralSituation', label: 'Situación laboral', type: 'select', options: this.employmentOptions, value: ((req as unknown) as Record<string, unknown>)['partyLaboralSituation'] },
      { key: 'annualIncome', sourceKey: 'partyIncome', label: 'Ingresos anuales', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: ((req as unknown) as Record<string, unknown>)['partyIncome'] }
    ];
    switch (requestType) {
      case 'TARJETA_CREDITO':
        return [
          { key: 'creditLimit', sourceKey: 'requestedCreditLimit', label: 'Límite de crédito', type: 'number', prefix: '€ ', validators: { min: 0, step: 100 }, value: req.requestedCreditLimit },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: req.interestRate },
          { key: 'isRevolving', sourceKey: 'isRevolving', label: 'Revolving', type: 'boolean', value: ((req as unknown) as Record<string, unknown>)['isRevolving'] ?? false },
          ...common
        ];
      case 'HIPOTECA':
        return [
          { key: 'loanAmount', sourceKey: 'requestedAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: req.requestedAmount },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', validators: { min: 1, step: 12 }, value: req.requestTermMonths },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: req.interestRate },
          { key: 'propertyValue', sourceKey: 'propertyValue', label: 'Valor de la propiedad', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: ((req as unknown) as Record<string, unknown>)['propertyValue'] },
          { key: 'hasMortgage', label: 'Tiene otra hipoteca', type: 'boolean', value: false },
          ...common
        ];
      default:
        return [
          { key: 'loanAmount', sourceKey: 'requestedAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: req.requestedAmount },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', validators: { min: 1, step: 12 }, value: req.requestTermMonths },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: req.interestRate },
          { key: 'loanType', label: 'Tipo de préstamo', type: 'text', value: ((req as unknown) as Record<string, unknown>)['loanType'] ?? '-' },
          { key: 'repaymentSystem', label: 'Sistema amortización', type: 'text', value: ((req as unknown) as Record<string, unknown>)['repaymentSystem'] ?? '-' },
          ...common
        ];
    }
  }
}
