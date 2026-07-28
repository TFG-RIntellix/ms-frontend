import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignorar errores 404 para el endpoint de reportes, ya que se usan para polling
      if (error.status === 404 && req.url.includes('/api/reports')) {
        return throwError(() => error);
      }

      let errorMsg = 'Ha ocurrido un error inesperado';
      
      // Extraer mensaje de error del backend si existe
      if (error.error && error.error.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      const statusText = error.status ? error.status.toString() : '';

      messageService.add({
        severity: 'error',
        summary: 'Error ' + statusText,
        detail: errorMsg,
        life: 5000
      });

      return throwError(() => error);
    })
  );
};
