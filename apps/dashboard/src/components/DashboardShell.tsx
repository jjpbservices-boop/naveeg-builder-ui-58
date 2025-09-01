'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { makeSupabaseBrowser } from '@naveeg/lib/supabase/client'
import { env } from '../lib/env'
import { t } from '@naveeg/ui'
import Icon from './ui/Icon'

const navigation = [
  { name: 'overview', href: '/app', icon: 'bar-chart-3' },
  { name: 'analytics', href: '/app/analytics', icon: 'trending-up' },
  { name: 'billing', href: '/app/billing', icon: 'key-round' },
  { name: 'settings', href: '/app/settings', icon: 'server-cog' },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Only create Supabase client on the client side
    if (typeof window !== 'undefined') {
      const client = makeSupabaseBrowser(env.SUPABASE_URL, env.SUPABASE_ANON)
      setSupabase(client)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = 'http://localhost:4311/start'
          return
        }
        setUser(user)
      } catch (error) {
        console.error('Auth error:', error)
        window.location.href = 'http://localhost:4311/start'
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = 'http://localhost:4311/start'
      } else if (session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--wash-1)]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-0 z-50 h-full w-70 bg-white border-r border-[var(--border)] lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--border)]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Icon name="building2" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--ink)]">Naveeg</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="chevron-down" className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-50'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon name={item.icon as any} className="w-5 h-5" />
                      <span className="font-medium">
                        {t('en', `dashboard.navigation.${item.name}`)}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User menu */}
          <div className="border-t border-[var(--border)] p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Icon name="building2" className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ink)] truncate">
                  {user.email}
                </p>
                <p className="text-xs text-[var(--muted)]">Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={`lg:pl-70 transition-all duration-300 ${isSidebarOpen ? 'pl-70' : 'pl-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[var(--border)]">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Icon name="panels-top-left" className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-[var(--muted)]">
                Welcome back, {user.email}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
