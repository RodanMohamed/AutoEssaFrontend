#  AutoEssa Frontend

**Premium Car Marketplace** - A modern Angular 21 application for renting and buying cars with seamless user experience and powerful filtering capabilities.

![Angular](https://img.shields.io/badge/Angular-21.2-red?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [Building for Production](#-building-for-production)
- [API Configuration](#-api-configuration)
- [Key Features Details](#-key-features-details)
- [Authentication](#-authentication)
- [Contributing](#-contributing)

---

##  Features

###  Home Page
- **Hero Section** - Compelling introduction with call-to-action
- **Why Choose Us** - Showcase 6 unique selling points (Transparency, Communication, Verification, Flexibility, Expert Guidance, Easy Booking)
- **Quick Search** - Fast car discovery with instant results
- **Market Snapshot** - Live inventory insights and statistics
- **Curated Selection** - Dynamic animated wave visualization showing active curation
- **Featured Cars** - Latest and trending vehicles

###  Cars Listing
- **Advanced Filtering**
  - Search by brand, model, name, or type
  - Filter by listing type (Rent/Buy)
  - Filter by fuel type (Petrol, Diesel, Hybrid, Electric)
  - Price range filtering (min/max)
  - Car type filtering
- **Smart Sorting**
  - Price low to high
  - Price high to low
  - Newest first
- **Responsive Grid Layout** - Mobile, tablet, and desktop optimized

###  Authentication
- **Registration** - Create new account with validation
- **Login** - Secure authentication with session management
- **Password Reset** - Email-based password recovery
- **Auth Guards** - Protect routes based on user roles
- **Auth Interceptor** - Automatic token injection in API requests

###  User Dashboard
- **User Information** - View and manage profile details
- **Bookings Management** - Track rental and purchase bookings
- **Favorites** - Save favorite vehicles
- **Transaction History** - View past bookings and purchases

###  Internationalization (i18n)
- **Dual Language Support** - English & Arabic
- **Locale Switching** - Seamless language toggling
- **RTL Support** - Full right-to-left support for Arabic
- **Responsive Localization** - All content localized dynamically

###  Core Features
- **Car Details Page** - Comprehensive vehicle information
- **About Page** - Company information and values
- **Contact Page** - Customer support contact form
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Accessibility** - WCAG compliant components

---

##  Tech Stack

### **Frontend Framework**
- **Angular 21.2** - Latest Angular framework with signal-based reactivity
- **TypeScript 5.4** - Type-safe development
- **Standalone Components** - Modern Angular architecture without NgModules

### **Styling & UI**
- **Tailwind CSS 3** - Utility-first CSS framework
- **DaisyUI** - Beautiful component library built on Tailwind
- **Angular Material 21** - Material Design components

### **State Management & Reactivity**
- **Angular Signals** - Fine-grained reactivity for optimal performance
- **Computed Values** - Automatic dependency tracking
- **Reactive Forms** - Type-safe form handling

### **HTTP & API**
- **HttpClient** - Built-in Angular HTTP client
- **Interceptors** - Request/response interceptors for authentication
- **API Caching** - Memory and localStorage caching strategy

### **Routing**
- **Angular Router 21** - Advanced routing with lazy loading
- **Route Guards** - Auth and admin guards for protected routes
- **Resolvers** - Data pre-loading for routes

### **Build & Dev Tools**
- **Angular CLI 21** - Official Angular build tool
- **Vercel** - Deployment platform
- **npm 11.6** - Package manager

---

##  Project Structure

```
src/
├── app/
│   ├── core/                    # Core services & configuration
│   │   ├── core.config.ts       # Dependency injection providers
│   │   ├── guards/              # Route authentication guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── interfaces/          # Shared interfaces
│   │   └── services/            # Core services (auth, locale)
│   │
│   ├── features/                # Feature modules
│   │   ├── home/                # Landing page feature
│   │   │   ├── pages/           # Page components
│   │   │   ├── ui/              # Reusable feature components
│   │   │   └── data-access/     # API services & data models
│   │   ├── auth/                # Authentication feature
│   │   │   ├── pages/           # Login, register, forgot-password
│   │   │   ├── data-access/     # Auth API & models
│   │   │   ├── ui/              # Auth UI components
│   │   │   └── utils/           # Validators & constants
│   │   ├── cars/                # Cars listing & details
│   │   ├── dashboard/           # User dashboard
│   │   ├── user/                # User profile management
│   │   ├── about/               # About page
│   │   └── contact/             # Contact page
│   │
│   ├── layout/                  # Layout components
│   │   ├── auth-layout/         # Auth page layout
│   │   └── main-layout/         # Main app layout
│   │
│   ├── shared/                  # Shared resources
│   │   ├── components/          # Shared components
│   │   ├── directives/          # Custom directives
│   │   ├── pipes/               # Custom pipes
│   │   ├── ui/                  # Reusable UI components
│   │   └── validators/          # Custom validators
│   │
│   ├── app.routes.ts            # Main routing configuration
│   ├── app.config.ts            # Application configuration
│   └── app.ts                   # Root component
│
├── environments/                # Environment configurations
│   ├── environment.ts           # Production environment
│   └── environment.development.ts  # Development environment
│
├── main.ts                      # Application entry point
└── styles.css                   # Global styles

public/                          # Static assets
```

---

##  Getting Started

### Prerequisites
- **Node.js** 20+ (Check: `node --version`)
- **npm** 11.6+ (Check: `npm --version`)
- **Angular CLI** 21 (Install: `npm install -g @angular/cli@21`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/autoessa-frontend.git
   cd autoessa-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Open `src/environments/environment.ts`
   - Update `API_BASE_URL` to your backend API endpoint

4. **Verify installation**
   ```bash
   npm run ng version
   ```

---

## 📱 Running the Application

### Development Server
```bash
npm start
```
- Navigate to `http://localhost:4200/`
- Application will auto-reload on code changes
- Hot module replacement enabled for styles

### Run Tests
```bash
npm test
```
- Executes unit tests using Jasmine/Karma
- Watch mode enabled for development

### Build for Production
```bash
npm run build
```
- Optimized production build in `dist/` directory
- Code splitting, tree-shaking, and minification applied
- Source maps generated for debugging

### Watch Mode (Development)
```bash
npm run watch
```
- Continuous build while developing
- Useful for library development or multi-workspace setups

---

## 🔧 API Configuration

### Environment Files

**Development** (`src/environments/environment.development.ts`):
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000'
};
```

**Production** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.autoessa.com'
};
```

### API Base URL
- Update in `src/core/core.config.ts`
- Used by all HTTP services via injection token
- Applied automatically to all API requests

---

##  Authentication

### Login Flow
1. User enters credentials (email/password)
2. Backend verifies and returns JWT token
3. Token stored in localStorage
4. Auth interceptor adds token to all requests
5. Router guards verify authentication on protected routes

### Protected Routes
```typescript
path: 'dashboard',
canActivate: [authGuard],
component: DashboardComponent
```

### Password Reset
1. User enters email and new password
2. API validates email and updates password
3. User redirected to login after successful reset

---

##  Key Features Details

###  Responsive Design
- **Mobile-First Approach** - Optimized for all screen sizes
- **Tailwind Breakpoints**:
  - `sm` (640px) - Tablets
  - `md` (768px) - Small laptops
  - `lg` (1024px) - Laptops
  - `xl` (1280px) - Desktops

###  Localization
- **Arabic & English** - Full bidirectional support
- **RTL/LTR Layout** - Automatic layout mirroring
- **Text Switching** - Dynamic locale changes without reload
- **Service**: `LocaleService` in `src/app/core/services/locale.service.ts`

###  Filtering & Search
- **Client-Side Filtering** - Instant results
- **Server-Side Pagination** - Efficient data loading
- **Smart Buy/Sell Mapping** - "Buy" filter searches for "Sell" listings
- **Sorting Options** - Multiple sort criteria

###  Performance Optimizations
- **OnPush Change Detection** - Optimal performance
- **Signal-Based Reactivity** - Minimal re-renders
- **Lazy Loading Routes** - Code-splitting for faster initial load
- **Image Optimization** - Responsive images with proper sizing
- **HTTP Caching** - Intelligent response caching

---

##  Build & Deployment

### Build Output
```bash
npm run build
```
Output directory: `dist/autoessa-frontend/`

### Deployment to Vercel
```bash
npm install -g vercel
vercel deploy
```

### Environment Variables
Create `.env.local` at project root:
```
NG_APP_API_URL=https://api.autoessa.com
NG_APP_ENVIRONMENT=production
```

---

##  Contributing

### Code Style
- **TypeScript** - Strict mode enabled
- **Angular Style Guide** - Official conventions followed
- **ESLint** - Code linting configured
- **Prettier** - Code formatting (optional)

### Component Guidelines
- Use **Standalone Components** (no NgModules)
- Implement **OnPush Change Detection**
- Use **Signals** for state management
- Follow **SMART Naming Convention** - Single Responsibility, Meaningful names

### Adding Features
1. Create feature folder in `src/app/features/`
2. Organize with `pages/`, `ui/`, `data-access/` folders
3. Create routing file: `feature.routes.ts`
4. Export standalone components
5. Add API service in `data-access/` folder

### Git Workflow
```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: describe your feature"
git push origin feature/your-feature-name
```

---

##  Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/autoessa-frontend/issues)
- **Email**: support@autoessa.com
- **Website**: https://autoessa.com

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- **Angular Team** - For the amazing framework
- **Vercel** - For seamless deployment
- **TailwindCSS** - For utility-first CSS
- **DaisyUI** - For beautiful components

---

##  Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Best Practices](https://angular.io/guide/styleguide)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---
u can see the deployed website here : https://auto-essa-frontend.vercel.app/
**Made with  Rodan Mohamed**
Last Updated: April 13, 2026
