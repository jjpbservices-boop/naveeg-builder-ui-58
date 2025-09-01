export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Dashboard Overview</h1>
        <p className="mt-2 text-[var(--muted)]">
          Welcome back! Here's what's happening with your website.
        </p>
      </div>

      {/* Status cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Website Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Website Status</p>
              <p className="text-2xl font-bold text-[var(--text)]">Live</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-entry)] text-[var(--text)]">
              Healthy
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">Quick Actions</p>
            <p className="text-2xl font-bold text-[var(--text)]">3</p>
          </div>
          <div className="mt-4">
            <button className="btn-black w-full">
              Edit Website
            </button>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="card p-6">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">This Month</p>
            <p className="text-2xl font-bold text-[var(--text)]">1,234</p>
            <p className="text-sm text-[var(--muted)]">visitors</p>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-grow)] text-white">
              +12%
            </span>
          </div>
        </div>

        {/* Performance */}
        <div className="card p-6">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">PageSpeed</p>
            <p className="text-2xl font-bold text-[var(--text)]">92</p>
            <p className="text-sm text-[var(--muted)]">/100</p>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-custom)] text-white">
              Excellent
            </span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Get Started Checklist */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Get Started Checklist</h2>
          <div className="space-y-3">
            {[
              { task: 'Connect your domain', completed: true },
              { task: 'Add your business information', completed: true },
              { task: 'Upload company logo', completed: false },
              { task: 'Set up contact form', completed: false },
              { task: 'Configure Google Analytics', completed: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  item.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-[var(--border)]'
                }`}>
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${item.completed ? 'text-[var(--muted)] line-through' : 'text-[var(--text)]'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="btn-black w-full">
              Complete Setup
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'Website updated', time: '2 hours ago', type: 'edit' },
              { action: 'New visitor from Google', time: '4 hours ago', type: 'traffic' },
              { action: 'Backup completed', time: '1 day ago', type: 'backup' },
              { action: 'Domain connected', time: '2 days ago', type: 'domain' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'edit' ? 'bg-[var(--plan-entry)]' :
                  item.type === 'traffic' ? 'bg-[var(--plan-grow)]' :
                  item.type === 'backup' ? 'bg-[var(--plan-custom)]' :
                  'bg-[var(--muted)]'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text)]">{item.action}</p>
                  <p className="text-xs text-[var(--muted)]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="btn-black w-full">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
