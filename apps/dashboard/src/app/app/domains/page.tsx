'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Tooltip, ProgressBar } from '@naveeg/ui'
import { Icon } from '@naveeg/ui'

// Mock data for domains and security
const mockDomain = {
  id: '1',
  domain: 'myrestaurant.com',
  status: 'connected',
  sslStatus: 'active',
  lastChecked: '2025-01-20T10:30:00Z',
  expiresAt: '2025-12-15T00:00:00Z'
}

const mockSecurity = {
  cache: { enabled: true, status: 'active' },
  passwordProtection: { enabled: false, status: 'disabled' },
  backups: { enabled: true, lastBackup: '2025-01-20T08:00:00Z', status: 'active' },
  firewall: { enabled: true, status: 'active' },
  malwareScan: { enabled: true, lastScan: '2025-01-20T06:00:00Z', status: 'clean' }
}

const mockIssues = [
  {
    id: '1',
    type: 'warning',
    title: 'Password Protection Disabled',
    description: 'Your website is not password protected. Enable this for additional security.',
    action: 'Enable Password Protection'
  },
  {
    id: '2',
    type: 'info',
    title: 'SSL Certificate Expires Soon',
    description: 'Your SSL certificate will expire in 2 months. Consider renewing it.',
    action: 'Renew Certificate'
  }
]

export default function DomainsPage() {
  const [domain] = useState(mockDomain)
  const [security] = useState(mockSecurity)
  const [issues] = useState(mockIssues)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'clean':
        return 'success'
      case 'disabled':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'neutral'
    }
  }

  const getIssueVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
          Domains & Security
        </h1>
        <p className="text-gray-600">
          Manage your domain and website security settings
        </p>
      </div>

      {/* Domain Status */}
      <Card gradient="blue" hover>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {domain.domain}
              </h2>
              <Badge variant={getStatusVariant(domain.status)}>
                {domain.status === 'connected' ? 'Connected' : domain.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="text-gray-500">SSL Status:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  <Badge variant={getStatusVariant(domain.sslStatus)} size="sm">
                    {domain.sslStatus === 'active' ? 'Active' : domain.sslStatus}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Checked:</span>
                <span className="ml-2 text-gray-900 font-medium">{formatDate(domain.lastChecked)}</span>
              </div>
              <div>
                <span className="text-gray-500">SSL Expires:</span>
                <span className="ml-2 text-gray-900 font-medium">{formatDate(domain.expiresAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 text-gray-900 font-medium">Healthy</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View DNS Settings
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Manage Domain
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Security Features */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Icon name="check-circle" className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Features</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(security).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    config.status === 'active' || config.status === 'clean' 
                      ? 'bg-green-500' 
                      : config.status === 'disabled' 
                        ? 'bg-blue-500' 
                        : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {config.status === 'active' && 'Active and protecting your site'}
                      {config.status === 'disabled' && 'Not enabled'}
                      {config.status === 'clean' && 'No threats detected'}
                      {'lastBackup' in config && config.lastBackup && `Last backup: ${formatDate(config.lastBackup)}`}
                      {'lastScan' in config && config.lastScan && `Last scan: ${formatDate(config.lastScan)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(config.status)} size="sm">
                    {config.status}
                  </Badge>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Icon name="settings" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Issues */}
        <Card gradient="blue">
          <div className="flex items-center space-x-2 mb-6">
            <Icon name="alert-circle" className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Issues</h3>
          </div>
          
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <Icon 
                      name={issue.type === 'error' ? 'x-circle' : issue.type === 'warning' ? 'alert-triangle' : 'info'} 
                      className={`w-5 h-5 mt-0.5 ${
                        issue.type === 'error' ? 'text-red-500' : 
                        issue.type === 'warning' ? 'text-blue-500' : 
                        'text-blue-500'
                      }`} 
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{issue.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                        {issue.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="check-circle" className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">All Good!</h4>
              <p className="text-sm text-gray-600">No security issues detected</p>
            </div>
          )}
        </Card>
      </div>

      {/* Security Score */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
                      <Icon name="check-circle" className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Overall Security</span>
              <span className="text-2xl font-bold text-green-600">85%</span>
            </div>
            <ProgressBar 
              value={85} 
              variant="success"
              showLabel={false}
            />
            <p className="text-sm text-gray-600 mt-2">
              Your website has good security measures in place
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSL Certificate</span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Firewall</span>
              <Badge variant="success" size="sm">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backups</span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Malware Scan</span>
              <Badge variant="success" size="sm">Clean</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
