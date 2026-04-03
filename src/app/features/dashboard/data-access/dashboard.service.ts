import { Injectable, inject } from '@angular/core';

import { DashboardApi } from './dashboard.api';

@Injectable({ providedIn: 'root' })
export class DashboardService {
	private readonly api = inject(DashboardApi);

	readonly getStats = () => this.api.getStats();
	readonly getLatestBookingRequests = () => this.api.getLatestBookingRequests();
}

