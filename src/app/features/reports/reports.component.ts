import { Component, OnInit, inject, signal , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ReportService, ReportListFilter } from '../../core/services/report.service';
import { ReportSummary } from '../../core/models/report.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
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
    SpinnerComponent
  ],
  template: `
    <app-page-header
      title="Informes"
      subtitle="Listado de informes de scoring en PDF"
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
              placeholder="Buscar por solicitud o scoring"
              class="w-full"
            />
          </span>
        </div>
        <p-table
          [value]="reports()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          [tableStyle]="{'min-width':'55rem'}"
          styleClass="p-datatable-sm"
          [rowHover]="true"
          stateStorage="session"
          stateKey="reports-list-session"
        >
          <ng-template pTemplate="loadingIcon">
            <app-spinner [overlay]="false"></app-spinner>
          </ng-template>
          <ng-template pTemplate="header">
            <tr>
              <th>Título</th>
              <th>Solicitud</th>
              <th>Scoring</th>
              <th>Generado por</th>
              <th>Fecha</th>
              <th>Tamaño</th>
              <th class="text-right">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-report>
            <tr>
              <td class="font-medium text-surface-900">{{ report.title }}</td>
              <td class="font-mono text-surface-600">{{ report.requestId }}</td>
              <td class="font-mono text-surface-600">{{ report.scoringId }}</td>
              <td>{{ report.generatedBy }}</td>
              <td class="text-surface-500 text-sm">{{ report.generatedDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="font-mono">{{ report.fileSizeBytes | number:'1.0-0' }} bytes</td>
              <td class="text-right">
                <p-button
                  [outlined]="true"
                  icon="pi pi-eye"
                  label="Ver PDF"
                  (onClick)="viewPdf(report)"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>
    </p-card>
  `
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private route = inject(ActivatedRoute);
  reports = signal<ReportSummary[]>([]);
  isLoading = signal(false);
  searchControl = new FormControl('');
  ngOnInit() {
    const requestId = this.route.snapshot.queryParamMap.get('requestId') || '';
    const scoringId = this.route.snapshot.queryParamMap.get('scoringId') || '';
    if (requestId || scoringId) {
      this.searchControl.setValue(requestId || scoringId, { emitEvent: true });
    }
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(300), distinctUntilChanged())
    ])
      .pipe(
        switchMap(([search]) => {
          this.isLoading.set(true);
          
          // If there is a search term and it looks like a valid ObjectId (24 hex chars)
          if (search && /^[0-9a-fA-F]{24}$/.test(search)) {
            // It could be a requestId (or scoringId, but backend only supports requestId now)
            return this.reportService.getByRequestId(search).pipe(
              map(report => report ? [report] : []),
              catchError(() => {
                // If not found by requestId, we could just return empty or try fetching all
                return of([]);
              })
            );
          } else if (search) {
             // Fetch all and filter client side
             return this.reportService.list().pipe(
               map(reports => reports.filter(r => 
                 r.requestId.includes(search) || r.scoringId.includes(search) || r.title.toLowerCase().includes(search.toLowerCase())
               ))
             );
          }
          
          return this.reportService.list();
        })
      )
      .subscribe({
        next: list => {
          this.reports.set(list);
          this.isLoading.set(false);
        },
        error: () => {
          this.reports.set([]);
          this.isLoading.set(false);
        }
      });
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
