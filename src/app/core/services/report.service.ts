import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { toHttpParams } from '../utils/http-params';
import { PageResponse } from '../models/page-response.model';
import { ReportDetails, ReportSummary } from '../models/report.model';

/**
 * Filter criteria for paginated report listing.
 */
export interface ReportListFilter {
  requestId?: string;
  scoringId?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

/**
 * Service handling HTTP communications for Risk Reports.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  /**
   * Retrieves a paginated list of generated reports matching the provided filters.
   * 
   * @param filters The search and pagination criteria.
   * @returns Observable emitting a paginated response of ReportSummary.
   */
  list(filters: ReportListFilter = {}) {
    return this.http.get<PageResponse<ReportSummary>>(`${this.apiUrl}/api/reports`, {
      params: toHttpParams(filters as Record<string, unknown>)
    });
  }

  /**
   * Retrieves a single report summary associated with a specific request ID.
   * 
   * @param requestId The unique identifier of the original request.
   * @returns Observable emitting the ReportSummary.
   */
  getByRequestId(requestId: string) {
    return this.http.get<ReportSummary>(`${this.apiUrl}/api/reports`, {
      params: { requestId }
    });
  }

  /**
   * Retrieves the full details of a specific report.
   * 
   * @param reportId The unique identifier of the report.
   * @returns Observable emitting the ReportDetails.
   */
  get(reportId: string) {
    return this.http.get<ReportDetails>(`${this.apiUrl}/api/reports/${reportId}`);
  }

  /**
   * Downloads the physical PDF file associated with a report.
   * 
   * @param reportId The unique identifier of the report.
   * @returns Observable emitting the PDF file as a Blob.
   */
  getFile(reportId: string) {
    return this.http.get(`${this.apiUrl}/api/reports/${reportId}/file`, {
      responseType: 'blob'
    });
  }

  /**
   * Downloads the PDF file and automatically opens it in a new browser tab.
   * Displays an alert if the download fails.
   * 
   * @param reportId The unique identifier of the report to open.
   */
  downloadAndOpenPdf(reportId: string) {
    this.getFile(reportId).subscribe({
      next: blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`
            <html>
              <head><title>Report_${reportId}.pdf</title></head>
              <body style="margin:0;padding:0;">
                <iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>
              </body>
            </html>
          `);
          win.document.close();
        } else {
          window.open(url, '_blank');
        }
      },
      error: () => alert('No se pudo visualizar el informe.')
    });
  }
}
