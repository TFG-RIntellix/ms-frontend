import { Component, OnInit, computed, effect, inject, signal , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SimulationService } from '../../../core/services/simulation.service';
import { RequestService } from '../../../core/services/request.service';
import { ScoringService } from '../../../core/services/scoring.service';
import { SimulationDetails } from '../../../core/models/simulation.model';
import { RequestDetails, RequestParty } from '../../../core/models/request.model';
import { Scoring } from '../../../core/models/scoring.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DeltaChipComponent } from '../../../shared/ui/delta-chip/delta-chip.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { MetricValuePipe } from '../../../shared/pipes/metric-value.pipe';
import { RequestTypeLabelPipe } from '../../../shared/pipes/request-type-label.pipe';
import { employmentStatusOptions } from '../../../core/utils/labels';
import { TagSeverity } from '../../../core/utils/tag-severity';
import { SimulationChartComponent } from '../../../shared/ui/simulation-chart/simulation-chart.component';
import { AmortizationChartComponent } from '../../../shared/ui/amortization-chart/amortization-chart.component';
import { DetailFieldComponent } from '../../../shared/ui/detail-field/detail-field.component';
import { DynamicFormComponent } from '../../../shared/ui/dynamic-form/dynamic-form.component';
import { DynamicField } from '../../../shared/models/dynamic-form.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-simulation-detail',
  imports: [
    CommonModule,
    RouterLink,
    DividerModule,
    TagModule,
    CardModule,
    ButtonModule,
    RequestTypeLabelPipe,
    SimulationChartComponent,
    AmortizationChartComponent,
    DetailFieldComponent,
    DynamicFormComponent,
    SpinnerComponent,
    StatusBadgeComponent,
    DeltaChipComponent,
    PageHeaderComponent,
    MetricValuePipe
  ],
  template: `
    @if (isLoading()) {
      <app-spinner height="calc(100vh - 100px)"></app-spinner>
    } @else {
      @let sim = simulation()!;
      @let req = request()!;
      @let client = party()!;
      
      <app-page-header 
        [title]="sim.scenarioName" 
        [subtitle]="'Simulado el ' + (sim.simulationDate | date:'dd/MM/yyyy HH:mm')" 
      />
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        
        <!-- Panel Izquierdo: Variables y Detalles -->
        <div class="space-y-6">
          
          <!-- Variables de simulación -->
          <p-card styleClass="rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <ng-template pTemplate="title">
              <div class="flex items-center justify-between text-surface-900 font-semibold">
                <span>Variables modificadas en la simulación</span>
                <span class="text-sm text-surface-500 font-normal">{{ req.requestType | requestTypeLabel }}</span>
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
          <!-- Detalles adicionales de la simulación -->
          <p-card styleClass="rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <ng-template pTemplate="title">
              <span class="text-surface-900 font-semibold">Información del escenario</span>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <app-detail-field label="Cliente">
                  <div class="font-medium text-surface-900">{{ client.partyName }}</div>
                  <div class="text-xs text-surface-400">
                    @if (req.partyNIF) {
                      NIF: {{ req.partyNIF }}
                    }
                  </div>
                </app-detail-field>
                <app-detail-field label="Solicitud Origen">
                  <a 
                    [routerLink]="['/requests', sim.requestId]" 
                    class="text-primary-600 hover:underline font-mono text-sm inline-flex items-center gap-1"
                  >
                    <i class="pi pi-external-link text-xs"></i>
                    {{ sim.requestId }}
                  </a>
                </app-detail-field>
                <app-detail-field label="Identificador de Simulación">
                  <span class="font-mono text-sm text-surface-600">{{ sim.simulationId }}</span>
                </app-detail-field>
                <app-detail-field label="Scoring Base de Referencia">
                  <a 
                    [routerLink]="['/requests', sim.requestId, 'scoring']" 
                    class="text-primary-600 hover:underline font-mono text-sm inline-flex items-center gap-1"
                  >
                    <i class="pi pi-external-link text-xs"></i>
                    {{ sim.baseScoringId }}
                  </a>
                </app-detail-field>
              </div>
            </ng-template>
          </p-card>
          <app-amortization-chart [amortization]="amortizationConfig()" />
        </div>
        <!-- Panel Derecho: Comparativa y Acciones -->
        <div class="space-y-6 sticky top-6">
          
          <p-card styleClass="rounded-xl shadow-sm border-t-4 border-t-primary-500 transition-all duration-300 hover:shadow-md">
            <ng-template pTemplate="title">
              <span class="text-surface-900 font-semibold">Comparativa Guardada</span>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="space-y-4">
                <div class="grid grid-cols-4 gap-3 text-sm">
                  <div class="font-medium text-surface-600 pl-2">Métrica</div>
                  <div class="text-center font-medium text-surface-600">Base</div>
                  <div class="text-center font-medium text-surface-900">Simulado</div>
                  <div class="text-center font-medium text-surface-600">Diferencia</div>
                </div>
                @for (metric of metricRows(); track metric.label) {
                  @if (!metric.hidden) {
                    <div class="grid grid-cols-4 gap-3 items-center p-3 bg-surface-50 rounded-lg group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:bg-white border border-transparent hover:border-surface-200">
                      <div class="font-medium text-surface-700 truncate group-hover:text-primary-600 transition-colors" [title]="metric.label">{{ metric.label }}</div>
                      <div class="text-right font-mono text-surface-700">{{ metric.base | metricValue:metric }}</div>
                      <div class="text-right font-mono font-semibold text-surface-900">{{ metric.sim | metricValue:metric }}</div>
                      <div class="flex justify-end">
                        <app-delta-chip
                          [value]="metric.delta"
                          [isCurrency]="metric.isCurrency"
                          [invertColor]="metric.invert"
                        />
                      </div>
                    </div>
                  }
                }
                <app-simulation-chart [metrics]="metricRows()" />
                <p-divider />
                <div class="flex items-center justify-between">
                  <span class="text-surface-500">Decisión simulada</span>
                  <app-status-badge [status]="sim.simulatedDecision" />
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-surface-500">Nota de riesgo simulada</span>
                  <p-tag [value]="sim.simulatedRiskGrade" [severity]="simRiskSeverity()" />
                </div>
                <p-divider />
                <div class="flex flex-col gap-3">
                  <p-button
                    label="Volver a simular escenario"
                    icon="pi pi-refresh"
                    styleClass="w-full"
                    [routerLink]="['/requests', sim.requestId, 'simulate']"
                  />
                  <p-button
                    label="Volver a simulaciones"
                    icon="pi pi-arrow-left"
                    styleClass="w-full"
                    [outlined]="true"
                    routerLink="/simulations"
                  />
                </div>
              </div>
            </ng-template>
          </p-card>
          
        </div>
      </div>
    }
  `
})
export class SimulationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(SimulationService);
  private requestService = inject(RequestService);
  private scoringService = inject(ScoringService);
  simulation = signal<SimulationDetails | undefined>(undefined);
  request = signal<RequestDetails | undefined>(undefined);
  party = signal<RequestParty | undefined>(undefined);
  scoring = signal<Scoring | undefined>(undefined);
  isLoading = signal(true);
  fields = computed<DynamicField[]>(() => this.buildFields(this.simulation()?.formChanges));
  readonly employmentOptions = employmentStatusOptions;
  metricRows = computed(() => {
    const sim = this.simulation();
    const s = this.scoring();
    if (!sim || !s) return [];
    const simResults = sim.simulatedResults;
    const delta = sim.delta;
    return [
      { label: 'PD (%)', base: s.pd * 100, sim: (sim.simulatedPd ?? 0) * 100, delta: (delta?.pdChange ?? 0) * 100, isCurrency: false, invert: true, format: '1.2-2' },
      { label: 'LGD (%)', base: s.lgd * 100, sim: (sim.simulatedLgd ?? 0) * 100, delta: (delta?.lgdChange ?? 0) * 100, isCurrency: false, invert: true, format: '1.2-2' },
      { label: 'EAD', base: s.ead, sim: sim.simulatedEad ?? 0, delta: delta?.eadChange ?? 0, isCurrency: true, invert: true },
      { label: 'ECL', base: s.ecl, sim: sim.simulatedEcl ?? 0, delta: delta?.eclChange ?? 0, isCurrency: true, invert: true },
      {
        label: 'Cuota mensual',
        base: s.monthlyPayment,
        sim: simResults?.monthlyPayment ?? 0,
        delta: delta?.monthlyPaymentChange ?? 0,
        isCurrency: true,
        invert: true,
        hidden: !simResults
      },
      {
        label: 'DTI (%)',
        base: s.dti * 100,
        sim: (simResults?.dti ?? 0) * 100,
        delta: (delta?.dtiChange ?? 0) * 100,
        isCurrency: false,
        invert: true,
        format: '1.2-2',
        hidden: !simResults
      },
      {
        label: 'Pago total',
        base: s.totalPayment,
        sim: simResults?.totalPayment ?? 0,
        delta: delta?.totalPaymentChange ?? 0,
        isCurrency: true,
        invert: true,
        hidden: !simResults
      },
      {
        label: 'Intereses totales',
        base: s.totalInterest,
        sim: simResults?.totalInterest ?? 0,
        delta: delta?.totalInterestChange ?? 0,
        isCurrency: true,
        invert: true,
        hidden: !simResults
      },
      {
        label: 'Ingreso disponible',
        base: s.monthlyDisposableIncome,
        sim: simResults?.disposableIncome ?? 0,
        delta: delta?.monthlyDisposableIncomeChange ?? 0,
        isCurrency: true,
        invert: false,
        hidden: !simResults
      }
    ];
  });
  amortizationConfig = computed(() => {
    const req = this.request();
    const score = this.scoring();
    const sim = this.simulation();
    if (!req || !score || !sim) return null;
    const basePrincipal = req.requestedAmount ?? req.requestedCreditLimit ?? score.ead;
    const baseRate = req.interestRate ?? 0;
    const baseMonths = req.requestTermMonths ?? 12;
    const simForm = sim.formChanges;
    const simPrincipal = (simForm['loanAmount'] as number) ?? (simForm['creditLimit'] as number) ?? basePrincipal;
    const simRate = (simForm['interestRate'] as number) ?? baseRate;
    const simMonths = (simForm['termMonths'] as number) ?? baseMonths;
    const simPayment = sim.simulatedResults?.monthlyPayment ?? 0;
    return {
      base: { principal: basePrincipal, rate: baseRate, months: baseMonths, payment: score.monthlyPayment, ecl: score.ecl },
      sim: sim.simulatedResults ? { principal: simPrincipal, rate: simRate, months: simMonths, payment: simPayment, ecl: sim.simulatedResults.ecl } : null
    };
  });
  simRiskSeverity = computed<TagSeverity>(() => {
    const grade = this.simulation()?.simulatedRiskGrade ?? '';
    if (['A', 'B', 'C'].includes(grade)) return 'success';
    if (['D', 'E'].includes(grade)) return 'warn';
    return 'danger';
  });
  constructor() {
  }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/simulations']);
      return;
    }
    this.simulationService.get(id).subscribe({
      next: sim => {
        this.simulation.set(sim);
        // Cargar concurrentemente los datos de la solicitud, cliente y scoring
        forkJoin({
          request: this.requestService.get(sim.requestId),
          party: this.requestService.getParty(sim.requestId),
          scoring: this.scoringService.getByRequest(sim.requestId)
        }).subscribe({
          next: ({ request, party, scoring }) => {
            this.request.set(request);
            this.party.set(party);
            this.scoring.set(scoring);
            this.isLoading.set(false);
          },
          error: () => {
            // Si hay problemas al obtener la solicitud, desactivar loading igualmente con fallback
            this.isLoading.set(false);
          }
        });
      },
      error: () => this.router.navigate(['/simulations'])
    });
  }
  private buildFields(formChanges: Record<string, unknown> | undefined): DynamicField[] {
    const req = this.request();
    if (!req) return [];
    
    const requestType = req.requestType ?? 'PRESTAMO';
    const getValue = (key: string, sourceKey?: string) => {
      const reqVal = ((req as unknown) as Record<string, unknown>)[sourceKey ?? key];
      return formChanges ? (formChanges[key] ?? formChanges[sourceKey ?? key] ?? reqVal) : reqVal;
    };
    const common: DynamicField[] = [
      { key: 'employmentStatus', sourceKey: 'partyLaboralSituation', label: 'Situación laboral', type: 'select', options: this.employmentOptions, value: getValue('employmentStatus', 'partyLaboralSituation') },
      { key: 'annualIncome', sourceKey: 'partyIncome', label: 'Ingresos anuales', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('annualIncome', 'partyIncome') }
    ];
    switch (requestType) {
      case 'TARJETA_CREDITO':
        return [
          { key: 'creditLimit', sourceKey: 'requestedCreditLimit', label: 'Límite de crédito', type: 'number', prefix: '€ ', validators: { min: 0, step: 100 }, value: getValue('creditLimit', 'requestedCreditLimit') },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: getValue('interestRate') },
          { key: 'isRevolving', sourceKey: 'isRevolving', label: 'Revolving', type: 'boolean', value: getValue('isRevolving') ?? false },
          ...common
        ];
      case 'HIPOTECA':
        return [
          { key: 'loanAmount', sourceKey: 'requestedAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('loanAmount', 'requestedAmount') },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', validators: { min: 1, step: 12 }, value: getValue('termMonths', 'requestTermMonths') },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: getValue('interestRate') },
          { key: 'propertyValue', sourceKey: 'propertyValue', label: 'Valor de la propiedad', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('propertyValue') },
          { key: 'hasMortgage', label: 'Tiene otra hipoteca', type: 'boolean', value: getValue('hasMortgage') ?? false },
          ...common
        ];
      default:
        return [
          { key: 'loanAmount', sourceKey: 'requestedAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('loanAmount', 'requestedAmount') },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', validators: { min: 1, step: 12 }, value: getValue('termMonths', 'requestTermMonths') },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: getValue('interestRate') },
          ...common
        ];
    }
  }
}
