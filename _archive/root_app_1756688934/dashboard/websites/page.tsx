export default function WebsitesPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Websites</h1>
          <p className="mt-2 text-[var(--muted)]">
            Manage all your websites in one place.
          </p>
        </div>
        <button className="btn-black">
          Create New Website
        </button>
      </div>

      {/* Website table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Your Websites</h2>
        </div>
        
        {/* Table placeholder */}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--wash-1)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--border)]">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[var(--accent-grad)] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text)]">My Business Website</div>
                      <div className="text-sm text-[var(--muted)]">mybusiness.naveeg.app</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-entry)] text-[var(--text)]">
                    Live
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  2 hours ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)] mr-3">
                    Edit
                  </button>
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Empty state for additional websites */}
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 bg-[var(--wash-1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌐</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">Ready for more websites?</h3>
          <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
            Create additional websites for different businesses, projects, or clients. Each website gets its own domain and management dashboard.
          </p>
          <button className="btn-black">
            Create Another Website
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-[var(--plan-entry)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✏️</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">Edit Content</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Update text, images, and pages with our simple editor.
          </p>
          <button className="btn-black w-full">
            Start Editing
          </button>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-[var(--plan-grow)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">View Analytics</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            See how your website is performing and who's visiting.
          </p>
          <button className="btn-black w-full">
            View Analytics
          </button>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-[var(--plan-custom)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔧</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">Settings</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Configure your website settings and preferences.
          </p>
          <button className="btn-black w-full">
            Open Settings
          </button>
        </div>
      </div>
    </div>
  );
}
