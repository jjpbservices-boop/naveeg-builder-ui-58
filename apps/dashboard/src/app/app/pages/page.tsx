'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Tooltip } from '@naveeg/ui'
import { Icon } from '@naveeg/ui'

// Mock data for pages
const mockPages = [
  {
    id: '1',
    title: 'Home',
    slug: '/',
    status: 'published',
    lastModified: '2025-01-20T10:30:00Z',
    views: 1250,
    type: 'page'
  },
  {
    id: '2',
    title: 'About Us',
    slug: '/about',
    status: 'published',
    lastModified: '2025-01-18T14:20:00Z',
    views: 340,
    type: 'page'
  },
  {
    id: '3',
    title: 'Contact',
    slug: '/contact',
    status: 'draft',
    lastModified: '2025-01-19T09:15:00Z',
    views: 0,
    type: 'page'
  },
  {
    id: '4',
    title: 'Services',
    slug: '/services',
    status: 'published',
    lastModified: '2025-01-17T16:45:00Z',
    views: 890,
    type: 'page'
  },
  {
    id: '5',
    title: 'Blog Post: Getting Started',
    slug: '/blog/getting-started',
    status: 'published',
    lastModified: '2025-01-15T11:30:00Z',
    views: 567,
    type: 'blog'
  }
]

export default function PagesPage() {
  const [pages] = useState(mockPages)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const filteredPages = pages.filter(page => 
    filter === 'all' || page.status === filter
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusVariant = (status: string) => {
    return status === 'published' ? 'success' : 'draft'
  }

  const getTypeIcon = (type: string) => {
    return type === 'blog' ? 'file-text' : 'layout'
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
            Pages & Content
          </h1>
          <p className="text-gray-600">
            Manage your website pages and content
          </p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
          <Icon name="plus" className="w-4 h-4" />
          <span>Add Page</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon name="layout" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon name="check-circle" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter(p => p.status === 'published').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Icon name="edit" className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter(p => p.status === 'draft').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon name="eye" className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.reduce((sum, page) => sum + page.views, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex space-x-1">
                {(['all', 'published', 'draft'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filter === filterType
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pages..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pages List */}
        <div className="space-y-4">
          {filteredPages.map((page) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon name={getTypeIcon(page.type)} className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{page.title}</h3>
                    <Badge variant={getStatusVariant(page.status)} size="sm">
                      {page.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{page.slug}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>Modified: {formatDate(page.lastModified)}</span>
                    <span>Views: {page.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Tooltip content="Preview page">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Icon name="eye" className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Edit page">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Icon name="edit" className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="More options">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Icon name="more-horizontal" className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <Icon name="file-text" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? "You haven't created any pages yet."
                : `No ${filter} pages found.`
              }
            </p>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Create Your First Page
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
