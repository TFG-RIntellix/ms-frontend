import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { ReportService, ReportListFilter } from '../../core/services/report.service';
import { ReportSummary } from '../../core/models/report.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    PageHeaderComponent
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
        >
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
                  icon="pi pi-download"
                  label="Descargar PDF"
                  (onClick)="downloadPdf(report)"
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
          const filters: ReportListFilter = {};
          if (search) {
            filters.requestId = search;
            filters.scoringId = search;
          }
          return this.reportService.list(filters);
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

  downloadPdf(report: ReportSummary) {
    this.reportService.download(report.reportId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title || report.reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: () => alert('No se pudo descargar el informe.')
    });
  }
}
