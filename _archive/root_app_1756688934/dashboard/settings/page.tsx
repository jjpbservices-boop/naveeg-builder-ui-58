export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Settings</h1>
        <p className="mt-2 text-[var(--muted)]">
          Configure your website settings and preferences.
        </p>
      </div>

      {/* Settings sections */}
      <div className="space-y-8">
        {/* Brand Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Brand Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--accent-grad)] rounded-lg border-2 border-[var(--border)]"></div>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Current Theme</p>
                  <p className="text-xs text-[var(--muted)]">Blue gradient</p>
                </div>
              </div>
              <div className="mt-4">
                <button className="btn-black">
                  Change Brand Color
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Company Logo
              </label>
              <div className="w-24 h-24 bg-[var(--wash-1)] rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                <span className="text-2xl text-[var(--muted)]">🖼️</span>
              </div>
              <div className="mt-4">
                <button className="btn-black">
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Language & Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Website Language
              </label>
              <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="it">Italiano</option>
              </select>
              <p className="text-xs text-[var(--muted)] mt-1">
                This affects your website content language
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Time Zone
              </label>
              <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                <option value="utc">UTC (Coordinated Universal Time)</option>
                <option value="est">EST (Eastern Standard Time)</option>
                <option value="pst">PST (Pacific Standard Time)</option>
                <option value="gmt">GMT (Greenwich Mean Time)</option>
              </select>
              <p className="text-xs text-[var(--muted)] mt-1">
                Used for scheduling and timestamps
              </p>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">User Management</h2>
            <button className="btn-black">
              Invite User
            </button>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--wash-1)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Status
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
                      <div className="w-10 h-10 bg-[var(--accent-grad)] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">U</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--text)]">user@example.com</div>
                        <div className="text-sm text-[var(--muted)]">Primary owner</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--plan-custom)] text-white">
                      Owner
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[var(--text)] hover:text-[var(--accent-grad)]">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Security Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">Two-Factor Authentication</h3>
                <p className="text-xs text-[var(--muted)]">Add an extra layer of security to your account</p>
              </div>
              <button className="btn-black">
                Enable 2FA
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">Session Timeout</h3>
                <p className="text-xs text-[var(--muted)]">Automatically log out after inactivity</p>
              </div>
              <select className="border border-[var(--border)] rounded-lg px-3 py-2 bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                <option value="1">1 hour</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">Login Notifications</h3>
                <p className="text-xs text-[var(--muted)]">Get notified of new login attempts</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Advanced Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">Debug Mode</h3>
                <p className="text-xs text-[var(--muted)]">Enable detailed error logging (development only)</p>
              </div>
              <div className="w-3 h-3 bg-[var(--border)] rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">API Access</h3>
                <p className="text-xs text-[var(--muted)]">Generate API keys for external integrations</p>
              </div>
              <button className="btn-black">
                Manage API Keys
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">Data Export</h3>
                <p className="text-xs text-[var(--muted)]">Download all your website data</p>
              </div>
              <button className="btn-black">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save buttons */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--wash-1)] transition-colors">
          Reset to Defaults
        </button>
        <button className="btn-black">
          Save All Changes
        </button>
      </div>
    </div>
  );
}
