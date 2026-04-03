## Project structure 

```
src/
 ├── app/
 │   ├── core/
 │   │   ├── services/
 │   │   ├── guards/
 │   │   ├── interceptors/
 │   │   ├── interfaces/
 │   │   └── core.config.ts
 │   │
 │   ├── shared/
 │   │   ├── components/
 │   │   ├── directives/
 │   │   ├── pipes/
 │   │   ├── ui/
 │   │   └── shared.config.ts
 │   │
 │   ├── features/
 │   │   ├── auth/
 │   │   │   ├── pages/
 │   │   │   │   ├── login.page.ts
 │   │   │   │   └── register.page.ts
 │   │   │   ├── data-access/
 │   │   │   │   ├── auth.service.ts
 │   │   │   │   ├── auth.store.ts
 │   │   │   │   ├── auth.api.ts
 │   │   │   │   └── auth.interface.ts
 │   │   │   ├── ui/
 │   │   │   │   └── auth-form.component.ts
 │   │   │   ├── utils/
 │   │   │   │   ├── auth.constants.ts
 │   │   │   │   ├── auth.validators.ts
 │   │   │   │   └── auth.helpers.ts
 │   │   │   └── auth.routes.ts
 │   │   │
 │   │   ├── dashboard/
 │   │   │   ├── pages/
 │   │   │   │   └── dashboard.page.ts
 │   │   │   ├── data-access/
 │   │   │   │   ├── dashboard.service.ts
 │   │   │   │   ├── dashboard.api.ts
 │   │   │   │   └── dashboard.interface.ts
 │   │   │   ├── ui/
 │   │   │   │   └── stats-card.component.ts
 │   │   │   ├── utils/
 │   │   │   │   ├── dashboard.constants.ts
 │   │   │   │   └── dashboard.helpers.ts
 │   │   │   └── dashboard.routes.ts
 │   │   │
 │   │   └── user/
 │   │       ├── pages/
 │   │       │   ├── user-list.page.ts
 │   │       │   └── user-details.page.ts
 │   │       ├── data-access/
 │   │       │   ├── user.service.ts
 │   │       │   ├── user.store.ts
 │   │       │   ├── user.api.ts
 │   │       │   └── user.interface.ts
 │   │       ├── ui/
 │   │       │   └── user-form.component.ts
 │   │       ├── utils/
 │   │       │   ├── user.constants.ts
 │   │       │   ├── user.mappers.ts
 │   │       │   └── user.helpers.ts
 │   │       └── user.routes.ts
 │   │
 │   ├── layout/
 │   │   ├── main-layout/
 │   │   ├── auth-layout/
 │   │   └── layout.routes.ts
 │   │
 │   ├── app.routes.ts
 │   ├── app.config.ts
 │   └── app.component.ts
 │
 ├── assets/
 ├── environments/
 └── main.ts
```

It should enforce 

- pages/ - smart container components (can inject services)
- ui/ - dumb/presentational components
- data-access/ - services, API calls, store, interfaces (domain contracts)
- utils/ - pure helpers (no Angular DI)

