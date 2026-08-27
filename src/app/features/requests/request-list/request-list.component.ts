import { Component, ChangeDetectionStrategy, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RequestService, RequestListFilter } from '../../../core/services/request.service';
import { RequestSummary } from '../../../core/models/request.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { CurrencyValuePipe } from '../../../shared/ui/currency-value/currency-value.pipe';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { RequestTypeLabelPipe } from '../../../shared/pipes/request-type-label.pipe';
import { statusLabel } from '../../../core/utils/labels';
import { TableStateManager } from '../../../shared/classes/table-state.manager';
/**
 * Smart Component for the Requests listing view.
 * Handles pagination, sorting, and filtering state via TableStateManager.
 */
@Component({
  selector: 'app-request-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyValuePipe,
    RequestTypeLabelPipe,
    ProgressSpinnerModule,
    SpinnerComponent
  ],
  template: `
    <app-page-header
      title="Solicitudes"
      subtitle="Listado de solicitudes de riesgo"
    />
    <p-card styleClass="rounded-xl shadow-sm">
      <ng-template pTemplate="content">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
          <div class="relative w-full sm:w-auto">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"></i>
            <input
              pInputText
              type="text"
              [formControl]="searchControl"
              placeholder="Buscar cliente o ID"
              class="w-full sm:w-80 !pl-10"
            />
          </div>
          <p-dropdown
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            [formControl]="statusControl"
            placeholder="Filtrar por estado"
            styleClass="w-full sm:w-56"
          />
        </div>
        @if (!hasLoadedOnce()) {
          <app-spinner height="400px"></app-spinner>
        } @else {
          <p-table
            #dt
            [value]="requests()"
            dataKey="requestId"
            [paginator]="true"
            [first]="firstOffset()"
            [rows]="pageSize()"
            [totalRecords]="totalRecords()"
            [lazy]="true"
            (onLazyLoad)="tableState.onLazyLoad($event)"
            [rowsPerPageOptions]="[10, 25, 50]"
            responsiveLayout="stack"
            breakpoint="960px"
            [tableStyle]="{'min-width':'60rem'}"
            styleClass="p-datatable-sm"
            [rowHover]="true"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="requestCode" class="font-semibold">ID 
                  <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-alpha-down text-primary-500': dt.sortField === 'requestCode' && dt.sortOrder === 1, 'pi-sort-alpha-up text-primary-500': dt.sortField === 'requestCode' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'requestCode'}"></i>
                </th>
                <th class="font-semibold">Cliente</th>
                <th class="font-semibold">Producto</th>
                <th pSortableColumn="requestedAmount" class="font-semibold text-right">Importe 
                  <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-numeric-down text-primary-500': dt.sortField === 'requestedAmount' && dt.sortOrder === 1, 'pi-sort-numeric-up text-primary-500': dt.sortField === 'requestedAmount' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'requestedAmount'}"></i>
                </th>
                <th class="font-semibold">Estado</th>
                <th pSortableColumn="requestDate" class="font-semibold">Creada 
                  <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-numeric-down text-primary-500': dt.sortField === 'requestDate' && dt.sortOrder === 1, 'pi-sort-numeric-up text-primary-500': dt.sortField === 'requestDate' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'requestDate'}"></i>
                </th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-request>
              <tr
                [routerLink]="['/requests', request.requestId]"
                class="cursor-pointer group hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <td class="font-mono text-surface-600">{{ request.requestCode || request.requestId }}</td>
                <td class="font-medium text-surface-900">{{ request.partyName }}</td>
                <td>{{ request.requestType | requestTypeLabel }}</td>
                <td class="text-right font-mono">{{ request.amount | currencyValue:request.currency }}</td>
                <td><app-status-badge [status]="request.status" /></td>
                <td class="text-surface-500 text-sm">{{ request.creationDate | date:'dd/MM/yyyy' }}</td>
                <td><i class="pi pi-chevron-right text-surface-400 group-hover:text-primary-600 transition-colors"></i></td>
              </tr>
            </ng-template>
          </p-table>
        }
      </ng-template>
  `
})

export class RequestListComponent implements OnInit {
  private requestService = inject(RequestService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  statusOptions = [{ value: '', label: 'Todos los estados' }, ...Object.entries(statusLabel).map(([value, label]) => ({ value, label }))];

  /** 
   * Orchestrates the PrimeNG table state, syncing pagination/sorting/filtering 
   * with the URL and triggering the API fetch automatically.
   */
  tableState = new TableStateManager<RequestSummary, RequestListFilter>({
    router: this.router,
    route: this.route,
    defaultSortField: 'requestDate',
    defaultSortOrder: -1,
    fetchFn: (filters) => this.requestService.list(filters),
    buildFilters: (page, size, sortField, sortOrder) => ({
      search: this.searchControl.value || undefined,
      requestStatus: this.statusControl.value || undefined,
      page,
      size,
      sortBy: sortField,
      sortDir: sortOrder === 1 ? 'asc' : 'desc'
    }),
    updateUrlParams: (first, size) => ({
      search: this.searchControl.value || null,
      status: this.statusControl.value || null,
      first: first.toString(),
      rows: size.toString()
    })
  });

  requests = this.tableState.data;
  totalRecords = this.tableState.totalRecords;
  pageSize = this.tableState.pageSize;
  firstOffset = this.tableState.firstOffset;
  hasLoadedOnce = this.tableState.hasLoadedOnce;

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.tableState.resetToFirstPage();
    });
    this.statusControl.valueChanges.subscribe(() => {
      this.tableState.resetToFirstPage();
    });
  }

  /**
   * Initializes URL parameters into form controls, then connects the TableStateManager
   * to start reacting to table events and fetching data.
   */
  ngOnInit() {
    const searchParam = this.route.snapshot.queryParamMap.get('search');
    if (searchParam) this.searchControl.setValue(searchParam, { emitEvent: false });
    const statusParam = this.route.snapshot.queryParamMap.get('status');
    if (statusParam) this.statusControl.setValue(statusParam, { emitEvent: false });

    this.tableState.connect().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.tableState.triggerLoad();
  }
}
