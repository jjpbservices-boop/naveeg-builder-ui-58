import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    console.log('🚀 Naveeg App mounted successfully!');
    console.log('📍 Current location:', window.location.href);
    console.log('🧪 Router object:', router);
  }, []);

  try {
    return (
      <RouterProvider router={router} />
    );
  } catch (error) {
    console.error('❌ Router error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-900 mb-4">
            ⚠️ Router Error
          </h1>
          <p className="text-lg text-red-700 mb-6">
            There was an error with the router.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Details
            </h2>
            <p className="text-gray-600 font-mono text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
