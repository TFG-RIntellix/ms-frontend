import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RequestService } from '../../core/services/request.service';

export const requestResolver: ResolveFn<{ id: string, code: string }> = (route, state) => {
  const id = route.paramMap.get('id');
  if (!id) return of({ id: '', code: 'Solicitud' });

  return inject(RequestService).get(id).pipe(
    map(req => ({ id: req.requestId, code: req.requestCode || req.requestId })),
    catchError(() => of({ id, code: 'Solicitud' }))
  );
};
