import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-search',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="card mt-6 border border-base-300 bg-base-100 shadow">
      <div class="card-body grid gap-3 md:grid-cols-4">
        <label class="form-control md:col-span-2">
          <span class="label-text mb-1">Car or brand</span>
          <input formControlName="query" class="input input-bordered" type="text" placeholder="Mercedes, Toyota..." />
        </label>

        <label class="form-control">
          <span class="label-text mb-1">Type</span>
          <select formControlName="listingType" class="select select-bordered">
            <option value="all">Rent + Buy</option>
            <option value="Rent">Rent</option>
            <option value="Buy">Buy</option>
          </select>
        </label>

        <button class="btn btn-primary mt-6 md:mt-0" type="submit">Search</button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickSearchComponent {
  readonly searchChanged = output<{ query: string; listingType: string }>();

  protected readonly form = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    listingType: new FormControl('all', { nonNullable: true })
  });

  protected submit() {
    const value = this.form.getRawValue();
    this.searchChanged.emit({ query: value.query, listingType: value.listingType });
  }
}
