export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Analytics</h1>
        <p className="mt-2 text-[var(--muted)]">
          Understand how your website is performing and who's visiting.
        </p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">PageSpeed Score</p>
              <p className="text-3xl font-bold text-[var(--text)]">92</p>
            </div>
            <div className="w-16 h-16 bg-[var(--plan-custom)] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🚀</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-custom)] text-white">
              Excellent
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">This Month</p>
              <p className="text-3xl font-bold text-[var(--text)]">1,234</p>
              <p className="text-sm text-[var(--muted)]">visitors</p>
            </div>
            <div className="w-16 h-16 bg-[var(--plan-grow)] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">📊</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-grow)] text-white">
              +12% vs last month
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Bounce Rate</p>
              <p className="text-3xl font-bold text-[var(--text)]">34%</p>
              <p className="text-sm text-[var(--muted)]">of visitors</p>
            </div>
            <div className="w-16 h-16 bg-[var(--plan-entry)] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">📈</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-entry)] text-[var(--text)]">
              Good
            </span>
          </div>
        </div>
      </div>

      {/* PageSpeed Insights */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-6">PageSpeed Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-[var(--plan-entry)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">92</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Mobile</h3>
            <p className="text-sm text-[var(--muted)]">Excellent performance</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-[var(--plan-grow)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">95</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Desktop</h3>
            <p className="text-sm text-[var(--muted)]">Outstanding performance</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-[var(--plan-custom)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">89</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Core Web Vitals</h3>
            <p className="text-sm text-[var(--muted)]">Good user experience</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <button className="btn-black">
            Run New PageSpeed Test
          </button>
        </div>
      </div>

      {/* Traffic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Traffic Sources</h2>
          <div className="space-y-4">
            {[
              { source: 'Google Search', visitors: 856, percentage: 69, color: 'bg-[var(--plan-entry)]' },
              { source: 'Direct', visitors: 234, percentage: 19, color: 'bg-[var(--plan-grow)]' },
              { source: 'Social Media', visitors: 98, percentage: 8, color: 'bg-[var(--plan-custom)]' },
              { source: 'Other', visitors: 46, percentage: 4, color: 'bg-[var(--muted)]' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-[var(--text)]">{item.source}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--text)]">{item.visitors}</div>
                  <div className="text-xs text-[var(--muted)]">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Top Pages</h2>
          <div className="space-y-4">
            {[
              { page: 'Homepage', visitors: 456, change: '+15%' },
              { page: 'About Us', visitors: 234, change: '+8%' },
              { page: 'Services', visitors: 189, change: '+22%' },
              { page: 'Contact', visitors: 123, change: '+5%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{item.page}</div>
                  <div className="text-xs text-[var(--muted)]">{item.visitors} visitors</div>
                </div>
                <span className="text-sm text-green-600">{item.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="btn-black">
          Export Analytics Report
        </button>
        <button className="btn-black bg-white text-black border border-[var(--border)] hover:bg-[var(--wash-1)]">
          Schedule Weekly Report
        </button>
      </div>
    </div>
  );
}
