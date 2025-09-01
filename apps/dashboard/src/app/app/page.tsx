'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { makeSupabaseBrowser } from '@naveeg/lib/supabase/client'
import { env } from '../../lib/env'
import { t } from '@naveeg/ui'
import Icon from '../../components/ui/Icon'

// Mock data - replace with actual data from Supabase
const mockSite = {
  id: '1',
  domain: 'myrestaurant.com',
  status: 'online',
  plan: 'pro',
  brandVibe: 'Warm & Friendly',
  industry: 'Restaurant & Food',
  goal: 'Get more bookings',
  createdAt: '2025-01-15'
}

const mockAnalytics = {
  lcp: 2.1,
  cls: 0.05,
  inp: 120,
  performance: 89,
  lastUpdated: '2025-01-20T10:30:00Z'
}

export default function OverviewPage() {
  const [site, setSite] = useState(mockSite)
  const [analytics, setAnalytics] = useState(mockAnalytics)
  const [loading, setLoading] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Only create Supabase client on the client side
    if (typeof window !== 'undefined') {
      const client = makeSupabaseBrowser(env.SUPABASE_URL, env.SUPABASE_ANON)
      setSupabase(client)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-700'
      case 'generating':
        return 'bg-yellow-100 text-yellow-700'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-indigo-100 text-indigo-700'
      case 'starter':
        return 'bg-blue-100 text-blue-700'
      case 'custom':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)] mb-2">
          {t('en', 'dashboard.overview.title')}
        </h1>
        <p className="text-[var(--muted)]">
          Manage your website and track its performance
        </p>
      </div>

      {/* Site Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">
              {site.domain}
            </h2>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(site.status)}`}>
                {t('en', `dashboard.overview.status.${site.status}`)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(site.plan)}`}>
                {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted)]">Brand:</span>
                <span className="ml-2 text-[var(--ink)]">{site.brandVibe}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Industry:</span>
                <span className="ml-2 text-[var(--ink)]">{site.industry}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Goal:</span>
                <span className="ml-2 text-[var(--ink)]">{site.goal}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
              {t('en', 'dashboard.overview.openWebsite')}
            </button>
            <button className="px-4 py-2 text-sm bg-[var(--ink)] text-white rounded-lg hover:bg-neutral-800 transition-colors">
              Edit Content
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions & Plan */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">
            {t('en', 'dashboard.overview.quickActions.title')}
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Icon name="panels-top-left" className="w-5 h-5 text-blue-600" />
                <span>{t('en', 'dashboard.overview.quickActions.editContent')}</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Icon name="globe2" className="w-5 h-5 text-green-600" />
                <span>{t('en', 'dashboard.overview.quickActions.connectDomain')}</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">
            {t('en', 'dashboard.overview.planCard.title')}
          </h3>
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(site.plan)}`}>
              {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
            </span>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('en', 'dashboard.overview.planCard.upgrade')}
            </button>
            <button className="w-full px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
              {t('en', 'dashboard.overview.planCard.manage')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            {t('en', 'dashboard.overview.performance.title')}
          </h3>
          <span className="text-sm text-[var(--muted)]">
            {t('en', 'dashboard.overview.performance.lastUpdated')}: {formatDate(analytics.lastUpdated)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--ink)] mb-1">
              {analytics.performance}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {t('en', 'dashboard.analytics.metrics.performance')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--ink)] mb-1">
              {analytics.lcp}s
            </div>
            <div className="text-sm text-[var(--muted)]">
              {t('en', 'dashboard.analytics.metrics.lcp')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--ink)] mb-1">
              {analytics.cls}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {t('en', 'dashboard.analytics.metrics.cls')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--ink)] mb-1">
              {analytics.inp}ms
            </div>
            <div className="text-sm text-[var(--muted)]">
              {t('en', 'dashboard.analytics.metrics.inp')}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
