import { Component, ChangeDetectionStrategy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, skip } from 'rxjs/operators';
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
            (onLazyLoad)="loadRequests($event)"
            [rowsPerPageOptions]="[10, 25, 50]"
            [loading]="isLoading()"
            [tableStyle]="{'min-width':'60rem'}"
            styleClass="p-datatable-sm"
            [rowHover]="true"
          >
            <ng-template pTemplate="loadingIcon">
              <app-spinner [overlay]="false"></app-spinner>
            </ng-template>
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
  @ViewChild('dt') table!: Table;
  private requestService = inject(RequestService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  requests = signal<RequestSummary[]>([]);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  firstOffset = signal<number>(0);
  isLoading = signal(false);
  hasLoadedOnce = signal(false);
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  statusOptions = [{ value: '', label: 'Todos los estados' }, ...Object.entries(statusLabel).map(([value, label]) => ({ value, label }))];
  private initialLoadDone = false;

  ngOnInit() {
    const firstStr = this.route.snapshot.queryParamMap.get('first');
    if (firstStr) this.firstOffset.set(parseInt(firstStr, 10));
    const rowsStr = this.route.snapshot.queryParamMap.get('rows');
    if (rowsStr) this.pageSize.set(parseInt(rowsStr, 10));
    
    const search = this.route.snapshot.queryParamMap.get('search') || '';
    if (search) this.searchControl.setValue(search, { emitEvent: false });
    const status = this.route.snapshot.queryParamMap.get('status') || '';
    if (status) this.statusControl.setValue(status, { emitEvent: false });

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(300), distinctUntilChanged()),
      this.statusControl.valueChanges.pipe(startWith(this.statusControl.value), distinctUntilChanged())
    ]).pipe(skip(1)).subscribe(() => {
      if (this.table) this.table.first = 0;
      this.firstOffset.set(0);
      this.fetchData(0, this.pageSize());
    });

    // Trigger initial load manually since table is hidden
    this.fetchData(this.firstOffset(), this.pageSize());
  }

  loadRequests(event: any) {
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

  private fetchData(first: number, size: number, sortField: string = 'requestDate', sortOrder: number = -1) {
    this.isLoading.set(true);
    const page = size ? first / size : 0;
    const search = this.searchControl.value || undefined;
    const requestStatus = this.statusControl.value || undefined;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { first, rows: size, search: search || null, status: requestStatus || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    const filters: RequestListFilter = { page, size, sortBy: sortField, sortDir: sortOrder === 1 ? 'asc' : 'desc' };
    if (search) filters.search = search;
    if (requestStatus) filters.requestStatus = requestStatus;

    this.requestService.list(filters).subscribe({
      next: (response) => {
        this.requests.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.isLoading.set(false);
        this.hasLoadedOnce.set(true);
      },
      error: () => {
        this.requests.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
        this.hasLoadedOnce.set(true);
      }
    });
  }
}
