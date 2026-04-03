import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
	selector: 'app-user-form',
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-3 sm:grid-cols-2">
			<label class="form-control">
				<span class="label-text">Name</span>
				<input class="input input-bordered" formControlName="name" type="text" />
			</label>
			<label class="form-control">
				<span class="label-text">Phone</span>
				<input class="input input-bordered" formControlName="phone" type="text" />
			</label>
			<div class="sm:col-span-2">
				<button class="btn btn-primary" [disabled]="form.invalid" type="submit">Save Profile</button>
			</div>
		</form>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {
	readonly submitted = output<{ name: string; phone: string }>();

	protected readonly form = new FormGroup({
		name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		phone: new FormControl('', { nonNullable: true, validators: [Validators.required] })
	});

	protected submit() {
		if (this.form.invalid) {
			return;
		}

		this.submitted.emit(this.form.getRawValue());
	}
}

