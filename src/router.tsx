import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';

// Type declarations for TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Simple index route for now
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Naveeg Backend</h1>
        <p className="text-gray-600">Backend integrations ready for new UI</p>
      </div>
    </div>
  ),
});

// API health check route
const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health',
  component: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 text-green-600">✅ Healthy</h1>
        <p className="text-gray-600">Backend services are running</p>
      </div>
    </div>
  ),
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  healthRoute,
]);

export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}