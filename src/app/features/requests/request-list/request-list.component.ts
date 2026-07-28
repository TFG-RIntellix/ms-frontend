import { Component, ChangeDetectionStrategy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
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
          <span class="p-input-icon-left w-full sm:w-auto">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [formControl]="searchControl"
              placeholder="Buscar cliente o ID"
              class="w-full sm:w-80"
            />
          </span>
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
            [rows]="10"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['partyName', 'requestId', 'requestType']"
            [loading]="isLoading()"
            [tableStyle]="{'min-width':'60rem'}"
            styleClass="p-datatable-sm"
            [rowHover]="true"
            stateStorage="session"
            stateKey="request-list-session"
          >
            <ng-template pTemplate="loadingIcon">
              <app-spinner [overlay]="false"></app-spinner>
            </ng-template>
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="requestId" class="font-semibold">ID <p-sortIcon field="requestId" /></th>
                <th pSortableColumn="partyName" class="font-semibold">Cliente <p-sortIcon field="partyName" /></th>
                <th class="font-semibold">Producto</th>
                <th pSortableColumn="amount" class="font-semibold text-right">Importe <p-sortIcon field="amount" /></th>
                <th class="font-semibold">Estado</th>
                <th pSortableColumn="creationDate" class="font-semibold">Creada <p-sortIcon field="creationDate" /></th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-request>
              <tr
                [routerLink]="['/requests', request.requestId]"
                class="cursor-pointer hover:bg-surface-100 transition"
              >
                <td class="font-mono text-surface-600">{{ request.requestId }}</td>
                <td class="font-medium text-surface-900">{{ request.partyName }}</td>
                <td>{{ request.requestType | requestTypeLabel }}</td>
                <td class="text-right font-mono">{{ request.amount | currencyValue:request.currency }}</td>
                <td><app-status-badge [status]="request.status" /></td>
                <td class="text-surface-500 text-sm">{{ request.creationDate | date:'dd/MM/yyyy' }}</td>
                <td><i class="pi pi-chevron-right text-surface-400"></i></td>
              </tr>
            </ng-template>
          </p-table>
        }
      </ng-template>
    </p-card>
  `
})
export class RequestListComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  private requestService = inject(RequestService);
  requests = signal<RequestSummary[]>([]);
  isLoading = signal(false);
  hasLoadedOnce = signal(false);
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  statusOptions = Object.entries(statusLabel).map(([value, label]) => ({ value, label }));
  ngOnInit() {
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.statusControl.valueChanges.pipe(startWith(''), distinctUntilChanged())
    ])
      .pipe(
        switchMap(([search, status]) => {
          this.isLoading.set(true);
          const filters: RequestListFilter = {};
          if (search) filters.search = search;
          if (status) filters.requestStatus = status;
          return this.requestService.list(filters);
        })
      )
      .subscribe({
        next: list => {
          this.requests.set(list);
          this.isLoading.set(false);
          this.hasLoadedOnce.set(true);
          console.log('Requests list:', list);
        },
        error: () => {
          this.requests.set([]);
          this.isLoading.set(false);
          this.hasLoadedOnce.set(true);
        }
      });
  }
}
