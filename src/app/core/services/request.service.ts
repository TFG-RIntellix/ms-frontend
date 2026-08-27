import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { toHttpParams } from '../utils/http-params';
import { PageResponse } from '../models/page-response.model';
import { RequestDetails, RequestParty, RequestSummary } from '../models/request.model';
import { Scoring } from '../models/scoring.model';

/**
 * Filter criteria for paginated request listing.
 */
export interface RequestListFilter {
  search?: string;
  partyId?: string;
  requestStatus?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

/**
 * Service handling HTTP communications for Risk Requests.
 */
@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  /**
   * Retrieves a paginated list of requests matching the provided filters.
   * 
   * @param filters The search and pagination criteria.
   * @returns Observable emitting a paginated response of RequestSummary.
   */
  list(filters: RequestListFilter = {}) {
    return this.http.get<PageResponse<RequestSummary>>(`${this.apiUrl}/api/requests`, {
      params: toHttpParams(filters as Record<string, unknown>)
    });
  }

  /**
   * Retrieves the full details of a specific request.
   * 
   * @param requestId The unique identifier of the request.
   * @returns Observable emitting the RequestDetails.
   */
  get(requestId: string) {
    return this.http.get<RequestDetails>(`${this.apiUrl}/api/requests/${requestId}`);
  }

  /**
   * Retrieves the party (customer) details associated with a request.
   * 
   * @param requestId The unique identifier of the request.
   * @returns Observable emitting the RequestParty.
   */
  getParty(requestId: string) {
    return this.http.get<RequestParty>(`${this.apiUrl}/api/requests/${requestId}/party`);
  }

  /**
   * Retrieves the scoring execution results for a specific request.
   * 
   * @param requestId The unique identifier of the request.
   * @returns Observable emitting the Scoring results.
   */
  getScoring(requestId: string) {
    return this.http.get<Scoring>(`${this.apiUrl}/api/requests/${requestId}/scoring`);
  }

  /**
   * Updates the workflow status of a request (e.g. APPROVED, REJECTED).
   * 
   * @param requestId The unique identifier of the request.
   * @param requestStatus The new status to apply.
   * @returns Observable emitting the updated RequestDetails.
   */
  updateStatus(requestId: string, requestStatus: string) {
    return this.http.put<RequestDetails>(`${this.apiUrl}/api/requests/${requestId}`, { requestStatus });
  }
}
