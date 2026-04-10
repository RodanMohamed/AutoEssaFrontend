import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../../core/services/locale.service';
import { UserFormComponent } from '../ui/user-form.component';
import { FavoriteCarItem, UserProfile } from '../data-access/user.interface';
import { UserService } from '../data-access/user.service';
import { AuthStore } from '../../auth/data-access/auth.store';

@Component({
	selector: 'app-user-list-page',
	imports: [RouterLink, UserFormComponent],
	template: `
		<section class="space-y-6">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h1 class="font-serif text-3xl">{{ copy().title }}</h1>
				<nav class="tabs tabs-boxed" aria-label="Account sections">
					<a class="tab tab-active" routerLink="/account">{{ copy().favoritesTab }}</a>
					<a class="tab" routerLink="/account/requests">{{ copy().requestsTab }}</a>
				</nav>
			</div>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">{{ copy().profileTitle }}</h2>
					<app-user-form [initialProfile]="profile()" (submitted)="onProfileSave($event)" />
					@if (savedMessage()) {
						<p class="text-sm text-success">{{ savedMessage() }}</p>
					}
				</div>
			</article>

			<article class="card border border-base-300 bg-base-100 shadow">
				<div class="card-body">
					<section class="flex flex-wrap items-center justify-between gap-3">
						<h2 class="card-title">{{ copy().favoritesTitle }}</h2>
						<span class="badge badge-outline">{{ favorites().length }} {{ copy().savedLabel }}</span>
					</section>
					<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						@for (car of favorites(); track car.id) {
							<article class="rounded-2xl border border-base-300 p-4">
								<div class="flex items-start justify-between gap-2">
									<div class="flex items-start gap-3">
										<img
											[src]="car.imageUrl"
											alt="Favorite car image"
											class="h-12 w-16 rounded-lg border border-base-300 object-cover" />
										<div>
										<p class="font-semibold">{{ car.brand }} {{ car.model }}</p>
										<p class="text-sm text-base-content/70">{{ car.year }}</p>
										</div>
									</div>
									<p class="text-primary">EGP {{ car.price }}</p>
								</div>
								<div class="mt-4 flex gap-2">
									<button class="btn btn-xs" type="button" (click)="removeFavorite(car)">Remove</button>
								</div>
							</article>
						}
						@if (favorites().length === 0) {
							<p class="text-sm text-base-content/70">{{ copy().emptyFavorites }}</p>
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
	private readonly localeService = inject(LocaleService);
	private readonly authStore = inject(AuthStore);

	protected readonly favorites = signal<FavoriteCarItem[]>([]);
	protected readonly profile = signal<UserProfile>({ name: '', phone: '', email: '' });
	protected readonly savedMessage = signal('');
	protected readonly copy = computed(() =>
		this.localeService.locale() === 'ar'
			? {
				title: 'حسابي',
				favoritesTab: 'المفضلة',
				requestsTab: 'الطلبات',
				profileTitle: 'الملف الشخصي',
				favoritesTitle: 'السيارات المفضلة',
				savedLabel: 'محفوظة',
				emptyFavorites: 'لا توجد سيارات محفوظة بعد. تصفح السيارات وأضف ما يعجبك إلى المفضلة.'
			}
			: {
				title: 'My Account',
				favoritesTab: 'Favorites',
				requestsTab: 'Requests',
				profileTitle: 'Profile',
				favoritesTitle: 'Favorite Cars',
				savedLabel: 'saved',
				emptyFavorites: 'No saved cars yet. Browse cars and add some to favorites.'
			}
	);

	constructor() {
		this.loadProfile();
		this.loadFavorites();
	}

	protected onProfileSave(value: UserProfile) {
		const session = this.authStore.session();
		if (!session) {
			this.savedMessage.set('Please login again to update your profile.');
			return;
		}

		this.userService.saveProfile(session.user.id, value);
		this.profile.set(value);
		this.savedMessage.set(`Profile saved for ${value.name}.`);
	}

	protected removeFavorite(car: FavoriteCarItem) {
		this.userService.removeFavorite(String(car.id)).subscribe({
			next: () => {
				this.favorites.update((items) => items.filter((item) => item.id !== car.id));
				this.savedMessage.set(`${car.brand} ${car.model} removed from favorites.`);
			},
			error: () => {
				this.savedMessage.set('Unable to remove favorite right now.');
			}
		});
	}

	private loadFavorites() {
		this.userService.getMyFavorites().subscribe({
			next: (payload: unknown) => {
				this.favorites.set(this.userService.mapFavorites(payload));
			},
			error: () => {
				this.favorites.set([]);
			}
		});
	}

	private loadProfile() {
		const session = this.authStore.session();
		if (!session) {
			this.profile.set({ name: '', phone: '', email: '' });
			return;
		}

		const seededProfile: UserProfile = {
			name: session.user.fullName,
			phone: this.userService.getLocalRegisteredPhoneByEmail(session.user.email),
			email: session.user.email
		};

		this.profile.set(this.userService.getProfile(session.user.id, seededProfile));
	}
}

