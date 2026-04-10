import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map, take } from 'rxjs';

import { Car } from './cars.interface';
import { CarsApi } from './cars.api';

export const carsResolver: ResolveFn<Car[]> = () => {
  const carsApi = inject(CarsApi);
  return carsApi.getCars({ pageNumber: 1, pageSize: 500 }).pipe(take(1));
};

export const featuredCarsResolver: ResolveFn<Car[]> = () => {
  const carsApi = inject(CarsApi);
  return carsApi
    .getCars({ pageNumber: 1, pageSize: 6, sortBy: 'newest' })
    .pipe(
      take(1),
      map((cars) => cars.slice(0, 6))
    );
};
