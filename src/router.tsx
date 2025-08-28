import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from '@/components/Layout';

// Import pages
import Home from '@/pages/Home';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Gallery from '@/pages/Gallery';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Legal from '@/pages/Legal';
import Blog from '@/pages/Blog';
import HowItWorks from '@/pages/HowItWorks';
import Describe from '@/pages/Describe';
import Brief from '@/pages/Brief';
import Design from '@/pages/Design';
import Generate from '@/pages/Generate';
import Generating from '@/pages/Generating';
import Ready from '@/pages/Ready';
import Preview from '@/pages/Preview';
import Dashboard from '@/pages/Dashboard';
import Workspace from '@/pages/Workspace';
import Settings from '@/pages/Settings';
import Plans from '@/pages/Plans';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Layout wrapper for non-dashboard routes
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Define routes with layout
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Home,
});

const featuresRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/features',
  component: Features,
});

const pricingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/pricing',
  component: Pricing,
});

const galleryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/gallery',
  component: Gallery,
});

const faqRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/faq',
  component: FAQ,
});

const contactRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/contact',
  component: Contact,
});

const legalRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/legal',
  component: Legal,
});

const blogRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/blog',
  component: Blog,
});

const howItWorksRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/how-it-works',
  component: HowItWorks,
});

// Onboarding routes
const onboardingBriefRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/onboarding/brief',
  component: Brief,
});

const onboardingDesignRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/onboarding/design',
  component: Design,
});

const generateRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/generate',
  component: Generate,
});

const generatingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/generating',
  component: Generating,
});

const readyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/ready',
  component: Ready,
});

// Legacy routes for backward compatibility
const describeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/describe',
  component: Describe,
});

const briefRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/brief',
  component: Brief,
});

const designRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/design',
  component: Design,
});

const previewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/preview',
  component: Preview,
});

// Dashboard routes WITHOUT layout (no header/footer)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace',
  component: Workspace,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const plansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/plans',
  component: Plans,
});

const authRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/auth',
  component: Auth,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      context: (search.context as string) || undefined,
    }
  },
});

const notFoundRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/$',
  component: NotFound,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    featuresRoute,
    pricingRoute,
    galleryRoute,
    faqRoute,
    contactRoute,
    legalRoute,
    blogRoute,
    howItWorksRoute,
    onboardingBriefRoute,
    onboardingDesignRoute,
    describeRoute,
    briefRoute,
    designRoute,
    generateRoute,
    generatingRoute,
    readyRoute,
    previewRoute,
    authRoute,
    notFoundRoute,
  ]),
  dashboardRoute,
  workspaceRoute,
  settingsRoute,
  plansRoute,
]);

// Create router
export const router = createRouter({ 
  routeTree,
} as any);