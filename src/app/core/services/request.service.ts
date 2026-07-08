import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { toHttpParams } from '../utils/http-params';
import { RequestDetails, RequestParty, RequestSummary } from '../models/request.model';
import { Scoring } from '../models/scoring.model';

export interface RequestListFilter {
  partyName?: string;
  partyId?: string;
  requestStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  list(filters: RequestListFilter = {}) {
    return this.http.get<RequestSummary[]>(`${this.apiUrl}/api/requests`, {
      params: toHttpParams(filters)
    });
  }

  get(requestId: string) {
    return this.http.get<RequestDetails>(`${this.apiUrl}/api/requests/${requestId}`);
  }

  getParty(requestId: string) {
    return this.http.get<RequestParty>(`${this.apiUrl}/api/requests/${requestId}/party`);
  }

  getScoring(requestId: string) {
    return this.http.get<Scoring>(`${this.apiUrl}/api/requests/${requestId}/scoring`);
  }
}
