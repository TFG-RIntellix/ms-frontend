import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { toHttpParams } from '../utils/http-params';
import {
  CreateSimulationPayload,
  DraftRequest,
  DraftResponse,
  SimulationDetails,
  SimulationSummary,
  UpdateSimulationPayload
} from '../models/simulation.model';

export interface SimulationListFilter {
  requestId?: string;
  partyName?: string;
  partyId?: string;
  archived?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  list(filters: SimulationListFilter = {}) {
    return this.http.get<SimulationSummary[]>(`${this.apiUrl}/api/simulations`, {
      params: toHttpParams(filters as Record<string, unknown>)
    });
  }

  get(simulationId: string) {
    return this.http.get<SimulationDetails>(`${this.apiUrl}/api/simulations/${simulationId}`);
  }

  draft(payload: DraftRequest) {
    return this.http.post<DraftResponse>(`${this.apiUrl}/api/v1/simulations/draft`, payload);
  }

  create(payload: CreateSimulationPayload) {
    return this.http.post(`${this.apiUrl}/api/simulations`, payload, { observe: 'response' });
  }

  update(simulationId: string, payload: UpdateSimulationPayload) {
    return this.http.put(`${this.apiUrl}/api/simulations/${simulationId}`, payload);
  }

  archive(simulationId: string, isArchived: boolean) {
    return this.http.patch(`${this.apiUrl}/api/simulations/${simulationId}`, { isArchived });
  }

  delete(simulationId: string) {
    return this.http.delete(`${this.apiUrl}/api/simulations/${simulationId}`);
  }
}
