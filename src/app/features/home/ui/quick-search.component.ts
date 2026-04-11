import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-search',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-4xl border border-base-300 bg-base-100/95 shadow-2xl">
      <div class="space-y-5 p-5 md:p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-base-content/55">{{ copy().eyebrow }}</p>
            <h3 class="mt-2 font-serif text-2xl">{{ copy().title }}</h3>
          </div>
          <span class="badge badge-outline">{{ copy().badge }}</span>
        </div>

        <div class="grid gap-4 md:grid-cols-[1.25fr_0.75fr_auto] md:items-end">
          <label class="form-control">
            <span class="mb-1 block text-sm font-medium">{{ copy().searchLabel }}</span>
            <input formControlName="query" class="input input-bordered input-lg" type="text" [placeholder]="copy().searchPlaceholder" />
          </label>

          <label class="form-control">
            <span class="mb-1 block text-sm font-medium">{{ copy().typeLabel }}</span>
            <select formControlName="listingType" class="select select-bordered select-lg">
              <option value="all">{{ copy().allOption }}</option>
              <option value="Rent">{{ copy().rentOption }}</option>
              <option value="Buy">{{ copy().buyOption }}</option>
            </select>
          </label>

          <button class="btn btn-primary btn-lg px-8" type="submit">{{ copy().searchButton }}</button>
        </div>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickSearchComponent {
  readonly searchChanged = output<{ query: string; listingType: string }>();

  protected readonly copy = computed(() => ({
    eyebrow: 'Search now',
    title: 'Find the right car',
    badge: 'Fast',
    searchLabel: 'Car or brand',
    searchPlaceholder: 'Mercedes, Toyota...',
    typeLabel: 'Type',
    allOption: 'Rent + Buy',
    rentOption: 'Rent',
    buyOption: 'Buy',
    searchButton: 'Search'
  }));

  protected readonly form = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    listingType: new FormControl('all', { nonNullable: true })
  });

  protected submit() {
    const value = this.form.getRawValue();
    this.searchChanged.emit({ query: value.query, listingType: value.listingType });
  }
}
