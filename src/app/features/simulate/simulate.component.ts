import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
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
import { employmentStatusOptions } from '../../core/utils/labels';
import { TagSeverity } from '../../core/utils/tag-severity';

interface SimField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  options?: { value: string; label: string }[];
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  sourceKey?: string;
}

@Component({
  selector: 'app-simulate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    DividerModule,
    TagModule,
    PageHeaderComponent,
    DeltaChipComponent,
    MetricValuePipe,
    RequestTypeLabelPipe
  ],
  template: `
    <app-page-header title="Simular escenario" [subtitle]="'Solicitud ' + requestId()" />

    @if (isLoading()) {
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <p-card styleClass="rounded-xl shadow-sm">
          <ng-template pTemplate="title">
            <div class="h-4 w-48 bg-surface-200 rounded animate-pulse"></div>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="space-y-4">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="space-y-2">
                  <div class="h-3 w-32 bg-surface-200 rounded animate-pulse"></div>
                  <div class="h-10 w-full bg-surface-200 rounded animate-pulse"></div>
                </div>
              }
              <div class="h-10 w-full bg-primary-200 rounded animate-pulse mt-4"></div>
            </div>
          </ng-template>
        </p-card>
        <p-card styleClass="rounded-xl shadow-sm">
          <ng-template pTemplate="title">
            <div class="h-4 w-56 bg-surface-200 rounded animate-pulse"></div>
          </ng-template>
          <ng-template pTemplate="content">
            <p class="text-surface-400 text-center py-8">Modifica las variables y pulsa <strong>Recalcular</strong> para ver la comparativa.</p>
          </ng-template>
        </p-card>
      </div>
    } @else {
      @let req = request()!;
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <p-card styleClass="rounded-xl shadow-sm">
          <ng-template pTemplate="title">
            <div class="flex items-center justify-between text-surface-900 font-semibold">
              <span>Variables a modificar</span>
              <span class="text-sm text-surface-500">{{ req.requestType | requestTypeLabel }}</span>
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <form [formGroup]="form" (ngSubmit)="recalculate()" class="space-y-4">
              @for (field of fields(); track field.key) {
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-surface-700">{{ field.label }}</label>

                  @switch (field.type) {
                    @case ('number') {
                      <p-inputNumber
                        [formControlName]="field.key"
                        [suffix]="field.suffix ?? ''"
                        [prefix]="field.prefix ?? ''"
                        [min]="field.min ?? 0"
                        [max]="field.max"
                        [step]="field.step"
                        [minFractionDigits]="0"
                        [maxFractionDigits]="4"
                        mode="decimal"
                        class="w-full"
                        styleClass="w-full"
                      />
                    }
                    @case ('select') {
                      <p-dropdown
                        [formControlName]="field.key"
                        [options]="field.options ?? []"
                        optionLabel="label"
                        optionValue="value"
                        styleClass="w-full"
                        [placeholder]="'Seleccionar ' + field.label.toLowerCase()"
                      />
                    }
                    @case ('boolean') {
                      <label class="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          [formControlName]="field.key"
                          class="w-5 h-5 rounded border-surface-300 accent-primary-500"
                        />
                        <span class="text-sm text-surface-600">Sí</span>
                      </label>
                    }
                    @case ('text') {
                      <input
                        pInputText
                        type="text"
                        [formControlName]="field.key"
                        class="w-full p-inputtext p-component"
                      />
                    }
                  }
                </div>
              }

              <div class="flex gap-3 pt-2">
                <p-button
                  type="submit"
                  label="Recalcular"
                  icon="pi pi-refresh"
                  styleClass="w-full"
                />
              </div>
            </form>
          </ng-template>
        </p-card>

        <p-card styleClass="rounded-xl shadow-sm">
          <ng-template pTemplate="title">
            <span class="text-surface-900 font-semibold">Comparativa con scoring base</span>
          </ng-template>
          <ng-template pTemplate="content">
            @if (draft(); as d) {
              <div class="space-y-4">
                <div class="grid grid-cols-3 gap-3 text-sm">
                  <div class="text-center font-medium text-surface-600">Base</div>
                  <div class="text-center font-medium text-surface-900">Simulado</div>
                  <div class="text-center font-medium text-surface-600">Diferencia</div>
                </div>

                @for (metric of metricRows(); track metric.label) {
                  <div class="grid grid-cols-3 gap-3 items-center p-3 bg-surface-50 rounded-lg">
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
export class SimulateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private requestService = inject(RequestService);
  private simulationService = inject(SimulationService);
  private scoringService = inject(ScoringService);

  requestId = signal('');
  request = signal<RequestDetails | undefined>(undefined);
  party = signal<RequestParty | undefined>(undefined);
  scoring = signal<Scoring | undefined>(undefined);
  draft = signal<DraftResponse | undefined>(undefined);
  isSaving = signal(false);
  isLoading = signal(true);
  errorMessage = signal<string | undefined>(undefined);

  form: FormGroup = this.fb.group({});
  scenarioNameControl = new FormControl('', Validators.required);

  fields = computed<SimField[]>(() => this.buildFields(this.request()?.requestType ?? 'PRESTAMO'));

  readonly employmentOptions = employmentStatusOptions;

  metricRows = computed(() => {
    const s = this.scoring();
    const d = this.draft();
    if (!s || !d) return [];
    const sim = d.simulatedResults;
    const delta = d.delta;
    return [
      { label: 'PD (%)', base: s.pd * 100, sim: sim.pd * 100, delta: delta.pdChange, isCurrency: false, invert: false, format: '1.2-2' },
      { label: 'LGD (%)', base: s.lgd * 100, sim: sim.lgd * 100, delta: (sim.lgd - s.lgd) * 100, isCurrency: false, invert: false, format: '1.2-2' },
      { label: 'EAD', base: s.ead, sim: sim.ead, delta: sim.ead - s.ead, isCurrency: true, invert: false },
      { label: 'ECL', base: s.ecl, sim: sim.ecl, delta: delta.eclChange, isCurrency: true, invert: false },
      { label: 'Cuota mensual', base: s.monthlyPayment, sim: sim.monthlyPayment, delta: delta.monthlyPaymentChange, isCurrency: true, invert: false },
      { label: 'DTI (%)', base: s.dti * 100, sim: sim.dti * 100, delta: delta.dtiChange, isCurrency: false, invert: true, format: '1.2-2' },
      { label: 'Pago total', base: s.totalPayment, sim: sim.totalPayment, delta: delta.totalPaymentChange, isCurrency: true, invert: false },
      { label: 'Intereses totales', base: s.totalInterest, sim: sim.totalInterest, delta: delta.totalInterestChange, isCurrency: true, invert: false },
      { label: 'Ingreso disponible', base: s.monthlyDisposableIncome, sim: sim.disposableIncome, delta: delta.monthlyDisposableIncomeChange, isCurrency: true, invert: true }
    ];
  });

  simRiskSeverity = computed<TagSeverity>(() => {
    const grade = this.draft()?.simulatedResults.riskGrade ?? '';
    if (['A', 'B', 'C'].includes(grade)) return 'success';
    if (['D', 'E'].includes(grade)) return 'warn';
    return 'danger';
  });

  constructor() {
    effect(() => {
      const req = this.request();
      if (req) {
        this.resetForm(req);
      }
    });
  }

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

  private buildFields(requestType: string): SimField[] {
    const common: SimField[] = [
      { key: 'employmentStatus', sourceKey: 'partyLaboralSituation', label: 'Situación laboral', type: 'select', options: this.employmentOptions },
      { key: 'annualIncome', sourceKey: 'partyIncome', label: 'Ingresos anuales', type: 'number', prefix: '€ ', min: 0, step: 1000 }
    ];

    switch (requestType) {
      case 'TARJETA_CREDITO':
        return [
          { key: 'creditLimit', sourceKey: 'requestedCreditLimit', label: 'Límite de crédito', type: 'number', prefix: '€ ', min: 0, step: 100 },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', min: 0, max: 100, step: 0.01 },
          { key: 'isRevolving', sourceKey: 'isRevolving', label: 'Revolving', type: 'boolean' },
          ...common
        ];
      case 'HIPOTECA':
        return [
          { key: 'loanAmount', sourceKey: 'requestedAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', min: 0, step: 1000 },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', min: 1, step: 12 },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', min: 0, max: 100, step: 0.01 },
          { key: 'propertyValue', sourceKey: 'propertyValue', label: 'Valor de la propiedad', type: 'number', prefix: '€ ', min: 0, step: 1000 },
          { key: 'hasMortgage', label: 'Tiene otra hipoteca', type: 'boolean' },
          ...common
        ];
      default:
        return [
          { key: 'loanAmount', sourceKey: 'requestedAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', min: 0, step: 1000 },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', min: 1, step: 12 },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', min: 0, max: 100, step: 0.01 },
          ...common
        ];
    }
  }

  private resetForm(req: RequestDetails) {
    this.form = this.fb.group({});
    for (const field of this.fields()) {
      const source = field.sourceKey ?? field.key;
      const value = ((req as unknown) as Record<string, unknown>)[source];
      const control = this.fb.control(
        value ?? (field.type === 'boolean' ? false : value ?? null),
        field.type === 'number' ? Validators.min(field.min ?? 0) : undefined
      );
      this.form.addControl(field.key, control);
    }
  }

  recalculate() {
    if (this.form.invalid) return;
    this.errorMessage.set(undefined);
    const payload = {
      requestId: this.requestId(),
      requestType: this.request()?.requestType ?? 'PRESTAMO',
      formChanges: this.formatFormChanges(this.form.value)
    };
    this.simulationService.draft(payload).subscribe({
      next: res => this.draft.set(res),
      error: err => this.errorMessage.set(err?.message ?? 'Error al calcular la simulación.')
    });
  }

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
      formChanges: this.formatFormChanges(this.form.value),
      simulatedPd: d.simulatedResults.pd,
      simulatedLgd: d.simulatedResults.lgd,
      simulatedEad: d.simulatedResults.ead,
      simulatedEcl: d.simulatedResults.ecl,
      simulatedRiskGrade: d.simulatedResults.riskGrade,
      simulatedDecision: this.inferDecision(d.simulatedResults),
      pdChange: d.delta.pdChange,
      elChange: d.delta.eclChange,
      riskGradeChange: d.delta.riskGradeChange
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
