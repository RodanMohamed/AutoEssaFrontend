import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, concat, map, Observable, of, tap } from 'rxjs';

import { API_BASE_URL } from '../../../core/core.config';
import { Car, CarsQuery } from './cars.interface';

@Injectable({ providedIn: 'root' })
export class CarsApi {
  private readonly http = inject(HttpClient);
  private readonly memoryCache = new Map<string, Car[]>();
  private readonly storagePrefix = 'autoessa.cars.cache.';

  getCars(query?: CarsQuery) {
    const cacheKey = this.getCacheKey(query);
    const cachedCars = this.readCache(cacheKey);
    const params = this.buildQueryParams(query);
    const remote$ = this.http.get<unknown>(`${API_BASE_URL}/api/Cars`, { params }).pipe(
      map((payload) => this.mapCars(payload)),
      tap((cars) => this.writeCache(cacheKey, cars)),
      catchError(() => of(cachedCars.length > 0 ? cachedCars : this.mockCars()))
    );

    if (cachedCars.length > 0) {
      return concat(of(cachedCars), remote$);
    }

    return concat(of(this.mockCars()), remote$);
  }

  getCarById(id: string) {
    const fromCache = this.findByIdInCache(id);
    const remote$ = this.http.get<unknown>(`${API_BASE_URL}/api/Cars/${id}`).pipe(
      map((payload) => this.mapSingleCar(payload)),
      catchError(() => of(this.mockCars().find((car) => car.id === id) ?? this.mockCars()[0]))
    );

    if (fromCache) {
      return concat(of(fromCache), remote$);
    }

    return remote$;
  }

  private buildQueryParams(query?: CarsQuery): HttpParams {
    let params = new HttpParams();
    if (!query) {
      return params;
    }

    if (query.searchTerm && query.searchTerm.trim().length > 0) {
      params = params.set('SearchTerm', query.searchTerm.trim());
    }
    if (query.listingType && query.listingType !== 'all') {
      params = params.set('ListingType', query.listingType);
    }
    if (query.fuelType && query.fuelType !== 'all') {
      params = params.set('FuelType', query.fuelType);
    }
    if (query.carType && query.carType !== 'all') {
      params = params.set('CarType', query.carType);
    }
    if (typeof query.minPrice === 'number' && query.minPrice > 0) {
      params = params.set('MinPrice', String(query.minPrice));
    }
    if (typeof query.maxPrice === 'number' && query.maxPrice > 0) {
      params = params.set('MaxPrice', String(query.maxPrice));
    }
    if (query.sortBy && query.sortBy !== 'default') {
      params = params.set('SortBy', query.sortBy);
    }
    params = params.set('PageNumber', String(query.pageNumber ?? 1));
    params = params.set('PageSize', String(query.pageSize ?? 24));
    return params;
  }

  private mapCars(payload: unknown): Car[] {
    if (Array.isArray(payload)) {
      return payload.map((item, index) => this.mapItem(item, index + 1));
    }

    if (typeof payload === 'object' && payload !== null) {
      const source = payload as Record<string, unknown>;
      const possibleCollections = [source['items'], source['data'], source['value']];
      for (const collection of possibleCollections) {
        if (Array.isArray(collection)) {
          return collection.map((item, index) => this.mapItem(item, index + 1));
        }
      }
    }

    return this.mockCars();
  }

  private mapSingleCar(payload: unknown): Car {
    return this.mapItem(payload, 1);
  }

  private mapItem(item: unknown, fallbackId: number): Car {
    const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    const imageUrl = this.extractImageUrl(record);

    return {
      id: typeof record['id'] === 'string' ? record['id'] : `car-${fallbackId}`,
      brand: typeof record['brand'] === 'string' ? record['brand'] : 'AutoEssa',
      model: typeof record['model'] === 'string' ? record['model'] : 'Edition',
      name: typeof record['name'] === 'string' ? record['name'] : 'Car',
      year: typeof record['year'] === 'number' ? record['year'] : 2024,
      price: typeof record['price'] === 'number' ? record['price'] : 0,
      carType: typeof record['carType'] === 'string' ? record['carType'] : 'Sedan',
      listingType: typeof record['listingType'] === 'string' ? record['listingType'] : 'Rent',
      fuelType: typeof record['fuelType'] === 'string' ? record['fuelType'] : 'Petrol',
      transmissionType: typeof record['transmissionType'] === 'string' ? record['transmissionType'] : 'Automatic',
      mileage: typeof record['mileage'] === 'number' ? record['mileage'] : 0,
      location: typeof record['location'] === 'string' ? record['location'] : 'Cairo',
      imageUrl
    };
  }

  private extractImageUrl(record: Record<string, unknown>): string {
    if (typeof record['imageUrl'] === 'string') {
      return record['imageUrl'];
    }

    const images = record['images'];
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (typeof first === 'string') {
        return first;
      }
      if (typeof first === 'object' && first !== null) {
        const firstRecord = first as Record<string, unknown>;
        if (typeof firstRecord['imageUrl'] === 'string') {
          return firstRecord['imageUrl'];
        }
        if (typeof firstRecord['url'] === 'string') {
          return firstRecord['url'];
        }
      }
    }

    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
  }

  private mockCars(): Car[] {
    return [
      {
        id: '1',
        brand: 'Mercedes',
        model: 'C200',
        name: 'Mercedes C200',
        year: 2023,
        price: 5500,
        carType: 'Sedan',
        listingType: 'Rent',
        fuelType: 'Petrol',
        transmissionType: 'Automatic',
        mileage: 23000,
        location: 'Cairo',
        imageUrl: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: '2',
        brand: 'Toyota',
        model: 'Corolla',
        name: 'Toyota Corolla',
        year: 2022,
        price: 1200000,
        carType: 'Sedan',
        listingType: 'Buy',
        fuelType: 'Petrol',
        transmissionType: 'Automatic',
        mileage: 34000,
        location: 'Giza',
        imageUrl: 'https://images.unsplash.com/photo-1549925862-990f9be5f0f8?auto=format&fit=crop&w=1200&q=80'
      }
    ];
  }

  private getCacheKey(query?: CarsQuery): string {
    return query ? JSON.stringify(query) : 'default';
  }

  private readCache(cacheKey: string): Car[] {
    const memory = this.memoryCache.get(cacheKey);
    if (memory && memory.length > 0) {
      return memory;
    }

    const persisted = localStorage.getItem(this.storagePrefix + cacheKey);
    if (!persisted) {
      return [];
    }

    try {
      const parsed = JSON.parse(persisted) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      const cars = parsed.filter((item): item is Car => typeof item === 'object' && item !== null);
      if (cars.length > 0) {
        this.memoryCache.set(cacheKey, cars);
      }
      return cars;
    } catch {
      return [];
    }
  }

  private writeCache(cacheKey: string, cars: Car[]) {
    this.memoryCache.set(cacheKey, cars);
    localStorage.setItem(this.storagePrefix + cacheKey, JSON.stringify(cars));
  }

  private findByIdInCache(id: string): Car | null {
    for (const cars of this.memoryCache.values()) {
      const found = cars.find((item) => item.id === id);
      if (found) {
        return found;
      }
    }

    const defaultCached = this.readCache('default');
    return defaultCached.find((item) => item.id === id) ?? null;
  }
}
