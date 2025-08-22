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
import Describe from '@/pages/Describe';
import Brief from '@/pages/Brief';
import Design from '@/pages/Design';
import Generate from '@/pages/Generate';
import Ready from '@/pages/Ready';
import Preview from '@/pages/Preview';
import Dashboard from '@/pages/Dashboard';
import Workspace from '@/pages/Workspace';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: Features,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: Pricing,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: Gallery,
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/faq',
  component: FAQ,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
});

const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal',
  component: Legal,
});

// Onboarding routes
const onboardingBriefRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/brief',
  component: Brief,
});

const onboardingDesignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/design',
  component: Design,
});

const generateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generate',
  component: Generate,
});

const readyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ready',
  component: Ready,
});

// Legacy routes for backward compatibility
const describeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/describe',
  component: Describe,
});

const briefRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brief',
  component: Brief,
});

const designRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design',
  component: Design,
});

const previewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preview',
  component: Preview,
});

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

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$',
  component: NotFound,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  featuresRoute,
  pricingRoute,
  galleryRoute,
  faqRoute,
  contactRoute,
  legalRoute,
  onboardingBriefRoute,
  onboardingDesignRoute,
  describeRoute,
  briefRoute,
  designRoute,
  generateRoute,
  readyRoute,
  previewRoute,
  dashboardRoute,
  workspaceRoute,
  settingsRoute,
  notFoundRoute,
]);

// Create router
export const router = createRouter({ 
  routeTree,
} as any);