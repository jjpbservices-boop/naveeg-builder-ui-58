'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardOverview() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSiteData();
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

  const getTrialDaysLeft = () => {
    if (!site?.trial_started_at) return 7;
    const startDate = new Date(site.trial_started_at);
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Site not found</h2>
        <p className="text-gray-600">The requested site could not be found.</p>
      </div>
    );
  }

  const trialDaysLeft = getTrialDaysLeft();

  return (
    <div className="space-y-8">
      {/* Site Status and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Site Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            site.status === 'ready' 
              ? 'bg-green-100 text-green-800' 
              : site.status === 'creating'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {site.status === 'ready' ? 'Live' : site.status === 'creating' ? 'Creating...' : 'Error'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Site URL</h3>
            <p className="text-lg font-semibold text-gray-900">
              {site.tenweb_site_id ? `${site.tenweb_site_id}.10web.io` : 'Not available yet'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">WordPress Admin</h3>
            <p className="text-lg font-semibold text-gray-900">
              {site.tenweb_site_id ? `${site.tenweb_site_id}.10web.io/wp-admin` : 'Not available yet'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(site.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          {site.tenweb_site_id && (
            <>
              <a
                href={`https://${site.tenweb_site_id}.10web.io`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Site
              </a>
              <a
                href={`https://${site.tenweb_site_id}.10web.io/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Open WP Admin
              </a>
            </>
          )}
        </div>
      </div>

      {/* Trial Information */}
      {site.plan === 'trial' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Free Trial - {trialDaysLeft} days left
              </h3>
              <p className="text-gray-600">
                You have {trialDaysLeft} days left in your free trial. Upgrade to continue using your website.
              </p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href={`/dashboard/${siteId}/pages`}
              className="block w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Edit Pages & Navigation
            </a>
            <a
              href={`/dashboard/${siteId}/design`}
              className="block w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Customize Design
            </a>
            <a
              href={`/dashboard/${siteId}/analytics`}
              className="block w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Analytics
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Business Name:</span>
              <p className="font-medium text-gray-900">
                {site.meta?.business?.name || 'Not set'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Type:</span>
              <p className="font-medium text-gray-900 capitalize">
                {site.meta?.business?.type || 'basic'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Pages:</span>
              <p className="font-medium text-gray-900">
                {site.meta?.sitemap?.length || 0} pages
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>Website created</p>
              <p className="text-xs text-gray-500">
                {new Date(site.created_at).toLocaleString()}
              </p>
            </div>
            {site.updated_at !== site.created_at && (
              <div className="text-sm text-gray-600">
                <p>Last updated</p>
                <p className="text-xs text-gray-500">
                  {new Date(site.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
