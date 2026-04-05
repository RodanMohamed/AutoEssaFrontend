import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/dashboard.page')
	},
	{
		path: 'cars',
		loadComponent: () => import('./pages/admin-cars.page')
	},
	{
		path: 'requests',
		loadComponent: () => import('./pages/admin-requests.page')
	},
	{
		path: 'moderation',
		loadComponent: () => import('./pages/admin-moderation.page')
	},
	{
		path: 'content',
		loadComponent: () => import('./pages/admin-content.page')
	}
];

