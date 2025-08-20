import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from '@/components/Layout';

// Import pages
import Landing from '@/pages/Landing';
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
  component: Landing,
});

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