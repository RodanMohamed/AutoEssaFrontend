import { Routes } from '@angular/router';

import { adminGuard } from '../core/guards/admin.guard';
import { authGuard } from '../core/guards/auth.guard';
import { carsResolver, featuredCarsResolver } from '../features/cars/data-access/cars.resolvers';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';

export const LAYOUT_ROUTES: Routes = [
	{
		path: '',
		component: MainLayoutComponent,
		children: [
			{
				path: '',
				resolve: {
					cars: featuredCarsResolver
				},
				loadComponent: () => import('../features/home/pages/landing.page')
			},
			{
				path: 'dashboard',
				canActivate: [adminGuard],
				loadChildren: () => import('../features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
			},
			{
				path: 'account',
				canActivate: [authGuard],
				loadChildren: () => import('../features/user/user.routes').then((m) => m.USER_ROUTES)
			},
			{
				path: 'cars',
				canActivate: [authGuard],
				resolve: {
					cars: carsResolver
				},
				loadComponent: () => import('../features/cars/pages/cars-listing.page')
			},
			{
				path: 'cars/:id',
				canActivate: [authGuard],
				loadComponent: () => import('../features/cars/pages/car-details.page')
			},
			{
				path: 'request-car',
				canActivate: [authGuard],
				loadComponent: () => import('../features/cars/pages/request-car.page')
			},
			{
				path: 'about',
				canActivate: [authGuard],
				loadComponent: () => import('../features/about/pages/about.page')
			},
			{
				path: 'contact',
				canActivate: [authGuard],
				loadComponent: () => import('../features/contact/pages/contact.page')
			}
		]
	},
	{
		path: 'auth',
		component: AuthLayoutComponent,
		loadChildren: () => import('../features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
