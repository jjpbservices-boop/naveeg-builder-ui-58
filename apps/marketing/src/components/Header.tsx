'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:4312";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-md bg-white/70 border-b border-[var(--border)] shadow-sm' 
        : 'bg-white'
    }`}>
      <div className="container-max">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[var(--ink)] hover:opacity-80 transition-opacity">
            Naveeg
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="underline-anim text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Features
            </Link>
            <Link href="/how-it-works" className="underline-anim text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              How it Works
            </Link>
            <Link href="/pricing" className="underline-anim text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Pricing
            </Link>
            <Link href="/gallery" className="underline-anim text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Gallery
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Select */}
            <select className="hidden md:block text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-white/80 backdrop-blur-sm focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
              <option>EN</option>
              <option>ES</option>
              <option>FR</option>
            </select>

            {/* Login */}
            <a href={`${DASHBOARD_URL}/app`} className="hidden md:block underline-anim text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Login
            </a>

            {/* CTA Button */}
            <Link href="/start" className="btn-primary btn-primary-light">
              Start free
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border)] bg-white/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-4">
              <Link href="/features" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-1 rounded">
                Features
              </Link>
              <Link href="/how-it-works" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-1 rounded">
                How it Works
              </Link>
              <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-1 rounded">
                Pricing
              </Link>
              <Link href="/gallery" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-1 rounded">
                Gallery
              </Link>
              <a href={`${DASHBOARD_URL}/app`} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-1 rounded">
                Login
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
