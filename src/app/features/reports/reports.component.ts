import { Component, ChangeDetectionStrategy, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ReportService, ReportListFilter } from '../../core/services/report.service';
import { ReportSummary } from '../../core/models/report.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { TooltipModule } from 'primeng/tooltip';
import { TableStateManager } from '../../shared/classes/table-state.manager';

export interface ReportSummaryWithReqCode extends ReportSummary {
  requestCode?: string;
}

/**
 * Smart Component for the PDF Reports listing view.
 * Handles pagination, sorting, and search via TableStateManager.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reports',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    PageHeaderComponent,
    SpinnerComponent,
    TooltipModule
  ],
  template: `
    <app-page-header
      title="Informes"
      subtitle="Listado de informes de scoring en PDF"
    />
    <p-card styleClass="rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
      <ng-template pTemplate="content">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
          <div class="relative w-full sm:w-80">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"></i>
            <input
              pInputText
              type="text"
              [formControl]="searchControl"
              placeholder="Buscar por solicitud o scoring"
              class="w-full !pl-10"
            />
          </div>
        </div>
        @if (!hasLoadedOnce()) {
          <app-spinner height="400px"></app-spinner>
        } @else {
          <p-table
          #dt
          [value]="reports()"
          [paginator]="true"
          [first]="firstOffset()"
          [rows]="pageSize()"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="tableState.onLazyLoad($event)"
          [rowsPerPageOptions]="[10, 25, 50]"
          responsiveLayout="stack"
          breakpoint="960px"
          [tableStyle]="{'min-width':'55rem'}"
          styleClass="p-datatable-sm"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="title" class="font-semibold">Título 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-alpha-down text-primary-500': dt.sortField === 'title' && dt.sortOrder === 1, 'pi-sort-alpha-up text-primary-500': dt.sortField === 'title' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'title'}"></i>
              </th>
              <th pSortableColumn="requestId" class="font-semibold">Solicitud 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-numeric-down text-primary-500': dt.sortField === 'requestId' && dt.sortOrder === 1, 'pi-sort-numeric-up text-primary-500': dt.sortField === 'requestId' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'requestId'}"></i>
              </th>
              <th pSortableColumn="generatedBy" class="font-semibold">Generado por 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-alpha-down text-primary-500': dt.sortField === 'generatedBy' && dt.sortOrder === 1, 'pi-sort-alpha-up text-primary-500': dt.sortField === 'generatedBy' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'generatedBy'}"></i>
              </th>
              <th pSortableColumn="generatedDate" class="font-semibold">Fecha 
                <i class="pi ml-2 text-surface-400" [ngClass]="{'pi-sort-numeric-down text-primary-500': dt.sortField === 'generatedDate' && dt.sortOrder === 1, 'pi-sort-numeric-up text-primary-500': dt.sortField === 'generatedDate' && dt.sortOrder === -1, 'pi-sort-alt': dt.sortField !== 'generatedDate'}"></i>
              </th>
              <th class="font-semibold">Tamaño</th>
              <th style="width: 8rem; text-align: center;" class="font-semibold">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-report>
            <tr class="group hover:bg-white hover:shadow-sm transition-all duration-300">
              <td class="font-medium text-surface-900">{{ report.title }}</td>
              <td class="font-mono text-surface-600">{{ report.requestCode || report.requestId }}</td>
              <td>{{ report.generatedBy }}</td>
              <td class="text-surface-500 text-sm">{{ report.generationDate || report.generatedDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="font-mono">{{ report.fileSizeBytes | number:'1.0-0' }} bytes</td>
              <td style="text-align: center;">
                <div class="flex flex-wrap justify-center gap-1">
                  <p-button
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    icon="pi pi-file-pdf"
                    pTooltip="Ver PDF"
                    tooltipPosition="top"
                    (onClick)="viewPdf(report.reportId)"
                  />
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
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  
  searchControl = new FormControl('');
  
  /** 
   * Orchestrates the PrimeNG table state, syncing pagination/sorting/filtering 
   * with the URL and triggering the API fetch automatically.
   */
  tableState = new TableStateManager<ReportSummaryWithReqCode, ReportListFilter>({
    router: this.router,
    route: this.route,
    defaultSortField: 'generatedDate',
    defaultSortOrder: -1,
    fetchFn: (filters) => this.reportService.list(filters) as any,
    buildFilters: (page, size, sortField, sortOrder) => ({
      search: this.searchControl.value || undefined,
      page,
      size,
      sortBy: sortField,
      sortDir: sortOrder === 1 ? 'asc' : 'desc'
    }),
    updateUrlParams: (first, size) => ({
      search: this.searchControl.value || null,
      first: first.toString(),
      rows: size.toString()
    })
  });

  reports = this.tableState.data;
  totalRecords = this.tableState.totalRecords;
  pageSize = this.tableState.pageSize;
  firstOffset = this.tableState.firstOffset;
  hasLoadedOnce = this.tableState.hasLoadedOnce;

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.tableState.resetToFirstPage();
    });
  }

  ngOnInit() {
    const searchParam = this.route.snapshot.queryParamMap.get('search');
    if (searchParam) this.searchControl.setValue(searchParam, { emitEvent: false });

    this.tableState.connect().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.tableState.triggerLoad();
  }

  /**
   * Downloads and opens a specific report in a new browser tab.
   * 
   * @param reportId The ID of the report to view.
   */
  viewPdf(reportId: string) {
    this.reportService.downloadAndOpenPdf(reportId);
  }
}
