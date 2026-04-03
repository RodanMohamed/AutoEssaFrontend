import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from '../../features/auth/data-access/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const session = authStore.session();

  if (!session?.accessToken || req.url.includes('/api/Auth/')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${session.accessToken}`
    }
  });

  return next(authReq);
};
