export default function DomainsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Domains</h1>
          <p className="mt-2 text-[var(--muted)]">
            Manage your website domains and DNS settings.
          </p>
        </div>
        <button className="btn-black">
          Connect Domain
        </button>
      </div>

      {/* Domain status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Primary Domain</p>
              <p className="text-lg font-semibold text-[var(--text)]">mybusiness.com</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-entry)] text-[var(--text)]">
              Active
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Subdomain</p>
              <p className="text-lg font-semibold text-[var(--text)]">mybusiness.naveeg.app</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-grow)] text-white">
              Always Available
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">SSL Certificate</p>
              <p className="text-lg font-semibold text-[var(--text)]">Valid</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-custom)] text-white">
              Secure
            </span>
          </div>
        </div>
      </div>

      {/* Domain list */}
      <div className="card">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Your Domains</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--wash-1)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Expires
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
                      <span className="text-white text-lg">🌐</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text)]">mybusiness.com</div>
                      <div className="text-sm text-[var(--muted)]">Primary domain</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-entry)] text-[var(--text)]">
                    Custom
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  Dec 15, 2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)] mr-3">
                    Manage
                  </button>
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                    DNS
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[var(--wash-1)] rounded-lg flex items-center justify-center">
                      <span className="text-[var(--muted)] text-lg">🔗</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text)]">mybusiness.naveeg.app</div>
                      <div className="text-sm text-[var(--muted)]">Subdomain</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-grow)] text-white">
                    Subdomain
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  Never
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* DNS Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">DNS Settings</h2>
        <div className="bg-[var(--wash-1)] rounded-lg p-4 mb-6">
          <p className="text-sm text-[var(--muted)] mb-4">
            To connect your custom domain, update your DNS provider with these records:
          </p>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center gap-4">
              <span className="text-[var(--text)]">Type:</span>
              <span className="bg-white px-2 py-1 rounded">CNAME</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[var(--text)]">Name:</span>
              <span className="bg-white px-2 py-1 rounded">@</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[var(--text)]">Value:</span>
              <span className="bg-white px-2 py-1 rounded">mybusiness.naveeg.app</span>
            </div>
          </div>
        </div>
        <button className="btn-black">
          Copy DNS Settings
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-[var(--plan-entry)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">SSL Certificate</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Your website is automatically secured with a free SSL certificate.
          </p>
          <button className="btn-black w-full">
            View Certificate
          </button>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-[var(--plan-grow)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">CDN Enabled</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Your website loads fast worldwide with our global CDN.
          </p>
          <button className="btn-black w-full">
            CDN Settings
          </button>
        </div>
      </div>
    </div>
  );
}
