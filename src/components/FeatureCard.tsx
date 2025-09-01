'use client'

import { useState } from 'react'
import { HoverLift } from './ui/Motion'
import Icon from './ui/Icon'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  details: string[]
}

export function FeatureCard({ icon, title, description, details }: FeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <HoverLift>
      <div className="group" tabIndex={0}>
        <div className="card p-6 md:p-7 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          {/* Gradient hairline border on hover */}
          <div className="absolute inset-0 rounded-[1.2rem] p-[1px] before:absolute before:inset-0 before:rounded-[1.2rem] before:bg-gradient-to-r before:from-indigo-500/25 before:to-blue-500/25 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100">
            <div className="w-full h-full bg-white rounded-[1.2rem]" />
          </div>
          
          <div className="relative">
            {/* Icon */}
            <div className="size-11 rounded-full bg-indigo-50 grid place-items-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="text-indigo-600">
                <Icon name={icon as any} className="size-6 text-neutral-800" />
              </div>
            </div>
            
            {/* Content */}
            <h3 className="text-lg font-semibold mb-3 text-[var(--ink)] group-hover:text-indigo-700 transition-colors">
              {title}
            </h3>
            <p className="text-[var(--muted)] text-sm mb-4 leading-relaxed">
              {description}
            </p>
            
            {/* Expandable details */}
            <div>
              <button 
                className="text-sm text-[var(--ink)] hover:text-indigo-600 transition-colors flex items-center" 
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                Details
                <Icon 
                  name="chevron-down" 
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-500 mr-2 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HoverLift>
  )
}
