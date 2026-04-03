import { Injectable, inject } from '@angular/core';

import { UserApi } from './user.api';

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly api = inject(UserApi);

	readonly getMyFavorites = () => this.api.getMyFavorites();
	readonly getMyBookingRequests = () => this.api.getMyBookingRequests();
}

