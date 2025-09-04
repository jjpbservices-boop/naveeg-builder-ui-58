'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();
  const { siteId } = useOnboardingStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/start');
          return;
        }

        if (data.session) {
          // Attach site to user if we have a siteId
          if (siteId) {
            try {
              const { error: attachError } = await supabase.functions.invoke('site', {
                body: {
                  action: 'attach-user',
                  site_id: siteId
                }
              });

              if (attachError) {
                console.error('Error attaching site:', attachError);
              }
            } catch (err) {
              console.error('Error calling attach-user:', err);
            }
          }

          // Redirect to dashboard
          if (siteId) {
            router.push(`/dashboard/${siteId}`);
          } else {
            // If no siteId, redirect to start or find user's latest site
            router.push('/start');
          }
        } else {
          router.push('/start');
        }
      } catch (err) {
        console.error('Callback error:', err);
        router.push('/start');
      }
    };

    handleAuthCallback();
  }, [router, siteId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}
