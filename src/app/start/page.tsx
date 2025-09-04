'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StartPage() {
  const router = useRouter();
  const { business, setBusiness, setCurrentStep, setSiteId, setJobId, setIsPolling, setProgressMessage } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the site creation edge function
      const { data, error } = await supabase.functions.invoke('site', {
        body: {
          action: 'create-site',
          business_name: business.name,
          business_description: business.description
        }
      });

      if (error) throw error;

      // Update store with site and job IDs
      setSiteId(data.site_id);
      setJobId(data.job_id);
      setCurrentStep(1);
      setIsPolling(true);
      setProgressMessage('Analyzing your description…');

      // Start polling for job status
      pollJobStatus(data.job_id);

    } catch (err) {
      setError(err.message || 'Failed to create site. Please try again.');
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('site', {
          body: {
            action: 'get-job',
            job_id: jobId
          }
        });

        if (error) throw error;

        // Update progress message based on job status
        if (data.status === 'processing') {
          const messages = [
            'Analyzing your description…',
            'Generating your main pages…',
            'Optimizing your content…',
            'Finalizing your website…'
          ];
          const messageIndex = Math.min(Math.floor(data.progress / 25), messages.length - 1);
          setProgressMessage(messages[messageIndex]);
        } else if (data.status === 'ready') {
          clearInterval(pollInterval);
          setIsPolling(false);
          setProgressMessage('Website created successfully!');
          // Navigate to brief step
          router.push('/brief');
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          setIsPolling(false);
          setError('Failed to create website. Please try again.');
        }
      } catch (err) {
        console.error('Polling error:', err);
        clearInterval(pollInterval);
        setIsLoading(false);
        setError('Failed to check status. Please try again.');
      }
    }, 2000);

    // Timeout after 90 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      setError('Creation timed out. Please try again.');
    }, 90000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Let's create your website
            </h1>
            <p className="text-xl text-gray-600">
              Tell us about your business and we'll build a professional website in minutes
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {progressMessage}
              </h3>
              <p className="text-gray-600">
                This usually takes 1-2 minutes
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  id="business_name"
                  value={business.name}
                  onChange={(e) => setBusiness({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bakery Soft"
                  required
                />
              </div>

              <div>
                <label htmlFor="business_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  id="business_description"
                  value={business.description}
                  onChange={(e) => setBusiness({ description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what your business does, your products or services, and what makes you unique..."
                  rows={4}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start in 2 minutes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
