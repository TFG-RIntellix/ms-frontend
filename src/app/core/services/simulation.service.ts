import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { toHttpParams } from '../utils/http-params';
import { PageResponse } from '../models/page-response.model';
import {
  CreateSimulationPayload,
  DraftRequest,
  DraftResponse,
  SimulationDetails,
  SimulationSummary
} from '../models/simulation.model';

/**
 * Filter criteria for paginated simulation listing.
 */
export interface SimulationListFilter {
  search?: string;
  partyId?: string;
  archived?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

/**
 * Service handling HTTP communications for Risk Simulations (What-if analysis).
 */
@Injectable({ providedIn: 'root' })
export class SimulationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  /**
   * Retrieves a paginated list of saved simulations matching the provided filters.
   * 
   * @param filters The search and pagination criteria.
   * @returns Observable emitting a paginated response of SimulationSummary.
   */
  list(filters: SimulationListFilter = {}) {
    return this.http.get<PageResponse<SimulationSummary>>(`${this.apiUrl}/api/simulations`, {
      params: toHttpParams(filters as Record<string, unknown>)
    });
  }

  /**
   * Retrieves the full details of a saved simulation by its ID.
   * 
   * @param simulationId The unique identifier of the simulation.
   * @returns Observable emitting the SimulationDetails.
   */
  get(simulationId: string) {
    return this.http.get<SimulationDetails>(`${this.apiUrl}/api/simulations/${simulationId}`);
  }

  /**
   * Submits a temporary 'draft' simulation. This does NOT persist the simulation in the database.
   * Used for real-time recalculations in the UI before saving.
   * 
   * @param payload The simulation parameters.
   * @returns Observable emitting the DraftResponse containing simulated metrics.
   */
  draft(payload: DraftRequest) {
    return this.http.post<DraftResponse>(`${this.apiUrl}/api/v1/simulations/draft`, payload);
  }

  /**
   * Persists a simulation permanently in the database.
   * 
   * @param payload The simulation payload containing modified parameters.
   * @returns Observable emitting the HTTP Response (often containing location headers).
   */
  create(payload: CreateSimulationPayload) {
    return this.http.post(`${this.apiUrl}/api/simulations`, payload, { observe: 'response' });
  }



  /**
   * Archives or unarchives a saved simulation.
   * 
   * @param simulationId The unique identifier of the simulation.
   * @param isArchived True to archive, false to restore.
   * @returns Observable emitting the HTTP Response.
   */
  archive(simulationId: string, isArchived: boolean) {
    return this.http.patch(`${this.apiUrl}/api/simulations/${simulationId}`, { isArchived });
  }

  /**
   * Permanently deletes a simulation.
   * 
   * @param simulationId The unique identifier of the simulation.
   * @returns Observable emitting a confirmation text response.
   */
  delete(simulationId: string) {
    return this.http.delete(`${this.apiUrl}/api/simulations/${simulationId}`, { responseType: 'text' });
  }
}
