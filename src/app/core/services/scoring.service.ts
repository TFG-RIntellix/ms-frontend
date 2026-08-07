import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Scoring } from '../models/scoring.model';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getByRequest(requestId: string) {
    return this.http.get<Scoring>(`${this.apiUrl}/api/requests/${requestId}/scoring`);
  }
}
