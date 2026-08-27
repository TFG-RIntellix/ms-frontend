import { signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { PageResponse } from '../../core/models/page-response.model';

/**
 * Configuration interface for TableStateManager.
 */
export interface TableStateConfig<T, F> {
  fetchFn: (filters: F) => Observable<PageResponse<T> | null>;
  buildFilters: (page: number, size: number, sortField: string, sortOrder: number) => F;
  updateUrlParams: (first: number, size: number) => Record<string, string | null>;
  router: Router;
  route: ActivatedRoute;
  defaultSortField?: string;
  defaultSortOrder?: number;
}

/**
 * Manages the state of a table including pagination, sorting, and data fetching.
 * Synchronizes the table state with the URL query parameters to preserve state.
 */
export class TableStateManager<T, F> {
  data = signal<T[]>([]);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  firstOffset = signal<number>(0);
  hasLoadedOnce = signal(false);
  sortField: WritableSignal<string>;
  sortOrder: WritableSignal<number>;
  
  refreshTrigger$ = new Subject<void>();
  initialLoadDone = false;

  constructor(private config: TableStateConfig<T, F>) {
    this.sortField = signal<string>(config.defaultSortField ?? '');
    this.sortOrder = signal<number>(config.defaultSortOrder ?? -1);

    const firstStr = config.route.snapshot.queryParamMap.get('first');
    if (firstStr) this.firstOffset.set(parseInt(firstStr, 10));
    const rowsStr = config.route.snapshot.queryParamMap.get('rows');
    if (rowsStr) this.pageSize.set(parseInt(rowsStr, 10));
    const sortFieldStr = config.route.snapshot.queryParamMap.get('sortField');
    if (sortFieldStr) this.sortField.set(sortFieldStr);
    const sortOrderStr = config.route.snapshot.queryParamMap.get('sortOrder');
    if (sortOrderStr) this.sortOrder.set(parseInt(sortOrderStr, 10));
  }

  /**
   * Connects the table state to the data fetching logic.
   * Updates URL parameters and triggers API calls when state changes.
   * @returns Observable of the page response or null on error.
   */
  connect(): Observable<PageResponse<T> | null> {
    return this.refreshTrigger$.pipe(
      switchMap(() => {
        const size = this.pageSize();
        const first = this.firstOffset();
        const page = size ? first / size : 0;
        const currentSortField = this.sortField();
        const currentSortOrder = this.sortOrder();

        const queryParams = {
          ...this.config.updateUrlParams(first, size),
          sortField: currentSortField || null,
          sortOrder: currentSortOrder ? currentSortOrder.toString() : null
        };
        
        this.config.router.navigate([], {
          relativeTo: this.config.route,
          queryParams: queryParams,
          queryParamsHandling: 'merge',
          replaceUrl: true
        });

        const filters = this.config.buildFilters(page, size, currentSortField, currentSortOrder);

        return this.config.fetchFn(filters).pipe(
          catchError(() => of(null))
        );
      }),
      tap(response => {
        if (response) {
          this.data.set(response.content);
          this.totalRecords.set(response.totalElements);
        } else {
          this.data.set([]);
          this.totalRecords.set(0);
        }
        this.hasLoadedOnce.set(true);
      })
    );
  }

  /**
   * Triggers a reload of the table data.
   */
  triggerLoad() {
    this.refreshTrigger$.next();
  }

  /**
   * Resets the pagination to the first page and triggers a load.
   */
  resetToFirstPage() {
    this.firstOffset.set(0);
    this.triggerLoad();
  }

  /**
   * Handles the lazy load event emitted by a PrimeNG table.
   * @param event The lazy load event containing pagination and sorting info.
   */
  onLazyLoad(event: any) {
    if (!this.initialLoadDone) {
      this.initialLoadDone = true;
      return;
    }

    this.firstOffset.set(event.first !== undefined ? event.first : 0);
    this.pageSize.set(event.rows || 10);
    if (event.sortField !== undefined) this.sortField.set(event.sortField);
    if (event.sortOrder !== undefined) this.sortOrder.set(event.sortOrder);

    this.triggerLoad();
  }
}
