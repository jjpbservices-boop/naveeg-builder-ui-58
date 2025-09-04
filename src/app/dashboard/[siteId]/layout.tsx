'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const siteId = params.siteId as string;
  const { setSiteId } = useOnboardingStore();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      setSiteId(siteId);
      loadSiteData();
    }
  }, [siteId]);

  const loadSiteData = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (error) throw error;
      setSite(data);
    } catch (err) {
      console.error('Error loading site:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Site not found</h1>
          <p className="text-gray-600">The requested site could not be found.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/dashboard/${siteId}` },
    { id: 'pages', label: 'Pages & Navigation', href: `/dashboard/${siteId}/pages` },
    { id: 'design', label: 'Design', href: `/dashboard/${siteId}/design` },
    { id: 'analytics', label: 'Analytics', href: `/dashboard/${siteId}/analytics` },
    { id: 'billing', label: 'Billing', href: `/dashboard/${siteId}/billing` },
  ];

  const currentTab = tabs.find(tab => pathname === tab.href)?.id || 'overview';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {site.meta?.business?.name || 'My Website'}
              </h1>
              <p className="text-sm text-gray-600">
                {site.status === 'ready' ? 'Website is live' : 'Website is being created...'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {site.tenweb_site_id && (
                <a
                  href={`https://${site.tenweb_site_id}.10web.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Site
                </a>
              )}
              <div className="text-right">
                <div className="text-sm text-gray-600">Plan</div>
                <div className="font-semibold text-gray-900 capitalize">{site.plan}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
