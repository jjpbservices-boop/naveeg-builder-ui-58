'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DesignPage() {
  const router = useRouter();
  const { 
    theme, 
    setTheme, 
    setCurrentStep,
    siteId,
    sitemap
  } = useOnboardingStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Save theme to database
      const { error } = await supabase
        .from('sites')
        .update({
          meta: {
            theme
          }
        })
        .eq('id', siteId);

      if (error) throw error;

      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to save design. Please try again.');
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Generate website from sitemap and theme
      const { error } = await supabase.functions.invoke('site', {
        body: {
          action: 'generate-from-sitemap',
          site_id: siteId,
          sitemap,
          theme
        }
      });

      if (error) throw error;

      // Show auth modal
      setShowAuthModal(true);
    } catch (err) {
      setError(err.message || 'Failed to generate website. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push(`/dashboard/${siteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Design Controls */}
      <div className="w-1/3 bg-white p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Preferences</h1>
          <p className="text-gray-600">Choose your colors and fonts</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-orange-500 mx-2"></div>
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
          </div>
          <span className="ml-4 text-sm text-gray-600">Design</span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.primary}
                onChange={(e) => setTheme({ primary: e.target.value })}
                className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.primary}
                onChange={(e) => setTheme({ primary: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.secondary}
                onChange={(e) => setTheme({ secondary: e.target.value })}
                className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondary}
                onChange={(e) => setTheme({ secondary: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Dark
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.darkBg}
                onChange={(e) => setTheme({ darkBg: e.target.value })}
                className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.darkBg}
                onChange={(e) => setTheme({ darkBg: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Font
            </label>
            <select
              value={theme.font}
              onChange={(e) => setTheme({ font: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-white text-orange-500 border border-orange-500 py-3 px-6 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full mt-4 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? 'Generating...' : 'Preview Website'}
          <span className="ml-2">✨</span>
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          You can customize your website after previewing
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Right Panel - Sitemap Preview */}
      <div className="flex-1 bg-gray-100 p-8">
        <div className="bg-white rounded-lg p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Preview</h3>
          
          {/* Sitemap visualization */}
          <div className="space-y-4">
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Home</span>
                <span className="text-gray-400">🏠</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-200 p-3 rounded text-center">
                <span className="text-sm font-medium">Hero Section</span>
              </div>
              <div className="bg-gray-200 p-3 rounded text-center">
                <span className="text-sm font-medium">About Us</span>
              </div>
              <div className="bg-gray-200 p-3 rounded text-center">
                <span className="text-sm font-medium">Our Offerings</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-200 p-3 rounded text-center">
                <span className="text-sm font-medium">Why Choose Us</span>
              </div>
              <div className="bg-gray-200 p-3 rounded text-center">
                <span className="text-sm font-medium">Testimonials</span>
              </div>
              <div className="bg-gray-200 p-3 rounded text-center">
                <span className="text-sm font-medium">Contact Us</span>
              </div>
            </div>

            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors">
              + Add Page (Max 6)
            </button>

            {/* Category sections */}
            <div className="grid grid-cols-5 gap-4 mt-6">
              {['About', 'Our Bread Selection...', 'Our Cakes', 'Other Desserts', 'Contact'].map((category, index) => (
                <div key={index} className="bg-gray-800 text-white p-3 rounded text-center">
                  <span className="text-sm font-medium">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onSuccess={handleAuthSuccess} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

// Auth Modal Component
function AuthModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Show success message
      alert('Check your email for the magic link!');
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign up to preview your website</h2>
        <p className="text-gray-600 mb-6">
          Get 7 days free to preview and customize your website
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
