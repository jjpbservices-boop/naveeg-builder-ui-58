'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon, MetricCard } from '@naveeg/ui';
import { getScoreColor, getScoreBgColor, formatTime } from '@naveeg/ui';

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

export default function AnalyticsPage() {
  const [url, setUrl] = useState('');
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResults, setAuditResults] = useState<PSIResult[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<'mobile' | 'desktop'>('mobile');

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

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Monitor your website performance with PageSpeed Insights and other analytics tools.
        </p>
      </div>

      {/* Audit controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Run Performance Audit</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-4 h-4 text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">Mobile</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategy"
                    value="desktop"
                    checked={selectedStrategy === 'desktop'}
                    onChange={(e) => setSelectedStrategy(e.target.value as 'mobile' | 'desktop')}
                    className="w-4 h-4 text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">Desktop</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={!url.trim() || isRunningAudit}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                !url.trim() || isRunningAudit
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
      </motion.div>

      {/* Latest results */}
      {getLatestResult() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Performance"
              value={`${getLatestResult().performance}%`}
              icon="zap"
              className={getScoreBgColor(getLatestResult().performance)}
            >
              <div className={`text-sm ${getScoreColor(getLatestResult().performance)}`}>
                LCP: {formatTime(getLatestResult().lcp)} • CLS: {getLatestResult().cls.toFixed(3)}
              </div>
            </MetricCard>

            <MetricCard
              title="Accessibility"
              value={`${getLatestResult().accessibility}%`}
              icon="eye"
              className={getScoreBgColor(getLatestResult().accessibility)}
            />

            <MetricCard
              title="Best Practices"
              value={`${getLatestResult().bestPractices}%`}
              icon="check-circle"
              className={getScoreBgColor(getLatestResult().bestPractices)}
            />

            <MetricCard
              title="SEO"
              value={`${getLatestResult().seo}%`}
              icon="search"
              className={getScoreBgColor(getLatestResult().seo)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(getLatestResult().lcp)}
              </div>
              <div className="text-sm text-gray-600">Largest Contentful Paint</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {getLatestResult().cls.toFixed(3)}
              </div>
              <div className="text-sm text-gray-600">Cumulative Layout Shift</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(getLatestResult().tti)}
              </div>
              <div className="text-sm text-gray-600">Time to Interactive</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Audit history */}
      {auditResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Audit History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">URL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Strategy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">LCP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">CLS</th>
                </tr>
              </thead>
              <tbody>
                {auditResults.map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <span suppressHydrationWarning>
                        {new Date(result.timestamp).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {result.url}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                      {result.strategy}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBgColor(result.performance)} ${getScoreColor(result.performance)}`}>
                        {result.performance}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatTime(result.lcp)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {result.cls.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {auditResults.length === 0 && !isRunningAudit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-8 text-center"
        >
          <Icon name="bar-chart-3" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No audits yet
          </h3>
          <p className="text-gray-600 mb-6">
            Run your first PageSpeed Insights audit to start monitoring your website performance.
          </p>
        </motion.div>
      )}
    </div>
  );
}
