import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, catchError } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';

import { SimulationService, SimulationListFilter } from '../../core/services/simulation.service';
import { SimulationSummary } from '../../core/models/simulation.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-simulations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    SelectButtonModule,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  template: `
    <app-page-header
      title="Simulaciones"
      subtitle="Escenarios guardados por los analistas"
    />

    <p-card styleClass="rounded-xl shadow-sm">
      <ng-template pTemplate="content">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
          <span class="p-input-icon-left w-full sm:w-80">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [formControl]="searchControl"
              placeholder="Buscar cliente o solicitud"
              class="w-full"
            />
          </span>

          <p-selectButton
            [options]="statusOptions"
            [formControl]="archivedControl"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full sm:w-auto"
          />
        </div>

        @if(!hasLoadedOnce()) {
          <div class="flex justify-center items-center min-h-[400px]">
            <div class="rintellix-spinner"></div>
          </div>
        } @else {
          <p-table
          [value]="simulations()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          [tableStyle]="{'min-width':'50rem'}"
          styleClass="p-datatable-sm"
          >

          <ng-template pTemplate="header">
            <tr>
              <th>Nombre</th>
              <th>Cliente</th>
              <th>Solicitud</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-sim>
            <tr [routerLink]="['/simulations', sim.simulationId]" class="cursor-pointer hover:bg-surface-50 transition-colors">
              <td class="font-medium text-surface-900">{{ sim.scenarioName }}</td>
              <td>{{ sim.partyName }}</td>
              <td class="font-mono text-surface-600">{{ sim.requestId }}</td>
              <td class="text-surface-500 text-sm">{{ sim.simulationDate | date:'dd/MM/yyyy' }}</td>
              <td>
                <!-- TODO: Eliminar la logica de aprobado/rechazado al menos así -->
                <app-status-badge [status]="sim.isArchived ? 'RECHAZADO' : 'APROBADO'" />
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <p-button
                    [outlined]="true"
                    [icon]="sim.isArchived ? 'pi pi-refresh' : 'pi pi-folder'"
                    [label]="sim.isArchived ? 'Desarchivar' : 'Archivar'"
                    (onClick)="toggleArchive(sim); $event.stopPropagation()"
                  />
                  @if (sim.isArchived) {
                    <p-button
                      severity="danger"
                      [outlined]="true"
                      icon="pi pi-trash"
                      label="Eliminar"
                      (onClick)="deleteSimulation(sim); $event.stopPropagation()"
                    />
                  }
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
        }
      </ng-template>
    </p-card>
  `
})
export class SimulationsComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private route = inject(ActivatedRoute);

  simulations = signal<SimulationSummary[]>([]);
  isLoading = signal(false);
  hasLoadedOnce = signal(false);

  searchControl = new FormControl('');
  archivedControl = new FormControl<boolean | null>(false);
  refreshTrigger$ = new BehaviorSubject<void>(undefined);
  requestIdQueryParam = '';

  statusOptions = [
    { label: 'Activas', value: false },
    { label: 'Archivadas', value: true },
    { label: 'Todas', value: null }
  ];

  ngOnInit() {
    this.requestIdQueryParam = this.route.snapshot.queryParamMap.get('requestId') || '';

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.archivedControl.valueChanges.pipe(startWith(this.archivedControl.value), distinctUntilChanged()),
      this.refreshTrigger$
    ])
      .pipe(
        switchMap(([search, archived]) => {
          this.isLoading.set(true);
          const filters: SimulationListFilter = {
            archived: archived !== null ? archived : undefined
          };
          if (search) {
            filters.search = search;
          }
          return this.simulationService.list(filters);
        })
      )
      .subscribe({
        next: list => {
          this.simulations.set(list);
          this.isLoading.set(false);
          this.hasLoadedOnce.set(true);
        },
        error: () => {
          this.simulations.set([]);
          this.isLoading.set(false);
          this.hasLoadedOnce.set(true);
        }
      });

    if (this.requestIdQueryParam) {
      this.searchControl.setValue(this.requestIdQueryParam, { emitEvent: true });
    }
  }

  toggleArchive(sim: SimulationSummary) {
    this.simulationService.archive(sim.simulationId, !sim.isArchived).subscribe({
      next: () => this.reload(),
      error: () => alert('No se pudo actualizar el estado.')
    });
  }

  deleteSimulation(sim: SimulationSummary) {
    if (confirm(`Eliminar "${sim.scenarioName}"?`)) {
      this.simulationService.delete(sim.simulationId).subscribe({
        next: () => this.reload(),
        error: () => alert('No se pudo eliminar la simulación.')
      });
    }
  }

  private reload() {
    this.refreshTrigger$.next();
  }
}
