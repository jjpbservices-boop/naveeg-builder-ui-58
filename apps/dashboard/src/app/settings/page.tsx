'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Icon from '../../components/ui/Icon'

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
]

export default function Settings() {
  const [currentLocale, setCurrentLocale] = useState('en')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Mock user data - replace with actual auth state
  const user = {
    email: 'user@example.com',
    name: 'John Doe',
    avatar: null
  }

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale)
    // Here you would typically save to user preferences
    alert(`Language changed to ${locales.find(l => l.code === locale)?.name}`)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Account deletion request submitted. Our team will contact you within 24 hours.')
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  return (
    <div className="section-y">
      <div className="container-max max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ink)] mb-4">
            Settings
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">Profile</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-600">{user.name[0].toUpperCase()}</span>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ink)]">{user.name}</h3>
                  <p className="text-[var(--muted)]">{user.email}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-gray-50 text-[var(--muted)]"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Contact support to change your email
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="btn-black">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Locale Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">Language & Region</h2>
            
            <div className="space-y-4">
              <p className="text-[var(--muted)]">
                Choose your preferred language for the dashboard interface.
              </p>
              
              <div className="grid gap-3">
                {locales.map((locale) => (
                  <label
                    key={locale.code}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentLocale === locale.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-[var(--border)] hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="locale"
                      value={locale.code}
                      checked={currentLocale === locale.code}
                      onChange={(e) => handleLocaleChange(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-2xl">{locale.flag}</span>
                    <span className="text-[var(--ink)]">{locale.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="card p-8 border-red-200 bg-red-50">
            <h2 className="text-2xl font-bold text-red-800 mb-6">Danger Zone</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h3>
                <p className="text-red-700 mb-4">
                  This action cannot be undone. This will permanently delete your account and all associated data.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-red-800 text-sm">
                        Are you absolutely sure? This action cannot be undone.
                      </p>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isDeleting
                            ? 'bg-red-400 text-white cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
