export default function BackupsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Backups</h1>
          <p className="mt-2 text-[var(--muted)]">
            Keep your website safe with automatic and manual backups.
          </p>
        </div>
        <button className="btn-black">
          Run Backup
        </button>
      </div>

      {/* Backup status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--plan-entry)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">💾</span>
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Total Backups</p>
            <p className="text-2xl font-bold text-[var(--text)]">12</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--plan-grow)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔄</span>
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Auto Backups</p>
            <p className="text-2xl font-bold text-[var(--text)]">8</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--plan-custom)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👤</span>
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Manual Backups</p>
            <p className="text-2xl font-bold text-[var(--text)]">4</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✅</span>
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Last Backup</p>
            <p className="text-lg font-semibold text-[var(--text)]">2 hours ago</p>
          </div>
        </div>
      </div>

      {/* Backup list */}
      <div className="card">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Backup History</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--wash-1)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Backup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Date
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
                      <span className="text-white text-lg">💾</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text)]">Website Backup</div>
                      <div className="text-sm text-[var(--muted)]">Complete website snapshot</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-entry)] text-[var(--text)]">
                    Auto
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  45.2 MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  2 hours ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)] mr-3">
                    Download
                  </button>
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                    Restore
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[var(--wash-1)] rounded-lg flex items-center justify-center">
                      <span className="text-[var(--muted)] text-lg">📁</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text)]">Database Backup</div>
                      <div className="text-sm text-[var(--muted)]">Content and settings</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-grow)] text-white">
                    Manual
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  12.8 MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  1 day ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)] mr-3">
                    Download
                  </button>
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                    Restore
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[var(--wash-1)] rounded-lg flex items-center justify-center">
                      <span className="text-[var(--muted)] text-lg">🖼️</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text)]">Media Backup</div>
                      <div className="text-sm text-[var(--muted)]">Images and files</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-custom)] text-white">
                    Auto
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  28.5 MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                  3 days ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)] mr-3">
                    Download
                  </button>
                  <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                    Restore
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Automatic Backups</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Daily Backups</p>
                <p className="text-xs text-[var(--muted)]">Every day at 2:00 AM</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Keep for 30 days</p>
                <p className="text-xs text-[var(--muted)]">Old backups are automatically deleted</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Email notifications</p>
                <p className="text-xs text-[var(--muted)]">Get notified of backup status</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-6">
            <button className="btn-black w-full">
              Configure Backup Settings
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Backup Storage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text)]">Used Space</span>
                <span className="text-[var(--muted)]">1.2 GB / 10 GB</span>
              </div>
              <div className="w-full bg-[var(--wash-1)] rounded-full h-2">
                <div className="bg-[var(--accent-grad)] h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div className="text-sm text-[var(--muted)]">
              <p>• Website backups: 856 MB</p>
              <p>• Database backups: 234 MB</p>
              <p>• Media backups: 156 MB</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="btn-black w-full">
              Upgrade Storage
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="text-center">
        <div className="card p-8 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-[var(--accent-grad)] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🛡️</span>
          </div>
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Your website is protected</h3>
          <p className="text-[var(--muted)] mb-6">
            Automatic daily backups ensure your website is always safe. You can also create manual backups before making major changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-black">
              Create Manual Backup
            </button>
            <button className="btn-black bg-white text-black border border-[var(--border)] hover:bg-[var(--wash-1)]">
              View Backup Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
