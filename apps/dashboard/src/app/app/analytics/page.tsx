'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon, Card, Badge } from '@naveeg/ui';

interface PSIResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
  tti: number;
  fcp: number;
  timestamp: string;
}

// Utility functions
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-accent-green';
  if (score >= 50) return 'text-n600';
  return 'text-n500';
};

const getScoreBgColor = (score: number) => {
  if (score >= 90) return 'bg-accent-green/10 ring-1 ring-accent-green/20';
  if (score >= 50) return 'bg-n100 ring-1 ring-n300/20';
  return 'bg-n100 ring-1 ring-n300/20';
};

const formatTime = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

// Mock data for demonstration
const mockAuditResults: PSIResult[] = [
  {
    url: 'https://example.com',
    strategy: 'mobile',
    performance: 85,
    accessibility: 92,
    bestPractices: 78,
    seo: 88,
    lcp: 2.1,
    cls: 0.05,
    tti: 3.2,
    fcp: 1.8,
    timestamp: new Date().toISOString(),
  },
  {
    url: 'https://example.com',
    strategy: 'desktop',
    performance: 92,
    accessibility: 95,
    bestPractices: 85,
    seo: 90,
    lcp: 1.8,
    cls: 0.02,
    tti: 2.5,
    fcp: 1.2,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function AnalyticsPage() {
  const [url, setUrl] = useState('');
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResults, setAuditResults] = useState<PSIResult[]>(mockAuditResults);
  const [selectedStrategy, setSelectedStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'performance' | 'visitors'>('performance');

  const handleRunAudit = async () => {
    if (!url.trim()) return;

    setIsRunningAudit(true);
    try {
      const response = await fetch('/api/psi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          strategy: selectedStrategy,
        }),
      });

      if (response.ok) {
        const { data } = await response.json();
        
        const result: PSIResult = {
          url: data.url,
          strategy: data.strategy,
          performance: data.metrics.performance,
          accessibility: data.metrics.accessibility,
          bestPractices: data.metrics.bestPractices,
          seo: data.metrics.seo,
          lcp: data.metrics.lcp,
          cls: data.metrics.cls,
          tti: data.metrics.tti,
          fcp: data.metrics.fcp,
          timestamp: data.timestamp,
        };

        setAuditResults(prev => [result, ...prev]);
        setUrl('');
      } else {
        const error = await response.json();
        console.error('Failed to run audit:', error);
        alert('Failed to run audit. Please try again.');
      }
    } catch (error) {
      console.error('Error running audit:', error);
      alert('Error running audit. Please try again.');
    } finally {
      setIsRunningAudit(false);
    }
  };

  const getLatestResult = () => auditResults[0];
  const getAverageScore = (metric: keyof Pick<PSIResult, 'performance' | 'accessibility' | 'bestPractices' | 'seo'>) => {
    return Math.round(auditResults.reduce((sum, result) => sum + result[metric], 0) / auditResults.length);
  };

  // Performance gauge component
  const PerformanceGauge = ({ value, label, threshold = 90 }: { value: number; label: string; threshold?: number }) => {
    const percentage = Math.min(value, 100);
    const isGood = percentage >= threshold;
    
    return (
      <div className="relative">
        <div className="w-24 h-24 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-n200"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
              className={isGood ? 'text-accent-green' : 'text-n500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-ink">{percentage}</span>
          </div>
        </div>
        <div className="text-center mt-2">
          <div className="text-sm font-medium text-ink">{label}</div>
          <Badge variant={isGood ? 'success' : 'neutral'} className="text-xs">
            {getScoreLabel(percentage)}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Analytics</h1>
        <p className="text-muted">
          Monitor your website performance with PageSpeed Insights and comprehensive analytics.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 bg-n100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'performance'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          <Icon name="zap" className="w-4 h-4 inline mr-2" />
          Performance
        </button>
        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'visitors'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          <Icon name="users" className="w-4 h-4 inline mr-2" />
          Visitors
        </button>
      </div>

      {activeTab === 'performance' && (
        <>
          {/* Performance Overview */}
          {getLatestResult() && (
            <Card header={
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">Performance Overview</h3>
                <Badge variant="info">
                  <Icon name="clock" className="w-3 h-3 mr-1" />
                  Last updated {new Date(getLatestResult().timestamp).toLocaleTimeString()}
                </Badge>
              </div>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <PerformanceGauge value={getLatestResult().performance} label="Performance" />
                </div>
                <div className="text-center">
                  <PerformanceGauge value={getLatestResult().accessibility} label="Accessibility" />
                </div>
                <div className="text-center">
                  <PerformanceGauge value={getLatestResult().bestPractices} label="Best Practices" />
                </div>
                <div className="text-center">
                  <PerformanceGauge value={getLatestResult().seo} label="SEO" />
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="border-t border-n200 pt-6">
                <h3 className="text-lg font-semibold text-ink mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">Largest Contentful Paint</span>
                      <span className="text-sm text-muted">{formatTime(getLatestResult().lcp)}</span>
                    </div>
                    <div className="w-full bg-n200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getLatestResult().lcp <= 2.5 ? 'bg-accent-green' : getLatestResult().lcp <= 4 ? 'bg-n500' : 'bg-n400'}`}
                        style={{ width: `${Math.min((getLatestResult().lcp / 4) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted">Good: ≤2.5s • Needs Improvement: ≤4s</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">Cumulative Layout Shift</span>
                      <span className="text-sm text-muted">{getLatestResult().cls.toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-n200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getLatestResult().cls <= 0.1 ? 'bg-accent-green' : getLatestResult().cls <= 0.25 ? 'bg-n500' : 'bg-n400'}`}
                        style={{ width: `${Math.min((getLatestResult().cls / 0.25) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted">Good: ≤0.1 • Needs Improvement: ≤0.25</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">Time to Interactive</span>
                      <span className="text-sm text-muted">{formatTime(getLatestResult().tti)}</span>
                    </div>
                    <div className="w-full bg-n200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getLatestResult().tti <= 3.8 ? 'bg-accent-green' : getLatestResult().tti <= 7.3 ? 'bg-n500' : 'bg-n400'}`}
                        style={{ width: `${Math.min((getLatestResult().tti / 7.3) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted">Good: ≤3.8s • Needs Improvement: ≤7.3s</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Run New Audit */}
          <Card header={<h3 className="text-lg font-semibold text-ink">Run Performance Audit</h3>}>
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-ink mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-n300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent bg-surface"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Strategy
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="strategy"
                        value="mobile"
                        checked={selectedStrategy === 'mobile'}
                        onChange={(e) => setSelectedStrategy(e.target.value as 'mobile' | 'desktop')}
                        className="w-4 h-4 text-accent-blue mr-2"
                      />
                      <span className="text-sm text-ink">Mobile</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="strategy"
                        value="desktop"
                        checked={selectedStrategy === 'desktop'}
                        onChange={(e) => setSelectedStrategy(e.target.value as 'mobile' | 'desktop')}
                        className="w-4 h-4 text-accent-blue mr-2"
                      />
                      <span className="text-sm text-ink">Desktop</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleRunAudit}
                  disabled={!url.trim() || isRunningAudit}
                  className={`btn-primary ${
                    !url.trim() || isRunningAudit
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isRunningAudit ? (
                    <>
                      <Icon name="loader-2" className="w-4 h-4 inline mr-2 animate-spin" />
                      Running Audit...
                    </>
                  ) : (
                    <>
                      <Icon name="play" className="w-4 h-4 inline mr-2" />
                      Run PageSpeed Audit
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>

          {/* Audit History */}
          {auditResults.length > 0 && (
            <Card header={<h3 className="text-lg font-semibold text-ink">Audit History</h3>}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-n200">
                      <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted">URL</th>
                      <th className="text-left py-3 px-4 font-medium text-muted">Strategy</th>
                      <th className="text-left py-3 px-4 font-medium text-muted">Performance</th>
                      <th className="text-left py-3 px-4 font-medium text-muted">LCP</th>
                      <th className="text-left py-3 px-4 font-medium text-muted">CLS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditResults.map((result, index) => (
                      <tr key={index} className="border-b border-n100 hover:bg-n50">
                        <td className="py-3 px-4 text-sm text-muted">
                          <span suppressHydrationWarning>
                            {new Date(result.timestamp).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-ink font-medium">
                          {result.url}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted capitalize">
                          <Badge variant="neutral">{result.strategy}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={result.performance >= 90 ? 'success' : 'neutral'}>
                            {result.performance}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted">
                          {formatTime(result.lcp)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted">
                          {result.cls.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {activeTab === 'visitors' && (
        <Card header={<h3 className="text-lg font-semibold text-ink">Visitor Analytics</h3>}>
          <div className="text-center py-12">
            <Icon name="bar-chart-3" className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ink mb-2">
              Visitor Analytics Coming Soon
            </h3>
            <p className="text-muted">
              We&apos;re working on integrating comprehensive visitor analytics to help you understand your audience better.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
