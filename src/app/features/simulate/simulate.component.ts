import { Component, OnInit, computed, effect, inject, signal , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { RequestService } from '../../core/services/request.service';
import { SimulationService } from '../../core/services/simulation.service';
import { ScoringService } from '../../core/services/scoring.service';
import { RequestDetails, RequestParty } from '../../core/models/request.model';
import { Scoring } from '../../core/models/scoring.model';
import {
  DraftResponse,
  SimulationMetrics,
  CreateSimulationPayload
} from '../../core/models/simulation.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DeltaChipComponent } from '../../shared/ui/delta-chip/delta-chip.component';
import { MetricValuePipe } from '../../shared/pipes/metric-value.pipe';
import { RequestTypeLabelPipe } from '../../shared/pipes/request-type-label.pipe';
import { DynamicFormMapper } from '../../core/mappers/dynamic-form.mapper';
import { SimulationMetricsMapper } from '../../core/mappers/simulation-metrics.mapper';
import { SimulationChartComponent } from '../../shared/ui/simulation-chart/simulation-chart.component';
import { AmortizationChartComponent } from '../../shared/ui/amortization-chart/amortization-chart.component';
import { DynamicFormComponent } from '../../shared/ui/dynamic-form/dynamic-form.component';
import { DynamicField } from '../../shared/models/dynamic-form.model';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-simulate',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    TagModule,
    PageHeaderComponent,
    DeltaChipComponent,
    MetricValuePipe,
    RequestTypeLabelPipe,
    SimulationChartComponent,
    AmortizationChartComponent,
    DynamicFormComponent,
    SpinnerComponent
  ],
  template: `
    <app-page-header title="Simular escenario" [subtitle]="'Solicitud ' + requestId()" />
    @if (isLoading()) {
      <app-spinner height="calc(100vh - 100px)"></app-spinner>
    } @else {
      @let req = request()!;
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="space-y-6">
          <p-card styleClass="rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
          <ng-template pTemplate="title">
            <div class="flex items-center justify-between text-surface-900 font-semibold">
              <span>Variables a modificar</span>
              <span class="text-sm text-surface-500">{{ req.requestType | requestTypeLabel }}</span>
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <app-dynamic-form
              [fields]="fields()"
              submitLabel="Recalcular"
              (formSubmit)="recalculate($event)"
            />
          </ng-template>
        </p-card>
        @if (draft()) {
          <app-amortization-chart [amortization]="amortizationConfig()" />
        }
      </div>
      <p-card styleClass="rounded-xl shadow-sm h-fit sticky top-6 border-t-4 border-t-primary-500 transition-all duration-300 hover:shadow-md">
          <ng-template pTemplate="title">
            <span class="text-surface-900 font-semibold">Comparativa con scoring base</span>
          </ng-template>
          <ng-template pTemplate="content">
            @if (draft(); as d) {
              <div class="space-y-4">
                <div class="grid grid-cols-4 gap-3 text-sm">
                  <div class="font-medium text-surface-600 pl-2">Métrica</div>
                  <div class="text-center font-medium text-surface-600">Base</div>
                  <div class="text-center font-medium text-surface-900">Simulado</div>
                  <div class="text-center font-medium text-surface-600">Diferencia</div>
                </div>
                @for (metric of metricRows(); track metric.label) {
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
                <app-simulation-chart [metrics]="metricRows()" />
                <p-divider />
                <div class="flex items-center justify-between">
                  <span class="text-surface-500">Nota de riesgo simulada</span>
                  <p-tag [value]="d.simulatedResults.riskGrade" [severity]="simRiskSeverity()" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700">Nombre del escenario</label>
                  <input
                    pInputText
                    type="text"
                    [formControl]="scenarioNameControl"
                    placeholder="Simulación personalizada"
                    class="w-full"
                  />
                </div>
                <p-button
                  label="Guardar escenario"
                  icon="pi pi-save"
                  styleClass="w-full"
                  [disabled]="isSaving()"
                  (onClick)="persist()"
                />
                @if (errorMessage()) {
                  <div class="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{{ errorMessage() }}</div>
                }
              </div>
            } @else {
              <p class="text-surface-500 text-center py-8">
                Modifica las variables y pulsa <strong>Recalcular</strong> para ver la comparativa.
              </p>
            }
          </ng-template>
        </p-card>
      </div>
    }
  `
})
/**
 * Smart Component responsible for the "What-If" simulation workflow.
 * Allows users to tweak financial variables of a request, preview the risk impact via a 'draft' API call,
 * and persist the scenario if desired.
 */
export class SimulateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);
  private simulationService = inject(SimulationService);
  private scoringService = inject(ScoringService);
  private messageService = inject(MessageService);
  requestId = signal('');
  request = signal<RequestDetails | undefined>(undefined);
  party = signal<RequestParty | undefined>(undefined);
  scoring = signal<Scoring | undefined>(undefined);
  draft = signal<DraftResponse | undefined>(undefined);
  isSaving = signal(false);
  isLoading = signal(true);
  errorMessage = signal<string | undefined>(undefined);
  
  // Guardamos el último submit del formulario para poder construir el amortizationConfig y para persistir
  lastFormValues = signal<any>({});
  scenarioNameControl = new FormControl('', Validators.required);
  
  /** Dynamic form fields generated based on the specific request type */
  fields = computed<DynamicField[]>(() => DynamicFormMapper.buildFields(this.request()));
  
  /** 
   * Computes the rows for the comparison table (Base vs Sim). 
   * Reactively updates whenever scoring or draft signals change.
   */
  metricRows = computed(() => {
    const s = this.scoring();
    const d = this.draft();
    if (!s || !d) return [];
    return SimulationMetricsMapper.buildMetricRows(s, d);
  });

  amortizationConfig = computed(() => {
    const req = this.request();
    const score = this.scoring();
    const draft = this.draft();
    if (!req || !score) return null;
    return SimulationMetricsMapper.buildAmortizationConfig(req, score, this.lastFormValues(), draft?.simulatedResults);
  });

  simRiskSeverity = computed(() => {
    return SimulationMetricsMapper.getRiskSeverity(this.draft()?.simulatedResults.riskGrade);
  });
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/requests']);
      return;
    }
    this.requestId.set(id);
    forkJoin({
      request: this.requestService.get(id),
      party: this.requestService.getParty(id),
      scoring: this.scoringService.getByRequest(id)
    }).subscribe({
      next: ({ request, party, scoring }) => {
        this.request.set(request);
        this.party.set(party);
        this.scoring.set(scoring);
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/requests', id])
    });
  }

  /**
   * Triggers a 'draft' simulation calculation.
   * Validates if variables were actually modified to prevent redundant API calls.
   * 
   * @param formValues The current values from the dynamic form.
   */
  recalculate(formValues: any) {
    this.lastFormValues.set(formValues);
    this.errorMessage.set(undefined);
    
    // Validate that at least one field has changed from its initial value
    // This optimization avoids unnecessary backend processing if the user clicks "Recalcular" without tweaking anything.
    let hasChanges = false;
    const initialFields = this.fields();
    for (const field of initialFields) {
      const formVal = formValues[field.key] == null ? '' : String(formValues[field.key]);
      const initialVal = field.value == null ? '' : String(field.value);
      if (formVal !== initialVal) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin cambios',
        detail: 'No se ha modificado ninguna de las variables para el cálculo de la simulación.',
        life: 4000
      });
      return;
    }
    if (this.request()?.requestType === 'HIPOTECA' && formValues['loanAmount'] !== undefined && formValues['propertyValue'] !== undefined) {
      if (formValues['loanAmount'] > formValues['propertyValue']) {
        this.errorMessage.set('El importe del préstamo no puede superar el valor de la propiedad (LTV > 100%).');
        return;
      }
    }
    const payload = {
      requestId: this.requestId(),
      requestType: this.request()?.requestType ?? 'PRESTAMO',
      formChanges: this.formatFormChanges(formValues)
    };
    this.simulationService.draft(payload).subscribe({
      next: res => this.draft.set(res),
      error: err => this.errorMessage.set(err?.message ?? 'Error al calcular la simulación.')
    });
  }
  /**
   * Persists the current draft simulation as a permanent record.
   * It infers the final decision (APPROVED, REJECTED) based on the simulated risk grade.
   */
  persist() {
    const req = this.request();
    const party = this.party();
    const score = this.scoring();
    const d = this.draft();
    if (!req || !party || !score || !d) return;
    let name = this.scenarioNameControl.value?.trim();
    if (!name) {
      const now = new Date();
      const date = now.toLocaleDateString('es-ES');
      const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      name = `Simulación ${date} ${time}`;
    }
    this.isSaving.set(true);
    this.errorMessage.set(undefined);
    const payload: CreateSimulationPayload = {
      scenarioName: name,
      requestId: req.requestId,
      partyId: party.partyId,
      baseScoringId: score.scoringId,
      formChanges: this.formatFormChanges(this.lastFormValues()),
      simulatedResults: {
        ...d.simulatedResults,
        decision: this.inferDecision(d.simulatedResults)
      },
      delta: d.delta
    };
    this.simulationService.create(payload).subscribe({
      next: () => this.router.navigate(['/simulations']),
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.message ?? 'No se pudo guardar la simulación.');
      }
    });
  }
  private inferDecision(sim: SimulationMetrics): string {
    const grade = sim.riskGrade;
    if (['A', 'B', 'C', 'D'].includes(grade)) return 'APROBADO';
    if (['E', 'F'].includes(grade)) return 'PENDIENTE_DE_REVISION';
    return 'RECHAZADO';
  }
  private formatFormChanges(rawValues: any): any {
    return { ...rawValues };
  }
}
