import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserProfile } from '../data-access/user.interface';

@Component({
	selector: 'app-user-form',
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-3 sm:grid-cols-2">
			<label class="form-control">
				<span class="label-text">Name</span>
				<input class="input input-bordered" formControlName="name" type="text" />
				@if (isInvalid('name')) {
					<span class="form-error-text text-sm">Please enter your name.</span>
				}
			</label>
			<label class="form-control">
				<span class="label-text">Email</span>
				<input class="input input-bordered" formControlName="email" type="email" />
				@if (isInvalid('email')) {
					@if (form.controls.email.hasError('required')) {
						<span class="form-error-text text-sm">Please enter your email address.</span>
					} @else if (form.controls.email.hasError('email')) {
						<span class="form-error-text text-sm">Please enter a valid email address.</span>
					}
				}
			</label>
			<label class="form-control">
				<span class="label-text">Phone</span>
				<input class="input input-bordered" formControlName="phone" type="text" />
				@if (isInvalid('phone')) {
					<span class="form-error-text text-sm">Please enter your phone number.</span>
				}
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

	protected isInvalid(controlName: 'name' | 'email' | 'phone') {
		const control = this.form.controls[controlName];
		return control.invalid && (control.touched || control.dirty);
	}

	protected submit() {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.submitted.emit(this.form.getRawValue());
	}
}

