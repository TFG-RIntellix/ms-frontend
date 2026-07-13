import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subscription, timer } from 'rxjs';

import { ScoringService } from '../../core/services/scoring.service';
import { ReportService } from '../../core/services/report.service';
import { Scoring } from '../../core/models/scoring.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { MetricCardComponent } from '../../shared/ui/metric-card/metric-card.component';
import { CurrencyValuePipe } from '../../shared/ui/currency-value/currency-value.pipe';
import { riskGradeColor } from '../../core/utils/labels';
import { TagSeverity } from '../../core/utils/tag-severity';
import { DetailFieldComponent } from '../../shared/ui/detail-field/detail-field.component';

@Component({
  selector: 'app-scoring',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DividerModule,
    ProgressBarModule,
    PageHeaderComponent,
    MetricCardComponent,
    CurrencyValuePipe,
    DetailFieldComponent
  ],
  template: `
    <app-page-header title="Scoring" [subtitle]="'Solicitud ' + requestId()" />

    @if (scoring(); as s) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <p-card styleClass="rounded-xl shadow-sm">
            <ng-template pTemplate="title">
              <div class="flex items-center justify-between">
                <span class="text-surface-900 font-semibold">Resumen del scoring</span>
                <p-tag [value]="s.riskGrade" [severity]="riskSeverity()" />
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <app-metric-card label="PD (%)" [value]="s.pd * 100" [isCurrency]="false" format="1.2-2" />
                <app-metric-card label="LGD (%)" [value]="s.lgd * 100" [isCurrency]="false" format="1.2-2" />
                <app-metric-card label="EAD" [value]="s.ead" [isCurrency]="true" />
                <app-metric-card label="Pérdida esperada (ECL)" [value]="s.ecl" [isCurrency]="true" />
              </div>

              <p-divider />

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <app-metric-card label="Cuota mensual" [value]="s.monthlyPayment" [isCurrency]="true" />
                <app-metric-card label="DTI (%)" [value]="s.dti * 100" [isCurrency]="false" format="1.2-2" />
                <app-metric-card label="Pago total" [value]="s.totalPayment" [isCurrency]="true" />
                <app-metric-card label="Intereses totales" [value]="s.totalInterest" [isCurrency]="true" />
              </div>

              <p-divider />

              <div class="flex items-center justify-between text-sm text-surface-500">
                <span>Versión del modelo: <strong class="text-surface-900">{{ s.modelVersion }}</strong></span>
                <span>Fecha: <strong class="text-surface-900">{{ s.scoringDate | date:'dd/MM/yyyy' }}</strong></span>
              </div>
            </ng-template>
          </p-card>

          <p-card styleClass="rounded-xl shadow-sm">
            <ng-template pTemplate="title">
              <span class="text-surface-900 font-semibold">Principales drivers</span>
            </ng-template>
            <ng-template pTemplate="content">
              <p-table [value]="s.topFeatures" styleClass="p-datatable-sm" [tableStyle]="{'min-width':'30rem'}">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Variable</th>
                    <th>Valor</th>
                    <th class="text-right">Impacto</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-feature>
                  <tr>
                    <td class="font-medium text-surface-900">{{ feature.featureName }}</td>
                    <td class="text-surface-600">{{ feature.featureValue }}</td>
                    <td class="text-right">
                      <p-progressBar
                        [value]="featureShapPercent(feature)"
                        [showValue]="true"
                        styleClass="w-32 ml-auto"
                      />
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </ng-template>
          </p-card>
        </div>

        <div class="space-y-6">
          <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500">
            <ng-template pTemplate="content">
              <app-detail-field label="Ingreso disponible mensual">
                <span class="text-3xl font-bold text-surface-900">{{ s.monthlyDisposableIncome | currencyValue }}</span>
              </app-detail-field>

              <p-divider />

              <div class="grid grid-cols-1 gap-2">
                <p-button
                  styleClass="w-full"
                  label="Simular escenario"
                  icon="pi pi-sliders-h"
                  [routerLink]="['/requests', requestId(), 'simulate']"
                />
                @if (reportId()) {
                  <p-button
                    styleClass="w-full"
                    label="Ver informe PDF"
                    icon="pi pi-file-pdf"
                    [outlined]="true"
                    (onClick)="viewPdf()"
                  />
                } @else if (isReportLoading()) {
                  <p-button
                    styleClass="w-full"
                    label="Cargando informe..."
                    icon="pi pi-spin pi-spinner"
                    [outlined]="true"
                    [disabled]="true"
                  />
                }
              </div>
            </ng-template>
          </p-card>
        </div>
      </div>
    } @else {
      <p-card styleClass="rounded-xl shadow-sm p-6 text-center">
        <p class="text-surface-500">No se ha encontrado un scoring para esta solicitud.</p>
        <p-button
          class="mt-4"
          label="Volver a solicitudes"
          icon="pi pi-arrow-left"
          [outlined]="true"
          [routerLink]="['/requests', requestId()]"
        />
      </p-card>
    }
  `
})
export class ScoringComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scoringService = inject(ScoringService);
  private reportService = inject(ReportService);

  requestId = signal('');
  scoring = signal<Scoring | undefined>(undefined);
  reportId = signal<string | undefined>(undefined);
  isReportLoading = signal(false);
  private pollingSub?: Subscription;

  riskSeverity = computed<TagSeverity>(() => (riskGradeColor[this.scoring()?.riskGrade ?? ''] ?? 'info') as TagSeverity);

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/requests']);
      return;
    }
    this.requestId.set(id);
    this.scoringService.getByRequest(id).subscribe({
      next: res => {
        this.scoring.set(res);
        this.checkReport(id);
      },
      error: () => this.scoring.set(undefined)
    });
  }

  checkReport(requestId: string) {
    this.isReportLoading.set(true);

    // Poll every 3 seconds until the report is generated
    this.pollingSub = timer(0, 3000).subscribe(() => {
      this.reportService.list({ requestId }).subscribe({
        next: reports => {
          if (reports && reports.length > 0) {
            this.reportId.set(reports[0].reportId);
            this.isReportLoading.set(false);
            this.pollingSub?.unsubscribe();
          }
        },
        error: () => {
          this.isReportLoading.set(false);
          this.pollingSub?.unsubscribe();
        }
      });
    });
  }

  viewPdf() {
    const id = this.reportId();
    if (!id) return;

    this.reportService.download(id).subscribe({
      next: blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      },
      error: () => alert('No se pudo visualizar el informe.')
    });
  }

  featureShapPercent(feature: { shapValue: number }): number {
    const max = Math.max(...(this.scoring()?.topFeatures ?? []).map(f => Math.abs(f.shapValue)), 1);
    return (Math.abs(feature.shapValue) / max) * 100;
  }
}
