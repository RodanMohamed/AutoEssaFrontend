import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserFormComponent } from '../ui/user-form.component';
import { FavoriteCarItem } from '../data-access/user.interface';
import { UserService } from '../data-access/user.service';

@Component({
	selector: 'app-user-list-page',
	imports: [RouterLink, UserFormComponent],
	template: `
		<section class="space-y-6">
			<div class="flex items-center justify-between gap-3">
				<h1 class="font-serif text-3xl">My Account</h1>
				<a routerLink="/account/requests" class="btn btn-outline btn-sm">View Requests</a>
			</div>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">Profile</h2>
					<app-user-form (submitted)="onProfileSave($event)" />
					@if (savedMessage()) {
						<p class="text-sm text-success">{{ savedMessage() }}</p>
					}
				</div>
			</article>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">Favorite Cars</h2>
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						@for (car of favorites(); track car.id) {
							<div class="rounded-xl border border-base-300 p-4">
								<p class="font-semibold">{{ car.brand }} {{ car.model }}</p>
								<p class="text-sm text-base-content/70">{{ car.year }}</p>
								<p class="text-primary">EGP {{ car.price }}</p>
							</div>
						}
					</div>
				</div>
			</article>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UserListPage {
	private readonly userService = inject(UserService);

	protected readonly favorites = signal<FavoriteCarItem[]>([]);
	protected readonly savedMessage = signal('');

	constructor() {
		this.userService.getMyFavorites().subscribe((items) => this.favorites.set(items));
	}

	protected onProfileSave(value: { name: string; phone: string }) {
		this.savedMessage.set(`Profile saved for ${value.name}.`);
	}
}

