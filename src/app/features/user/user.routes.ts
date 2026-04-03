import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/user-list.page')
	},
	{
		path: 'requests',
		loadComponent: () => import('./pages/user-details.page')
	}
];
