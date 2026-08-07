import { Component, OnInit, OnDestroy, computed, inject, signal , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Subscription, timer } from 'rxjs';
import { ScoringService } from '../../core/services/scoring.service';
import { RequestService } from '../../core/services/request.service';
import { ReportService } from '../../core/services/report.service';
import { Scoring } from '../../core/models/scoring.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { MetricCardComponent } from '../../shared/ui/metric-card/metric-card.component';
import { RiskMetricCardComponent, RiskSeverity } from '../../shared/ui/risk-metric-card/risk-metric-card.component';
import { ShapDriversChartComponent } from '../../shared/ui/shap-drivers-chart/shap-drivers-chart.component';
import { CurrencyValuePipe } from '../../shared/ui/currency-value/currency-value.pipe';
import { riskGradeColor } from '../../core/utils/labels';
import { TagSeverity } from '../../core/utils/tag-severity';
import { DetailFieldComponent } from '../../shared/ui/detail-field/detail-field.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-scoring',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    PageHeaderComponent,
    MetricCardComponent,
    RiskMetricCardComponent,
    ShapDriversChartComponent,
    CurrencyValuePipe,
    DetailFieldComponent
  ],
  template: `
    <app-page-header title="Scoring" [subtitle]="'Solicitud ' + requestId()" />
    @if (scoring(); as s) {
      <!-- Risk Metrics Section — PD, LGD, EAD, ECL with severity colors -->
      <p-card styleClass="rounded-xl shadow-sm mb-6">
        <ng-template pTemplate="title">
          <div class="flex items-center justify-between">
            <span class="text-surface-900 font-semibold">Métricas de riesgo</span>
            <p-tag [value]="s.riskGrade" [severity]="riskSeverity()" />
          </div>
        </ng-template>
        <ng-template pTemplate="content">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <app-risk-metric-card
              label="Prob. Default (PD)"
              [value]="s.pd * 100"
              [severity]="gradeSeverity()"
              suffix="%"
              icon="pi-chart-line"
            />
            <app-risk-metric-card
              label="Pérdida (LGD)"
              [value]="s.lgd * 100"
              [severity]="lgdSeverity()"
              suffix="%"
              icon="pi-percentage"
            />
            <app-risk-metric-card
              label="Exposición (EAD)"
              [value]="s.ead"
              [severity]="gradeSeverity()"
              [isCurrency]="true"
              icon="pi-wallet"
            />
            <app-risk-metric-card
              label="Pérdida esperada (ECL)"
              [value]="s.ecl"
              [severity]="gradeSeverity()"
              [isCurrency]="true"
              icon="pi-exclamation-triangle"
            />
          </div>
        </ng-template>
      </p-card>
      <!-- Main content: Drivers + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- SHAP Drivers Chart -->
          <app-shap-drivers-chart
            [features]="s.topFeatures"
            [baseValue]="s.baseValue"
          />
          <!-- Financial Metrics -->
          <p-card styleClass="rounded-xl shadow-sm">
            <ng-template pTemplate="title">
              <span class="text-surface-900 font-semibold">Métricas financieras</span>
            </ng-template>
            <ng-template pTemplate="content">
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
        </div>
        <!-- Sidebar -->
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
  private requestService = inject(RequestService);
  private reportService = inject(ReportService);
  requestId = signal('');
  scoring = signal<Scoring | undefined>(undefined);
  reportId = signal<string | undefined>(undefined);
  isReportLoading = signal(false);
  private pollingSub?: Subscription;

  riskSeverity = computed<TagSeverity>(() => (riskGradeColor[this.scoring()?.riskGrade ?? ''] ?? 'info') as TagSeverity);
  lgdSeverity = computed<RiskSeverity>(() => {
    const lgd = (this.scoring()?.lgd ?? 0) * 100;
    if (lgd < 30) return 'low';
    if (lgd < 60) return 'medium';
    return 'high';
  });

  // EAD and ECL severity derived from the riskGrade (A-H)
  gradeSeverity = computed<RiskSeverity>(() => {
    const grade = this.scoring()?.riskGrade ?? '';
    if (['A', 'B'].includes(grade)) return 'low';
    if (['C', 'D', 'E'].includes(grade)) return 'medium';
    return 'high';
  });

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
    let attempts = 0;
    const maxAttempts = 20; // 60 segundos de timeout (20 * 3s)
    
    // Poll every 3 seconds until the report is generated or timeout is reached
    this.pollingSub = timer(0, 3000).subscribe(() => {
      attempts++;
      if (attempts > maxAttempts) {
        this.isReportLoading.set(false);
        this.pollingSub?.unsubscribe();
        alert('El informe está tardando demasiado en generarse. Por favor, revíselo más tarde.');
        return;
      }
      
      this.reportService.getByRequestId(requestId).subscribe({
        next: report => {
          if (report && report.reportId) {
            this.reportId.set(report.reportId);
            this.isReportLoading.set(false);
            this.pollingSub?.unsubscribe();
          }
        },
        error: () => {
          // Si devuelve 404, significa que aún no se ha generado, simplemente ignora el error
          // y el polling seguirá hasta el maxAttempts.
        }
      });
    });
  }

  viewPdf() {
    const id = this.reportId();
    if (!id) return;
    this.reportService.getFile(id).subscribe({
      next: blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      },
      error: () => alert('No se pudo visualizar el informe.')
    });
  }
}
