import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { toHttpParams } from '../utils/http-params';
import { PageResponse } from '../models/page-response.model';
import { ReportDetails, ReportSummary } from '../models/report.model';

export interface ReportListFilter {
  requestId?: string;
  scoringId?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  list(filters: ReportListFilter = {}) {
    return this.http.get<PageResponse<ReportSummary>>(`${this.apiUrl}/api/reports`, {
      params: toHttpParams(filters as Record<string, unknown>)
    });
  }

  getByRequestId(requestId: string) {
    return this.http.get<ReportSummary>(`${this.apiUrl}/api/reports`, {
      params: { requestId }
    });
  }

  get(reportId: string) {
    return this.http.get<ReportDetails>(`${this.apiUrl}/api/reports/${reportId}`);
  }

  getFile(reportId: string) {
    return this.http.get(`${this.apiUrl}/api/reports/${reportId}/file`, {
      responseType: 'blob'
    });
  }
}
