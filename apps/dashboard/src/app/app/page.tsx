'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { makeSupabaseBrowser } from '@naveeg/lib/supabase/client'
import { env } from '../../lib/env'
import { t, Card, Badge, Tooltip, ProgressBar } from '@naveeg/ui'
import { Icon } from '@naveeg/ui'

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

  // Calculate website completion progress
  const completionSteps = [
    { id: 'content', label: 'Content Added', completed: true },
    { id: 'design', label: 'Design Applied', completed: true },
    { id: 'domain', label: 'Domain Connected', completed: site.status === 'online' },
    { id: 'seo', label: 'SEO Optimized', completed: analytics.performance > 80 },
  ];
  
  const completedSteps = completionSteps.filter(step => step.completed).length;
  const completionPercentage = (completedSteps / completionSteps.length) * 100;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
          {t('en', 'dashboard.overview.title')}
        </h1>
        <p className="text-gray-600">
          Manage your website and track its performance
        </p>
      </div>

      {/* Website Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Website Progress</h2>
          <Badge variant={completionPercentage >= 80 ? 'success' : completionPercentage >= 60 ? 'warning' : 'error'}>
            {Math.round(completionPercentage)}% Complete
          </Badge>
        </div>
        <ProgressBar 
          value={completionPercentage} 
          label="Website Setup Progress"
          variant={completionPercentage >= 80 ? 'success' : completionPercentage >= 60 ? 'warning' : 'error'}
        />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {completionSteps.map((step) => (
            <div key={step.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {step.completed && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">{step.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Site Status Card */}
      <Card gradient="blue" hover>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {site.domain}
              </h2>
              <Badge variant={site.status === 'online' ? 'live' : 'draft'}>
                {site.status === 'online' ? 'Live' : 'Draft'}
              </Badge>
              <Badge variant={site.plan as any}>
                {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <span className="text-gray-500">Brand:</span>
                <span className="ml-2 text-gray-900 font-medium">{site.brandVibe}</span>
              </div>
              <div>
                <span className="text-gray-500">Industry:</span>
                <span className="ml-2 text-gray-900 font-medium">{site.industry}</span>
              </div>
              <div>
                <span className="text-gray-500">Goal:</span>
                <span className="ml-2 text-gray-900 font-medium">{site.goal}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Tooltip content="Preview your website before going live">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Preview Site
                </button>
              </Tooltip>
              <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Edit Content
              </button>
              {site.status !== 'online' && (
                <Tooltip content="Connect your custom domain to make your site live">
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Connect Domain
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions & Analytics Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="zap" className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-3">
                <Icon name="panels-top-left" className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                <span className="text-gray-700">Edit Content</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-3">
                <Icon name="globe2" className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                <span className="text-gray-700">Connect Domain</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-3">
                <Icon name="bar-chart-3" className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                <span className="text-gray-700">View Analytics</span>
              </div>
            </button>
          </div>
        </Card>

        {/* Analytics Summary */}
        <Card gradient="green">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="trending-up" className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Score</span>
              <span className="text-2xl font-bold text-gray-900">{analytics.performance}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">LCP:</span>
                <span className="ml-1 font-medium text-gray-900">{analytics.lcp}s</span>
              </div>
              <div>
                <span className="text-gray-500">CLS:</span>
                <span className="ml-1 font-medium text-gray-900">{analytics.cls}</span>
              </div>
            </div>
            <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Full Report
            </button>
          </div>
        </Card>

        {/* Plan Card */}
        <Card gradient="purple">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="crown" className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Badge variant={site.plan as any} size="lg">
                {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {site.plan === 'starter' && 'Perfect for getting started with your website'}
              {site.plan === 'pro' && 'Advanced features for growing businesses'}
              {site.plan === 'custom' && 'Tailored solution for your specific needs'}
            </div>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                {site.plan === 'starter' ? 'Upgrade Plan' : 'Manage Plan'}
              </button>
              <button className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                View Billing
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
