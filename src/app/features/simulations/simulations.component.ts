import { Component, OnInit, inject, signal , ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, catchError, skip } from 'rxjs/operators';
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
    StatusBadgeComponent,
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
          (onLazyLoad)="loadSimulations($event)"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          [tableStyle]="{'min-width':'50rem'}"
          styleClass="p-datatable-sm"
          [rowHover]="true"
          >
          <ng-template pTemplate="loadingIcon">
            <app-spinner [overlay]="false"></app-spinner>
          </ng-template>
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
  @ViewChild('dt') table!: Table;
  private simulationService = inject(SimulationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  simulations = signal<SimulationSummary[]>([]);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  firstOffset = signal<number>(0);
  isLoading = signal(false);
  hasLoadedOnce = signal(false);
  searchControl = new FormControl('');
  archivedControl = new FormControl<boolean | null>(false);
  refreshTrigger$ = new BehaviorSubject<void>(undefined);
  requestIdQueryParam = '';
  private initialLoadDone = false;
  statusOptions = [
    { label: 'Activas', value: false },
    { label: 'Archivadas', value: true },
    { label: 'Todas', value: null }
  ];
  ngOnInit() {
    this.requestIdQueryParam = this.route.snapshot.queryParamMap.get('requestId') || '';
    
    const firstStr = this.route.snapshot.queryParamMap.get('first');
    if (firstStr) this.firstOffset.set(parseInt(firstStr, 10));
    const rowsStr = this.route.snapshot.queryParamMap.get('rows');
    if (rowsStr) this.pageSize.set(parseInt(rowsStr, 10));

    const search = this.route.snapshot.queryParamMap.get('search') || '';
    if (search || this.requestIdQueryParam) {
      this.searchControl.setValue(search || this.requestIdQueryParam, { emitEvent: false });
    }
    const archivedStr = this.route.snapshot.queryParamMap.get('archived');
    if (archivedStr !== null) {
      this.archivedControl.setValue(archivedStr === 'true' ? true : (archivedStr === 'false' ? false : null), { emitEvent: false });
    }

    // Filter changes reset to page 0
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(300), distinctUntilChanged()),
      this.archivedControl.valueChanges.pipe(startWith(this.archivedControl.value), distinctUntilChanged())
    ]).pipe(skip(1)).subscribe(() => {
      if (this.table) this.table.first = 0;
      this.firstOffset.set(0);
      this.fetchData(0, this.pageSize());
    });

    // Reload keeps current page
    this.refreshTrigger$.pipe(skip(1)).subscribe(() => {
      this.fetchData(this.firstOffset(), this.pageSize());
    });

    // Trigger initial load manually since table is hidden
    this.fetchData(this.firstOffset(), this.pageSize());
  }

  loadSimulations(event: any) {
    if (!this.initialLoadDone) {
      this.initialLoadDone = true;
      return;
    }
    this.isLoading.set(true);
    const first = event.first !== undefined ? event.first : 0;
    const size = event.rows || 10;
    
    this.firstOffset.set(first);
    this.pageSize.set(size);
    this.fetchData(first, size, event.sortField, event.sortOrder);
  }

  private fetchData(first: number, size: number, sortField: string = 'simulationDate', sortOrder: number = -1) {
    this.isLoading.set(true);
    const page = size ? first / size : 0;
    const search = this.searchControl.value || undefined;
    const archived = this.archivedControl.value !== null ? this.archivedControl.value : undefined;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        first, 
        rows: size, 
        search: search || null, 
        archived: archived !== undefined ? String(archived) : null 
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    const filters: SimulationListFilter = { page, size, sortBy: sortField, sortDir: sortOrder === 1 ? 'asc' : 'desc', archived };
    if (search) filters.search = search;

    this.simulationService.list(filters).subscribe({
      next: (response) => {
        this.simulations.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.isLoading.set(false);
        this.hasLoadedOnce.set(true);
      },
      error: () => {
        this.simulations.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
        this.hasLoadedOnce.set(true);
      }
    });
  }
  toggleArchive(sim: SimulationSummary) {
    this.simulationService.archive(sim.simulationId, !sim.isArchived).subscribe({
      next: () => this.reload(),
      error: () => alert('No se pudo actualizar el estado.')
    });
  }
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
    this.refreshTrigger$.next();
  }
}
