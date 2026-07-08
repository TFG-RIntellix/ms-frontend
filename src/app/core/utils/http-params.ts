import { HttpParams } from '@angular/common/http';

export function toHttpParams(obj: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });
  return params;
}
