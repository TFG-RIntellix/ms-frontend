import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot, Data } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private readonly router = inject(Router);

  // Subject to hold the current breadcrumbs
  private readonly breadcrumbsSource = new BehaviorSubject<MenuItem[]>([]);
  breadcrumbs$ = this.breadcrumbsSource.asObservable();

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs: MenuItem[] = [];
      this.addBreadcrumb(root, [], breadcrumbs);

      // Emit the breadcrumbs
      this.breadcrumbsSource.next(breadcrumbs);
    });
  }

  private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: MenuItem[]) {
    if (route) {
      // Get the route URL
      const routeUrl = parentUrl.concat(route.url.map(url => url.path));

      // Add breadcrumb if the route has data.breadcrumb
      if (route.data['breadcrumb']) {
        const breadcrumb = {
          label: this.getLabel(route.data),
          routerLink: '/' + routeUrl.join('/')
        };
        
        // Prevent adding duplicate consecutive breadcrumbs (sometimes happens with empty paths)
        const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
        if (!lastBreadcrumb || lastBreadcrumb.routerLink !== breadcrumb.routerLink) {
           breadcrumbs.push(breadcrumb);
        }
      }

      // Add child routes recursively
      if (route.firstChild) {
        this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
      }
    }
  }

  private getLabel(data: Data): string {
    // Allows dynamic function or static string for breadcrumb
    return typeof data['breadcrumb'] === 'function' ? data['breadcrumb'](data) : data['breadcrumb'];
  }
}
