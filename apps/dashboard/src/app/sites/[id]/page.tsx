'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Icon from '../../../components/ui/Icon'

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'building2' },
  { id: 'content', label: 'Content', icon: 'panels-top-left' },
  { id: 'seo', label: 'SEO', icon: 'trending-up' },
  { id: 'publishing', label: 'Publishing', icon: 'rocket' }
]

// Mock site data - replace with actual data from your backend
const mockSite = {
  id: '1',
  name: 'My Restaurant',
  domain: 'myrestaurant.com',
  status: 'Online',
  plan: 'Pro',
  headline: 'Welcome to My Restaurant',
  about: 'We serve delicious food in a cozy atmosphere.',
  seoTitle: 'My Restaurant - Best Food in Town',
  seoDescription: 'Discover amazing food and great service at My Restaurant.',
  published: true
}

export default function SiteManagement({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [siteData, setSiteData] = useState(mockSite)
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setSiteData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('Changes saved successfully!')
  }

  const handlePublish = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSiteData(prev => ({ ...prev, published: true }))
    setIsSaving(false)
    alert('Website published successfully!')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Site Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Site Name</label>
                    <input
                      type="text"
                      value={siteData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Domain</label>
                    <input
                      type="text"
                      value={siteData.domain}
                      disabled
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-gray-50 text-[var(--muted)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      siteData.status === 'Online' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {siteData.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Plan</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {siteData.plan}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Published</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      siteData.published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {siteData.published ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'content':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Main Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Headline</label>
                  <input
                    type="text"
                    value={siteData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    placeholder="Your main headline"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">About</label>
                  <textarea
                    value={siteData.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    placeholder="Tell visitors about your business"
                    rows={4}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'seo':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Page Title</label>
                  <input
                    type="text"
                    value={siteData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="Title that appears in search results"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">Keep it under 60 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Meta Description</label>
                  <textarea
                    value={siteData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="Brief description for search results"
                    rows={3}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">Keep it under 160 characters</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'publishing':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Publishing</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Icon name="rocket" className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Ready to go live?</h4>
                      <p className="text-sm text-blue-700">
                        Your website is ready to be published. Click the button below to make it live.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePublish}
                    disabled={isSaving || siteData.published}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isSaving || siteData.published
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'btn-black'
                    }`}
                  >
                    {isSaving ? 'Publishing...' : siteData.published ? 'Already Published' : 'Publish Website'}
                  </button>
                  
                  {siteData.published && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Your website is live!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="section-y">
      <div className="container-max">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ink)] mb-4">
            {siteData.name}
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Manage your website settings and content
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border)] mb-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon name={tab.icon as any} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Save Button */}
        {activeTab !== 'publishing' && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-black'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
