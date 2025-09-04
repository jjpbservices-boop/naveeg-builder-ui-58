'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon, MetricCard } from '@naveeg/ui';
import { getScoreColor, getScoreBgColor } from '@naveeg/ui';

interface SiteData {
  id: string;
  domain?: string;
  status: 'draft' | 'online' | 'generating';
  plan: string;
  industry: string;
  goal: string;
  brandVibe: string;
}

interface AnalyticsSnapshot {
  id: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
  tti: number;
  created_at: string;
}

export default function OverviewPage() {
  // Use deterministic initial state to prevent hydration mismatch
  const [siteData, setSiteData] = useState<SiteData | null>({
    id: 'mock-id',
    status: 'draft',
    plan: 'starter',
    industry: 'E-commerce',
    goal: 'Sell products',
    brandVibe: 'Professional & Trustworthy',
  });
  const [latestAnalytics, setLatestAnalytics] = useState<AnalyticsSnapshot | null>({
    id: 'mock-analytics',
    performance: 85,
    accessibility: 92,
    bestPractices: 78,
    seo: 95,
    lcp: 2.1,
    cls: 0.05,
    tti: 3.2,
    created_at: '2025-01-20T00:00:00.000Z',
  });
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Fetch site data and latest analytics from API
  // For now, using mock data in initial state to prevent hydration mismatch

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="loader-2" className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your website.
        </p>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Website Status
            </h2>
            <p className="text-gray-600">
              Your website is currently in <span className="font-medium">draft mode</span>.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Icon name="edit-3" className="w-4 h-4 mr-1" />
              Draft
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Icon name="crown" className="w-4 h-4 mr-1" />
              Starter
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Icon name="external-link" className="w-5 h-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Preview Site</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Icon name="edit-3" className="w-5 h-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Edit Content</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Icon name="globe" className="w-5 h-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Connect Domain</span>
          </button>
        </div>
      </motion.div>

      {/* Analytics overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Latest Analytics</h2>
          <a
            href="/app/analytics"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View all analytics →
          </a>
        </div>

        {latestAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Performance"
              value={`${latestAnalytics.performance}%`}
              icon="zap"
              className={getScoreBgColor(latestAnalytics.performance)}
            >
              <div className={`text-sm ${getScoreColor(latestAnalytics.performance)}`}>
                LCP: {latestAnalytics.lcp}s • CLS: {latestAnalytics.cls}
              </div>
            </MetricCard>

            <MetricCard
              title="Accessibility"
              value={`${latestAnalytics.accessibility}%`}
              icon="eye"
              className={getScoreBgColor(latestAnalytics.accessibility)}
            />

            <MetricCard
              title="Best Practices"
              value={`${latestAnalytics.bestPractices}%`}
              icon="check-circle"
              className={getScoreBgColor(latestAnalytics.bestPractices)}
            />

            <MetricCard
              title="SEO"
              value={`${latestAnalytics.seo}%`}
              icon="search"
              className={getScoreBgColor(latestAnalytics.seo)}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-8 text-center"
          >
            <Icon name="bar-chart-3" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No analytics yet
            </h3>
            <p className="text-gray-600 mb-6">
              Run your first PageSpeed Insights audit to see performance metrics.
            </p>
            <a
              href="/app/analytics"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <Icon name="play" className="w-4 h-4 mr-2" />
              Run First Audit
            </a>
          </motion.div>
        )}
      </div>

      {/* Site details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Industry</label>
            <p className="text-gray-900">{siteData?.industry}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Goal</label>
            <p className="text-gray-900">{siteData?.goal}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Brand Style</label>
            <p className="text-gray-900">{siteData?.brandVibe}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
