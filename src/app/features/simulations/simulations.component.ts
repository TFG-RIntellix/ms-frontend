import { Component, OnInit, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SimulationService, SimulationListFilter } from '../../core/services/simulation.service';
import { SimulationSummary } from '../../core/models/simulation.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { TableStateManager } from '../../shared/classes/table-state.manager';

/**
 * Smart Component for the Simulations listing view.
 * Handles pagination, sorting, search, and archiving filters via TableStateManager.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-simulations',
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
    SpinnerComponent,
    TooltipModule
  ],
  template: `
    <app-page-header
      title="Simulaciones"
      subtitle="Escenarios guardados por los analistas"
    />
    <p-card styleClass="rounded-xl shadow-sm">
      <ng-template pTemplate="content">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
          <div class="relative w-full sm:w-80">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"></i>
            <input
              pInputText
              type="text"
              [formControl]="searchControl"
              placeholder="Buscar cliente o solicitud"
              class="w-full !pl-10"
            />
          </div>
          <p-selectButton
            [options]="statusOptions"
            [formControl]="archivedControl"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full sm:w-auto"
          />
        </div>
        @if(!hasLoadedOnce()) {
          <app-spinner height="400px"></app-spinner>
        } @else {
          <p-table
          #dt
          [value]="simulations()"
          [paginator]="true"
          [first]="firstOffset()"
          [rows]="pageSize()"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="tableState.onLazyLoad($event)"
          [rowsPerPageOptions]="[10, 25, 50]"
          responsiveLayout="stack"
          breakpoint="960px"
          [tableStyle]="{'min-width':'50rem'}"
          styleClass="p-datatable-sm"
          [rowHover]="true"
          >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="scenarioName" class="font-semibold">Nombre 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-alpha-down text-primary-500': dt.sortField === 'scenarioName' && dt.sortOrder === 1, 'pi-sort-alpha-up text-primary-500': dt.sortField === 'scenarioName' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'scenarioName'}"></i>
              </th>
              <th class="font-semibold">Cliente</th>
              <th pSortableColumn="requestId" class="font-semibold">Solicitud 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-numeric-down text-primary-500': dt.sortField === 'requestId' && dt.sortOrder === 1, 'pi-sort-numeric-up text-primary-500': dt.sortField === 'requestId' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'requestId'}"></i>
              </th>
              <th pSortableColumn="simulationDate" class="font-semibold">Fecha 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-numeric-down text-primary-500': dt.sortField === 'simulationDate' && dt.sortOrder === 1, 'pi-sort-numeric-up text-primary-500': dt.sortField === 'simulationDate' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'simulationDate'}"></i>
              </th>
              <th style="width: 8rem; text-align: center;" class="font-semibold">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sim>
            <tr [routerLink]="['/simulations', sim.simulationId]" class="cursor-pointer group hover:bg-white hover:shadow-sm transition-all duration-300">
              <td class="font-medium text-surface-900">{{ sim.scenarioName }}</td>
              <td>{{ sim.partyName }}</td>
              <td class="font-mono text-surface-600">{{ sim.requestCode || sim.requestId }}</td>
              <td class="text-surface-500 text-sm">{{ sim.simulationDate | date:'dd/MM/yyyy' }}</td>
              <td style="text-align: center;">
                <div class="flex flex-wrap justify-center gap-1">
                  <p-button
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    [icon]="sim.isArchived ? 'pi pi-refresh' : 'pi pi-folder'"
                    [pTooltip]="sim.isArchived ? 'Desarchivar' : 'Archivar'"
                    tooltipPosition="top"
                    (onClick)="toggleArchive(sim); $event.stopPropagation()"
                  />
                  @if (sim.isArchived) {
                    <p-button
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      icon="pi pi-trash"
                      pTooltip="Eliminar"
                      tooltipPosition="top"
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
  `
})
export class SimulationsComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  archivedControl = new FormControl<boolean | null>(false);
  requestIdQueryParam = '';

  statusOptions = [
    { label: 'Activas', value: false },
    { label: 'Archivadas', value: true },
    { label: 'Todas', value: null }
  ];

  /** 
   * Orchestrates the PrimeNG table state, syncing pagination/sorting/filtering 
   * with the URL and triggering the API fetch automatically.
   */
  tableState = new TableStateManager<SimulationSummary, SimulationListFilter>({
    router: this.router,
    route: this.route,
    defaultSortField: 'simulationDate',
    defaultSortOrder: -1,
    fetchFn: (filters) => this.simulationService.list(filters),
    buildFilters: (page, size, sortField, sortOrder) => ({
      search: this.searchControl.value || undefined,
      archived: this.archivedControl.value !== null ? this.archivedControl.value : undefined,
      page,
      size,
      sortBy: sortField,
      sortDir: sortOrder === 1 ? 'asc' : 'desc'
    }),
    updateUrlParams: (first, size) => ({
      search: this.searchControl.value || null,
      archived: this.archivedControl.value !== null ? String(this.archivedControl.value) : null,
      first: first.toString(),
      rows: size.toString()
    })
  });

  simulations = this.tableState.data;
  totalRecords = this.tableState.totalRecords;
  pageSize = this.tableState.pageSize;
  firstOffset = this.tableState.firstOffset;
  hasLoadedOnce = this.tableState.hasLoadedOnce;

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.tableState.resetToFirstPage();
    });
    this.archivedControl.valueChanges.subscribe(() => {
      this.tableState.resetToFirstPage();
    });
  }

  ngOnInit() {
    this.requestIdQueryParam = this.route.snapshot.queryParamMap.get('requestId') || '';
    const search = this.route.snapshot.queryParamMap.get('search') || '';
    
    if (search || this.requestIdQueryParam) {
      this.searchControl.setValue(search || this.requestIdQueryParam, { emitEvent: false });
    }
    const archivedStr = this.route.snapshot.queryParamMap.get('archived');
    if (archivedStr !== null) {
      this.archivedControl.setValue(archivedStr === 'true' ? true : (archivedStr === 'false' ? false : null), { emitEvent: false });
    }

    this.tableState.connect().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.tableState.triggerLoad();
  }

  /**
   * Toggles the archived state of a simulation.
   * 
   * @param sim The simulation summary to archive or restore.
   */
  toggleArchive(sim: SimulationSummary) {
    this.simulationService.archive(sim.simulationId, !sim.isArchived).subscribe({
      next: () => this.reload(),
      error: () => alert('No se pudo actualizar el estado.')
    });
  }
  /**
   * Prompts the user for confirmation, then permanently deletes a simulation.
   * 
   * @param sim The simulation to delete.
   */
  deleteSimulation(sim: SimulationSummary) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar permanentemente la simulación "${sim.scenarioName}"?`,
      header: 'Confirmar borrado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.simulationService.delete(sim.simulationId).subscribe({
          next: () => {
            this.reload();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Simulación eliminada correctamente'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la simulación'
            });
          }
        });
      }
    });
  }
  private reload() {
    this.tableState.triggerLoad();
  }
}
