import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./pages/login.page')
	},
	{
		path: 'register',
		loadComponent: () => import('./pages/register.page')
	},
	{
		path: 'forgot-password',
		loadComponent: () => import('./pages/forgot-password.page')
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	}
];

