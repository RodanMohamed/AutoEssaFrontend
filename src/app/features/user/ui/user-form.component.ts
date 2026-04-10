import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserProfile } from '../data-access/user.interface';

@Component({
	selector: 'app-user-form',
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-3 sm:grid-cols-2">
			<label class="form-control">
				<span class="label-text mr-2">Name</span>
				<input class="input input-bordered" formControlName="name" type="text" />
			</label>
			<label class="form-control">
				<span class="label-text m2-2">Email</span>
				<input class="input input-bordered" formControlName="email" type="email" />
			</label>
			<label class="form-control">
				<span class="label-text mr-2">Phone</span>
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
	readonly initialProfile = input<UserProfile | null>(null);
	readonly submitted = output<UserProfile>();

	protected readonly form = new FormGroup({
		name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
		phone: new FormControl('', { nonNullable: true, validators: [Validators.required] })
	});

	constructor() {
		effect(() => {
			const profile = this.initialProfile();
			if (!profile) {
				return;
			}

			this.form.patchValue({
				name: profile.name,
				email: profile.email,
				phone: profile.phone
			}, { emitEvent: false });
		});
	}

	protected submit() {
		if (this.form.invalid) {
			return;
		}

		this.submitted.emit(this.form.getRawValue());
	}
}

