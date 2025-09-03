'use client'

import { ReactNode, useState } from 'react'
import { HoverLift } from './ui/Motion'
import Icon from './ui/Icon'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  details?: string[]
}

export function FeatureCard({ icon, title, description, details }: FeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <HoverLift className="group h-full">
      <div className="card p-6 md:p-7 hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col">
        {/* Gradient hairline border */}
        <div className="absolute inset-0 rounded-[1.2rem] p-[1px] before:absolute before:inset-0 before:rounded-[1.2rem] before:bg-gradient-to-r before:from-indigo-500/25 before:to-blue-500/25 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100">
          <div className="w-full h-full bg-white rounded-[1.2rem]"></div>
        </div>
        
        <div className="relative flex flex-col h-full">
          {/* Professional icon container */}
          <div className="icon-container icon-container-light mb-5 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          
          {/* Title and description - Fixed height for consistency */}
          <h3 className="text-lg font-semibold mb-3 text-[var(--ink)] group-hover:text-indigo-700 transition-colors min-h-[3.5rem] flex items-center">
            {title}
          </h3>
          <p className="text-[var(--muted)] text-sm mb-4 leading-relaxed min-h-[3.5rem] flex items-start">
            {description}
          </p>
          
          {/* Details toggle - Always at bottom */}
          <div className="mt-auto">
            {details && details.length > 0 && (
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-[var(--ink)] hover:text-indigo-600 transition-colors flex items-center"
                  aria-expanded={isExpanded}
                >
                  Details
                  <Icon 
                    name="chevron-down"
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Collapsible details area */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="space-y-2 text-sm text-[var(--muted)]">
                    {details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 mr-2 mt-1">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HoverLift>
  )
}
