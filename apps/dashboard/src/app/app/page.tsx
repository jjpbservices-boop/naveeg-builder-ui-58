'use client'

import { useState, useEffect } from 'react'
import { makeSupabaseBrowser } from '@naveeg/lib/supabase/client'
import { env } from '../../lib/env'
import { t } from '@naveeg/ui'
import { Icon } from '@naveeg/ui'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

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

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'online':
        return 'success'
      case 'generating':
        return 'info'
      case 'draft':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  const getPlanTone = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'premium'
      case 'starter':
        return 'info'
      case 'custom':
        return 'premium'
      default:
        return 'neutral'
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">
          {t('en', 'dashboard.overview.title')}
        </h1>
        <p className="text-muted">
          Manage your website and track its performance
        </p>
      </div>

      {/* Website Progress */}
      <Card title="Website Progress" actions={
        <Badge tone={completionPercentage >= 80 ? 'success' : completionPercentage >= 60 ? 'warning' : 'neutral'}>
          {Math.round(completionPercentage)}% Complete
        </Badge>
      }>
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-n700">Website Setup Progress</span>
            <span className="text-sm font-medium text-accent-green">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-n200 rounded-full overflow-hidden h-3">
            <div 
              className="h-full transition-all duration-500 ease-out rounded-full bg-accent-green" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {completionSteps.map((step) => (
            <div key={step.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-accent-green' : 'bg-n200'
              }`}>
                {step.completed && (
                  <svg className="w-3 h-3 text-ink-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-n600">{step.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Site Status Card */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-xl font-semibold text-ink">
                {site.domain}
              </h2>
              <Badge tone={getStatusTone(site.status)}>
                {site.status === 'online' ? 'Live' : 'Draft'}
              </Badge>
              <Badge tone={getPlanTone(site.plan)}>
                {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <span className="text-muted">Brand:</span>
                <span className="ml-2 text-ink font-medium">{site.brandVibe}</span>
              </div>
              <div>
                <span className="text-muted">Industry:</span>
                <span className="ml-2 text-ink font-medium">{site.industry}</span>
              </div>
              <div>
                <span className="text-muted">Goal:</span>
                <span className="ml-2 text-ink font-medium">{site.goal}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="btn-secondary">
                Preview Site
              </button>
              <button className="btn-primary">
                Edit Content
              </button>
              {site.status !== 'online' && (
                <button className="btn-primary">
                  Connect Domain
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions & Analytics Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-n200 rounded-lg hover:bg-n100 transition-colors group">
              <div className="flex items-center space-x-3">
                <Icon name="panels-top-left" className="w-5 h-5 text-accent-blue group-hover:text-accent-blue" />
                <span className="text-n700">Edit Content</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-n200 rounded-lg hover:bg-n100 transition-colors group">
              <div className="flex items-center space-x-3">
                <Icon name="globe2" className="w-5 h-5 text-accent-green group-hover:text-accent-green" />
                <span className="text-n700">Connect Domain</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-n200 rounded-lg hover:bg-n100 transition-colors group">
              <div className="flex items-center space-x-3">
                <Icon name="bar-chart-3" className="w-5 h-5 text-accent-purple group-hover:text-accent-purple" />
                <span className="text-n700">View Analytics</span>
              </div>
            </button>
          </div>
        </Card>

        {/* Analytics Summary */}
        <Card title="Performance">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-n600">Overall Score</span>
              <span className="text-2xl font-bold text-ink">{analytics.performance}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">LCP:</span>
                <span className="ml-1 font-medium text-ink">{analytics.lcp}s</span>
              </div>
              <div>
                <span className="text-muted">CLS:</span>
                <span className="ml-1 font-medium text-ink">{analytics.cls}</span>
              </div>
            </div>
            <button className="btn-primary w-full">
              View Full Report
            </button>
          </div>
        </Card>

        {/* Plan Card */}
        <Card title="Current Plan">
          <div className="space-y-4">
            <div>
              <Badge tone={getPlanTone(site.plan)}>
                {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
              </Badge>
            </div>
            <div className="text-sm text-muted">
              {site.plan === 'starter' && 'Perfect for getting started with your website'}
              {site.plan === 'pro' && 'Advanced features for growing businesses'}
              {site.plan === 'custom' && 'Tailored solution for your specific needs'}
            </div>
            <div className="space-y-2">
              <button className="btn-primary w-full">
                {site.plan === 'starter' ? 'Upgrade Plan' : 'Manage Plan'}
              </button>
              <button className="btn-secondary w-full">
                View Billing
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
