# Naveeg Onboarding + Dashboard Implementation

This document outlines the comprehensive onboarding and dashboard system that has been implemented for the Naveeg platform.

## 🎯 Overview

The system provides a complete user journey from marketing site onboarding to dashboard management, with the following key features:

- **Onboarding Flow**: Multi-step website creation process
- **Dashboard**: Retractable sidebar with analytics, billing, and settings
- **Analytics**: PageSpeed Insights integration with performance monitoring
- **Billing**: Stripe integration for subscription management
- **One-Site-Per-User**: Enforced database constraint and UI logic

## 🏗️ Architecture

### Apps Structure

```
apps/
├── marketing/          # Public marketing site with onboarding
│   ├── /start         # Onboarding flow
│   ├── /success       # Success page
│   └── actions/       # Server actions for site creation
└── dashboard/          # Protected dashboard application
    ├── /app           # Main dashboard routes
    │   ├── /overview  # Dashboard overview
    │   ├── /analytics # Performance analytics
    │   ├── /billing   # Subscription management
    │   └── /settings  # Account settings
    └── api/           # API routes for external services
```

### Shared Packages

```
packages/
├── lib/               # Business logic and integrations
│   ├── billing/       # Plan definitions and pricing
│   ├── analytics/     # PSI and TenWeb APIs
│   └── supabase/      # Database and auth
└── ui/                # Reusable UI components
    ├── components/    # Dashboard components
    └── utils/         # Utility functions
```

## 🚀 Key Features

### 1. Onboarding Flow (`/start`)

- **3-Step Process**: Business type → Goals → Brand vibe
- **Progress Persistence**: Saves to localStorage
- **One-Site Enforcement**: Redirects existing users to dashboard
- **Server Action**: `createSite()` handles authentication and site creation

### 2. Dashboard Layout

- **Retractable Sidebar**: Collapsible navigation with keyboard shortcuts (⌘/Ctrl+B)
- **Sticky Header**: Site info, plan badges, user menu
- **Responsive Design**: Mobile-friendly layout with proper focus management

### 3. Analytics Integration

- **PageSpeed Insights**: Real-time performance audits
- **Mobile/Desktop**: Strategy selection for comprehensive testing
- **Performance Metrics**: LCP, CLS, TTI, FCP with visual indicators
- **Audit History**: Persistent storage of performance data

### 4. Billing System

- **Plan Management**: Starter (€49), Pro (€99), Custom (Contact)
- **Stripe Integration**: Checkout sessions and customer portal
- **Upgrade Flow**: Seamless plan transitions
- **Billing History**: Transaction tracking and management

### 5. Settings & Profile

- **Profile Management**: Editable user information
- **Preferences**: Notification and communication settings
- **Account Actions**: Sign out, data export, account deletion
- **Security**: Two-factor authentication support

## 🔧 Technical Implementation

### Database Schema

The system uses the existing Supabase schema with these key tables:

```sql
-- One site per user enforcement
CREATE UNIQUE INDEX sites_owner_unique ON sites(owner);

-- RLS policies for data security
CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT USING (auth.uid() = owner);
```

### Authentication Flow

1. **Marketing Site**: Public access, no authentication required
2. **Site Creation**: Triggers auth flow if user not logged in
3. **Dashboard**: Protected routes with Supabase auth
4. **Session Management**: Server-side auth with `@supabase/ssr`

### API Routes

- `POST /api/checkout`: Creates Stripe checkout sessions
- `POST /api/portal`: Generates Stripe customer portal URLs
- `POST /api/psi`: Runs PageSpeed Insights audits

### Component Architecture

- **Server Components**: Layout and data fetching
- **Client Components**: Interactive elements and state management
- **Shared Components**: Reusable UI elements across apps
- **Type Safety**: Full TypeScript implementation

## 🎨 UI/UX Features

### Design System

- **Consistent Spacing**: 8px grid system
- **Color Palette**: Semantic colors for status and actions
- **Typography**: Clear hierarchy with proper contrast
- **Animations**: Smooth transitions with Framer Motion

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus rings and logical tab order
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Motion Preferences**: Respects `prefers-reduced-motion`

### Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoint System**: Consistent responsive behavior
- **Touch Friendly**: Proper touch targets and gestures

## 🔐 Security Features

### Data Protection

- **Row Level Security**: Database-level access control
- **User Isolation**: Users can only access their own data
- **Input Validation**: Server-side validation for all inputs
- **API Security**: Protected routes with proper authentication

### Authentication

- **Supabase Auth**: Secure authentication system
- **Session Management**: Proper session handling
- **Magic Links**: Passwordless authentication option
- **OAuth Support**: Social login integration ready

## 📊 Performance Features

### Optimization

- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Optimized package imports
- **Caching**: Strategic caching for analytics data

### Monitoring

- **Performance Metrics**: Core Web Vitals tracking
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Proper loading indicators
- **Progressive Enhancement**: Graceful degradation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase project with proper schema
- Stripe account with configured products
- PageSpeed Insights API key

### Environment Setup

1. Copy environment files:
   ```bash
   cp apps/marketing/env.example apps/marketing/.env.local
   cp apps/dashboard/env.example apps/dashboard/.env.local
   ```

2. Configure environment variables:
   - Supabase credentials
   - Stripe API keys
   - PSI API key
   - App URLs and secrets

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development servers:
   ```bash
   # Marketing site (port 4311)
   pnpm --filter marketing dev
   
   # Dashboard (port 4312)
   pnpm --filter dashboard dev
   ```

3. Access the applications:
   - Marketing: http://localhost:4311
   - Dashboard: http://localhost:4312

## 🧪 Testing

### Manual Testing

1. **Onboarding Flow**: Complete the 3-step process
2. **Dashboard Navigation**: Test sidebar collapse/expand
3. **Analytics**: Run PSI audits with real URLs
4. **Billing**: Test plan upgrades and portal access

### Automated Testing

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API route testing
- **E2E Tests**: Complete user journey testing

## 🔮 Future Enhancements

### Planned Features

- **TenWeb Integration**: Advanced analytics platform
- **Automated Snapshots**: Scheduled performance monitoring
- **Advanced Reporting**: Custom analytics dashboards
- **Team Collaboration**: Multi-user site management

### Technical Improvements

- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker implementation
- **Advanced Caching**: Redis integration
- **Performance Monitoring**: Application performance monitoring

## 📝 API Documentation

### PageSpeed Insights API

```typescript
POST /api/psi
{
  "url": "https://example.com",
  "strategy": "mobile" | "desktop"
}

Response:
{
  "success": true,
  "data": {
    "metrics": {
      "performance": 85,
      "accessibility": 92,
      "bestPractices": 78,
      "seo": 95,
      "lcp": 2.1,
      "cls": 0.05,
      "tti": 3.2
    }
  }
}
```

### Stripe Checkout API

```typescript
POST /api/checkout
{
  "plan": "starter" | "pro"
}

Response:
{
  "url": "https://checkout.stripe.com/..."
}
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow existing patterns and ESLint rules
2. **Type Safety**: Maintain full TypeScript coverage
3. **Testing**: Add tests for new features
4. **Documentation**: Update docs for API changes

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback

## 📄 License

This project is proprietary software. All rights reserved.

---

For questions or support, contact the development team or refer to the internal documentation.
