export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Help & Support</h1>
        <p className="mt-2 text-[var(--muted)]">
          Get help with your website and find answers to common questions.
        </p>
      </div>

      {/* Quick help cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-[var(--plan-entry)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">❓</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">FAQ</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Find answers to frequently asked questions.
          </p>
          <button className="btn-black w-full">
            Browse FAQ
          </button>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-[var(--plan-grow)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📞</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">Contact Support</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Get in touch with our support team.
          </p>
          <button className="btn-black w-full">
            Contact Us
          </button>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-[var(--plan-custom)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">Documentation</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Learn how to use all features.
          </p>
          <button className="btn-black w-full">
            View Docs
          </button>
        </div>
      </div>

      {/* Common issues */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Common Issues</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-[var(--wash-1)] rounded-lg">
            <div className="w-8 h-8 bg-[var(--plan-entry)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🔧</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text)] mb-1">Website not loading</h3>
              <p className="text-xs text-[var(--muted)] mb-2">
                Check if your domain is properly connected and DNS settings are correct.
              </p>
              <button className="text-xs text-[var(--accent-grad)] hover:underline">
                View solution →
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[var(--wash-1)] rounded-lg">
            <div className="w-8 h-8 bg-[var(--plan-grow)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">📝</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text)] mb-1">Can't edit content</h3>
              <p className="text-xs text-[var(--muted)] mb-2">
                Make sure you're logged in and have the right permissions to edit.
              </p>
              <button className="text-xs text-[var(--accent-grad)] hover:underline">
                View solution →
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[var(--wash-1)] rounded-lg">
            <div className="w-8 h-8 bg-[var(--plan-custom)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">📊</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text)] mb-1">Analytics not showing</h3>
              <p className="text-xs text-[var(--muted)] mb-2">
                It may take up to 24 hours for analytics data to appear after setup.
              </p>
              <button className="text-xs text-[var(--accent-grad)] hover:underline">
                View solution →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Getting started guide */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Getting Started Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--plan-entry)] rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <span className="text-sm text-[var(--text)]">Connect your domain</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--plan-grow)] rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <span className="text-sm text-[var(--text)]">Customize your content</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--plan-custom)] rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              <span className="text-sm text-[var(--text)]">Add your business info</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
              <span className="text-sm text-[var(--text)]">Upload images and media</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
              <span className="text-sm text-[var(--text)]">Test your website</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center text-white text-xs font-bold">6</div>
              <span className="text-sm text-[var(--text)]">Go live!</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-black">
            View Complete Guide
          </button>
        </div>
      </div>

      {/* Video tutorials */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[var(--wash-1)] rounded-lg p-4">
            <div className="w-full h-32 bg-[var(--border)] rounded-lg mb-3 flex items-center justify-center">
              <span className="text-2xl text-[var(--muted)]">▶️</span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text)] mb-2">Getting Started</h3>
            <p className="text-xs text-[var(--muted)] mb-3">Learn the basics in 5 minutes</p>
            <button className="text-xs text-[var(--accent-grad)] hover:underline">
              Watch video →
            </button>
          </div>

          <div className="bg-[var(--wash-1)] rounded-lg p-4">
            <div className="w-full h-32 bg-[var(--border)] rounded-lg mb-3 flex items-center justify-center">
              <span className="text-2xl text-[var(--muted)]">▶️</span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text)] mb-2">Editing Content</h3>
            <p className="text-xs text-[var(--muted)] mb-3">Update text and images easily</p>
            <button className="text-xs text-[var(--accent-grad)] hover:underline">
              Watch video →
            </button>
          </div>

          <div className="bg-[var(--wash-1)] rounded-lg p-4">
            <div className="w-full h-32 bg-[var(--border)] rounded-lg mb-3 flex items-center justify-center">
              <span className="text-2xl text-[var(--muted)]">▶️</span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text)] mb-2">Domain Setup</h3>
            <p className="text-xs text-[var(--muted)] mb-3">Connect your custom domain</p>
            <button className="text-xs text-[var(--accent-grad)] hover:underline">
              Watch video →
            </button>
          </div>
        </div>
      </div>

      {/* Contact support */}
      <div className="card p-8 text-center">
        <div className="w-20 h-20 bg-[var(--accent-grad)] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">💬</span>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Still need help?</h3>
        <p className="text-[var(--muted)] mb-6 max-w-2xl mx-auto">
          Our support team is here to help you succeed. We typically respond within 2 hours during business hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-black">
            Contact Support
          </button>
          <button className="btn-black bg-white text-black border border-[var(--border)] hover:bg-[var(--wash-1)]">
            Schedule a Call
          </button>
        </div>
      </div>
    </div>
  );
}
