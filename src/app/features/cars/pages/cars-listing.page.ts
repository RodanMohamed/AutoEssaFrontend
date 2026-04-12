import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { LocaleService } from '../../../core/services/locale.service';
import { CarCardComponent } from '../../../shared/ui/car-card.component';
import { CarsApi } from '../data-access/cars.api';
import { Car } from '../data-access/cars.interface';

@Component({
  selector: 'app-cars-listing-page',
  imports: [CarCardComponent, ReactiveFormsModule],
  template: `
    <section class="space-y-6">
      <h1 class="font-serif text-3xl">{{ copy().title }}</h1>

      <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()" class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body grid gap-4 md:grid-cols-2">
          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().searchLabel }}</span>
            <input class="input input-bordered flex-1" type="text" formControlName="searchTerm" [placeholder]="copy().searchPlaceholder" />
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().listingTypeLabel }}</span>
            <select class="select select-bordered flex-1" formControlName="listingType">
              <option value="all">{{ copy().allOption }}</option>
              <option value="Rent">{{ copy().rentOption }}</option>
              <option value="Sell">{{ copy().buyOption }}</option>
            </select>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().fuelLabel }}</span>
            <select class="select select-bordered flex-1" formControlName="fuelType">
              <option value="all">{{ copy().allOption }}</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().sortLabel }}</span>
            <select class="select select-bordered flex-1" formControlName="sortBy">
              <option value="default">{{ copy().defaultOption }}</option>
              <option value="priceAsc">{{ copy().priceAscOption }}</option>
              <option value="priceDesc">{{ copy().priceDescOption }}</option>
              <option value="newest">{{ copy().newestOption }}</option>
            </select>
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().carTypeLabel }}</span>
            <input class="input input-bordered flex-1" type="text" formControlName="carType" [placeholder]="copy().carTypePlaceholder" />
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().minPriceLabel }}</span>
            <input class="input input-bordered flex-1" type="number" formControlName="minPrice" />
          </label>

          <label class="flex items-center gap-3">
            <span class="label-text min-w-32">{{ copy().maxPriceLabel }}</span>
            <input class="input input-bordered flex-1" type="number" formControlName="maxPrice" />
          </label>

          <div class="flex items-center gap-2 md:col-span-2">
            <button class="btn btn-primary" type="submit">{{ copy().applyButton }}</button>
            <button class="btn btn-outline" type="button" (click)="resetFilters()">{{ copy().resetButton }}</button>
          </div>
        </div>
      </form>

      @if (status()) {
        <p class="text-sm" [class.text-success]="!isError()" [class.text-error]="isError()">{{ status() }}</p>
      }

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (car of filteredCars(); track car.id) {
          <app-car-card [car]="car" />
        }
      </div>
    </section>
  `,
  styles: `
    .listing-filter-control .label-text {
      margin-bottom: 0.45rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class CarsListingPage {
  private readonly carsApi = inject(CarsApi);
  private readonly localeService = inject(LocaleService);
  private readonly route = inject(ActivatedRoute);

  protected readonly cars = signal<Car[]>([]);
  protected readonly status = signal('');
  protected readonly isError = signal(false);
  protected readonly copy = computed(() =>
    this.localeService.locale() === 'ar'
      ? {
          title: 'قائمة السيارات',
          searchLabel: 'بحث',
          searchPlaceholder: 'العلامة، الموديل...',
          listingTypeLabel: 'نوع العرض',
          allOption: 'الكل',
          rentOption: 'إيجار',
          buyOption: 'شراء',
          fuelLabel: 'الوقود',
          sortLabel: 'الترتيب',
          defaultOption: 'الافتراضي',
          priceAscOption: 'السعر من الأقل للأعلى',
          priceDescOption: 'السعر من الأعلى للأقل',
          newestOption: 'الأحدث',
          carTypeLabel: 'نوع السيارة',
          carTypePlaceholder: 'SUV، سيدان...',
          minPriceLabel: 'أقل سعر',
          maxPriceLabel: 'أعلى سعر',
          applyButton: 'تطبيق',
          resetButton: 'إعادة ضبط'
        }
      : {
          title: 'Cars Listing',
          searchLabel: 'Search',
          searchPlaceholder: 'Brand, model...',
          listingTypeLabel: 'Listing Type',
          allOption: 'All',
          rentOption: 'Rent',
          buyOption: 'Buy',
          fuelLabel: 'Fuel',
          sortLabel: 'Sort',
          defaultOption: 'Default',
          priceAscOption: 'Price Low to High',
          priceDescOption: 'Price High to Low',
          newestOption: 'Newest',
          carTypeLabel: 'Car Type',
          carTypePlaceholder: 'SUV, Sedan...',
          minPriceLabel: 'Min Price',
          maxPriceLabel: 'Max Price',
          applyButton: 'Apply',
          resetButton: 'Reset'
        }
  );

  protected readonly filtersForm = new FormGroup({
    searchTerm: new FormControl('', { nonNullable: true }),
    listingType: new FormControl('all', { nonNullable: true }),
    fuelType: new FormControl('all', { nonNullable: true }),
    sortBy: new FormControl('default', { nonNullable: true }),
    carType: new FormControl('', { nonNullable: true }),
    minPrice: new FormControl<number | null>(null),
    maxPrice: new FormControl<number | null>(null)
  });

  protected readonly filteredCars = computed(() => {
    const form = this.filtersForm.getRawValue();

    let filtered = this.cars().filter((car) => {
      const carType = car.listingType.trim().toLowerCase();
      const filterType = form.listingType === 'all' ? 'all' : form.listingType.trim().toLowerCase();

      const matchesType = filterType === 'all' || carType === filterType ||
        (filterType === 'buy' && (carType === 'sell' || carType === 'sale')) ||
        ((filterType === 'sell' || filterType === 'sale') && carType === 'buy');
      const matchesFuel = form.fuelType === 'all' || car.fuelType.toLowerCase().trim() === form.fuelType.toLowerCase().trim();
      const matchesSearch = form.searchTerm.trim().length === 0 ||
        `${car.brand} ${car.model} ${car.name}`.toLowerCase().includes(form.searchTerm.toLowerCase());
      const matchesCarType = form.carType.trim().length === 0 ||
        car.carType.toLowerCase().includes(form.carType.toLowerCase());
      const matchesMinPrice = form.minPrice === null || car.price >= form.minPrice;
      const matchesMaxPrice = form.maxPrice === null || car.price <= form.maxPrice;

      return matchesType && matchesFuel && matchesSearch && matchesCarType && matchesMinPrice && matchesMaxPrice;
    });

    // Apply sorting
    if (form.sortBy === 'priceAsc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (form.sortBy === 'priceDesc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (form.sortBy === 'newest') {
      filtered.sort((a, b) => b.year - a.year);
    }

    return filtered;
  });

  constructor() {
    const resolvedCars = this.route.snapshot.data['cars'] as Car[] | undefined;
    if (resolvedCars && resolvedCars.length > 0) {
      this.cars.set(resolvedCars);
      this.status.set(`${resolvedCars.length} cars loaded.`);
      return;
    }

    this.loadCars();
  }

  protected applyFilters() {
    this.loadCars();
  }

  protected resetFilters() {
    this.filtersForm.reset({
      searchTerm: '',
      listingType: 'all',
      fuelType: 'all',
      sortBy: 'default',
      carType: '',
      minPrice: null,
      maxPrice: null
    });
    this.loadCars();
  }

  private loadCars() {
    this.status.set('');
    this.isError.set(false);

    const filters = this.filtersForm.getRawValue();
    // Only use API filters for search term, fuel type, and price range
    // Listing type is handled client-side due to buy/sell mapping
    const hasDataFilters =
      filters.searchTerm.trim().length > 0 ||
      filters.fuelType !== 'all' ||
      filters.carType.trim().length > 0 ||
      typeof filters.minPrice === 'number' ||
      typeof filters.maxPrice === 'number';

    const request$ = hasDataFilters
      ? this.carsApi.getCars({
          searchTerm: filters.searchTerm,
          fuelType: filters.fuelType,
          carType: filters.carType,
          minPrice: filters.minPrice ?? undefined,
          maxPrice: filters.maxPrice ?? undefined,
          pageNumber: 1,
          pageSize: 24
        })
      : this.carsApi.getCars();

    request$.subscribe({
        next: (cars) => {
          this.cars.set(cars);
          this.status.set(`${cars.length} cars loaded.`);
        },
        error: () => {
          this.isError.set(true);
          this.status.set('Could not load cars right now.');
        }
      });
  }
}
