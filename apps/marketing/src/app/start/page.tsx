'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail', label: 'Retail' },
  { value: 'service', label: 'Service Business' },
  { value: 'ecommerce', label: 'E-commerce' },
]

export default function StartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [businessType, setBusinessType] = useState('restaurant')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const payload = {
        business_type: businessType, // Use the state value, not form data
        business_name: formData.get('business_name'),
        business_description: formData.get('business_description'),
        preferred_subdomain: formData.get('preferred_subdomain')
      }
      
      const res = await fetch('/api/start', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      
      if (!json.ok) { 
        alert(json.message || 'Failed to start onboarding')
        return 
      }
      
      // ai-router returns draft_id + region + subdomain
      router.push(`/design?draft_id=${encodeURIComponent(json.draft_id)}`)
    } catch (error) {
      alert('Failed to start onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's Build Your Website
          </h1>
          <p className="text-xl text-gray-600">
            Tell us about your business and we'll create a custom website for you
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              id="business_type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="business_name"
              name="business_name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your business name"
              required
            />
          </div>

          <div>
            <label htmlFor="business_description" className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              id="business_description"
              name="business_description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what your business does..."
              required
            />
          </div>

          <div>
            <label htmlFor="preferred_subdomain" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Subdomain
            </label>
            <div className="flex">
              <input
                type="text"
                id="preferred_subdomain"
                name="preferred_subdomain"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-business"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                .naveeg.com
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Leave blank to auto-generate from your business name
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Building'}
          </button>
        </form>
      </div>
    </div>
  )
}
