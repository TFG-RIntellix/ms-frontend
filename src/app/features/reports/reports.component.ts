import { Component, OnInit, inject, signal , ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, skip, switchMap, tap } from 'rxjs/operators';
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
import { RequestService } from '../../core/services/request.service';

export interface ReportSummaryWithReqCode extends ReportSummary {
  requestCode?: string;
}

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
          (onLazyLoad)="loadReports($event)"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          [tableStyle]="{'min-width':'55rem'}"
          styleClass="p-datatable-sm"
          [rowHover]="true"
        >
          <ng-template pTemplate="loadingIcon">
            <app-spinner [overlay]="false"></app-spinner>
          </ng-template>
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
                    (onClick)="viewPdf(report)"
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
  @ViewChild('dt') table!: Table;
  private reportService = inject(ReportService);
  private requestService = inject(RequestService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  reports = signal<ReportSummaryWithReqCode[]>([]);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  firstOffset = signal<number>(0);
  isLoading = signal(false);
  hasLoadedOnce = signal(false);
  searchControl = new FormControl('');
  private initialLoadDone = false;
  
  sortField = signal<string>('generatedDate');
  sortOrder = signal<number>(-1);
  private refreshTrigger$ = new Subject<void>();

  ngOnInit() {
    const firstStr = this.route.snapshot.queryParamMap.get('first');
    if (firstStr) this.firstOffset.set(parseInt(firstStr, 10));
    const rowsStr = this.route.snapshot.queryParamMap.get('rows');
    if (rowsStr) this.pageSize.set(parseInt(rowsStr, 10));
    
    const requestId = this.route.snapshot.queryParamMap.get('requestId') || '';
    const scoringId = this.route.snapshot.queryParamMap.get('scoringId') || '';
    const search = this.route.snapshot.queryParamMap.get('search') || '';

    if (search || requestId || scoringId) {
      this.searchControl.setValue(search || requestId || scoringId, { emitEvent: false });
    }
    
    // 1. Listen for filter changes
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(300), distinctUntilChanged())
    ]).pipe(skip(1)).subscribe(() => {
      // Whenever filters change, reset to page 0
      if (this.table) {
        this.table.first = 0;
      }
      this.firstOffset.set(0);
      this.refreshTrigger$.next();
    });

    // 2. Main data fetching pipeline using switchMap
    this.refreshTrigger$.pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(() => {
        const size = this.pageSize();
        const first = this.firstOffset();
        const page = size ? first / size : 0;
        const searchVal = this.searchControl.value || undefined;
        const currentSortField = this.sortField();
        const currentSortOrder = this.sortOrder();

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { first, rows: size, search: searchVal || null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });

        const filters: ReportListFilter = { 
          page, 
          size, 
          sortBy: currentSortField, 
          sortDir: currentSortOrder === 1 ? 'asc' : 'desc' 
        };
        if (searchVal) filters.search = searchVal;

        return this.reportService.list(filters).pipe(
          catchError(() => of(null)) // Catch errors so the pipeline doesn't die
        );
      })
    ).subscribe(pageResponse => {
      if (pageResponse) {
        const augmentedReports: ReportSummaryWithReqCode[] = pageResponse.content.map((r: any) => ({
          ...r,
          requestCode: r.requestCode || r.requestId
        }));
        this.reports.set(augmentedReports);
        this.totalRecords.set(pageResponse.totalElements);
      } else {
        this.reports.set([]);
        this.totalRecords.set(0);
      }
      this.isLoading.set(false);
      this.hasLoadedOnce.set(true);
    });

    // Trigger initial load manually since table is hidden
    this.refreshTrigger$.next();
  }

  loadReports(event: any) {
    if (!this.initialLoadDone) {
      this.initialLoadDone = true;
      return;
    }
    
    this.pageSize.set(event.rows || 10);
    this.firstOffset.set(event.first !== undefined ? event.first : 0);
    if (event.sortField !== undefined) this.sortField.set(event.sortField);
    if (event.sortOrder !== undefined) this.sortOrder.set(event.sortOrder);

    this.refreshTrigger$.next();
  }

  viewPdf(report: ReportSummary) {
    this.reportService.getFile(report.reportId).subscribe({
      next: blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      },
      error: () => alert('No se pudo visualizar el informe.')
    });
  }
}
