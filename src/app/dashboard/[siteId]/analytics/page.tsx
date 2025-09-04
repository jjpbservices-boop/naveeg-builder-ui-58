'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PSIMetrics {
  performance: number;
  seo: number;
  accessibility: number;
  best_practices: number;
  fcp: number;
  lcp: number;
  inp: number;
  tbt: number;
  cls: number;
  timestamp: string;
}

export default function AnalyticsPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [site, setSite] = useState<any>(null);
  const [metrics, setMetrics] = useState<{ mobile: PSIMetrics; desktop: PSIMetrics } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSiteData();
    loadMetrics();
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
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (data && data.length >= 2) {
        const mobile = data.find(m => m.kind === 'psi-mobile')?.payload;
        const desktop = data.find(m => m.kind === 'psi-desktop')?.payload;
        
        if (mobile && desktop) {
          setMetrics({ mobile, desktop });
        }
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const runPSIAudit = async (strategy: 'mobile' | 'desktop') => {
    if (!site?.tenweb_site_id) {
      setError('Site URL not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('site', {
        body: {
          action: 'get-psi',
          site_id: siteId,
          url: `https://${site.tenweb_site_id}.10web.io`
        }
      });

      if (error) throw error;

      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to run PSI audit');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatTime = (ms: number) => {
    return `${ms}s`;
  };

  if (!site) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Monitor your website performance with PageSpeed Insights and comprehensive analytics.
        </p>
      </div>

      {/* PSI Audit Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Audit</h2>
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => runPSIAudit('mobile')}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Mobile Audit'}
          </button>
          <button
            onClick={() => runPSIAudit('desktop')}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Desktop Audit'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mobile Metrics */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.mobile.performance)}`}>
                  <div className="text-sm text-gray-600">Performance</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.mobile.performance)}`}>
                    {metrics.mobile.performance}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.mobile.seo)}`}>
                  <div className="text-sm text-gray-600">SEO</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.mobile.seo)}`}>
                    {metrics.mobile.seo}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.mobile.accessibility)}`}>
                  <div className="text-sm text-gray-600">Accessibility</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.mobile.accessibility)}`}>
                    {metrics.mobile.accessibility}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.mobile.best_practices)}`}>
                  <div className="text-sm text-gray-600">Best Practices</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.mobile.best_practices)}`}>
                    {metrics.mobile.best_practices}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>First Contentful Paint</span>
                  <span className="font-medium">{formatTime(metrics.mobile.fcp)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Largest Contentful Paint</span>
                  <span className="font-medium">{formatTime(metrics.mobile.lcp)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cumulative Layout Shift</span>
                  <span className="font-medium">{metrics.mobile.cls}</span>
                </div>
              </div>
            </div>

            {/* Desktop Metrics */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Desktop Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.desktop.performance)}`}>
                  <div className="text-sm text-gray-600">Performance</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.desktop.performance)}`}>
                    {metrics.desktop.performance}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.desktop.seo)}`}>
                  <div className="text-sm text-gray-600">SEO</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.desktop.seo)}`}>
                    {metrics.desktop.seo}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.desktop.accessibility)}`}>
                  <div className="text-sm text-gray-600">Accessibility</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.desktop.accessibility)}`}>
                    {metrics.desktop.accessibility}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(metrics.desktop.best_practices)}`}>
                  <div className="text-sm text-gray-600">Best Practices</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.desktop.best_practices)}`}>
                    {metrics.desktop.best_practices}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>First Contentful Paint</span>
                  <span className="font-medium">{formatTime(metrics.desktop.fcp)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Largest Contentful Paint</span>
                  <span className="font-medium">{formatTime(metrics.desktop.lcp)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cumulative Layout Shift</span>
                  <span className="font-medium">{metrics.desktop.cls}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!metrics && (
          <div className="text-center py-8 text-gray-500">
            <p>No performance data available. Run an audit to get started.</p>
          </div>
        )}
      </div>

      {/* Additional Analytics Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Visitor Analytics</h2>
        <div className="text-center py-12 text-gray-500">
          <p>Visitor analytics coming soon...</p>
        </div>
      </div>
    </div>
  );
}
