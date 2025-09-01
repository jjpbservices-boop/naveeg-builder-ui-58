'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Icon from '../../components/ui/Icon'

const steps = [
  {
    id: 1,
    title: 'Business info',
    description: 'Tell us about your business',
    icon: 'building2'
  },
  {
    id: 2,
    title: 'Goal',
    description: 'What do you want to achieve?',
    icon: 'trending-up'
  },
  {
    id: 3,
    title: 'Brand vibe',
    description: 'Choose your style',
    icon: 'star'
  }
]

const industries = [
  'Restaurant & Food',
  'Fitness & Wellness',
  'Professional Services',
  'Retail & E-commerce',
  'Healthcare',
  'Education',
  'Real Estate',
  'Other'
]

const goals = [
  'Get more bookings',
  'Generate leads',
  'Share information',
  'Sell products',
  'Build community'
]

const brandVibes = [
  'Classic & Professional',
  'Modern & Clean',
  'Minimal & Elegant',
  'Bold & Creative',
  'Warm & Friendly'
]

export default function NewWebsite() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    goal: '',
    brandVibe: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Show success message
    alert("We'll email you when your website is ready!")
    setIsGenerating(false)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.industry
      case 2:
        return formData.goal
      case 3:
        return formData.brandVibe
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Business name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="e.g., Sarah's Restaurant"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                What&apos;s your main goal?
              </label>
              <div className="grid gap-3">
                {goals.map((goal) => (
                  <label key={goal} className="flex items-center space-x-3 p-4 border border-[var(--border)] rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="goal"
                      value={goal}
                      checked={formData.goal === goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-[var(--ink)]">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Choose your brand style
              </label>
              <div className="grid gap-3">
                {brandVibes.map((vibe) => (
                  <label key={vibe} className="flex items-center space-x-3 p-4 border border-[var(--border)] rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="brandVibe"
                      value={vibe}
                      checked={formData.brandVibe === vibe}
                      onChange={(e) => handleInputChange('brandVibe', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-[var(--ink)]">{vibe}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="section-y">
      <div className="container-max max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <Icon name="star" className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-[var(--muted)]">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 border border-[var(--border)] rounded-lg transition-colors ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-[var(--ink)] hover:bg-gray-50'
            }`}
          >
            Back
          </button>
          
          {currentStep === 3 ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isGenerating}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                !canProceed() || isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-black'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate my website'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !canProceed()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-black'
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
