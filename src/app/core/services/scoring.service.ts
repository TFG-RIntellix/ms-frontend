import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Scoring } from '../models/scoring.model';

/**
 * Service handling HTTP communications for Risk Scoring results.
 */
@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  /**
   * Retrieves the scoring details associated with a specific request.
   * 
   * @param requestId The unique identifier of the request.
   * @returns Observable emitting the Scoring results.
   */
  getByRequest(requestId: string) {
    return this.http.get<Scoring>(`${this.apiUrl}/api/requests/${requestId}/scoring`);
  }
}
