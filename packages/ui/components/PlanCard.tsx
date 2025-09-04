'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { Badge } from './Badge';
import { Card } from './Card';

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  current?: boolean;
  popular?: boolean;
  gradient?: 'green' | 'blue' | 'purple';
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary';
  onButtonClick?: () => void;
  className?: string;
}

export function PlanCard({
  name,
  price,
  period = '/month',
  description,
  features,
  current = false,
  popular = false,
  gradient = 'blue',
  buttonText = 'Get Started',
  buttonVariant = 'primary',
  onButtonClick,
  className,
}: PlanCardProps) {
  const gradientClasses = {
    green: 'from-green-50 to-emerald-50 border-green-200',
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    purple: 'from-purple-50 to-violet-50 border-purple-200',
  };

  const buttonClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn('relative', className)}
    >
      <Card
        gradient={gradient}
        className={cn(
          'h-full flex flex-col',
          popular && 'ring-2 ring-blue-500 ring-offset-2'
        )}
      >
        {popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="info" size="sm">
              Most Popular
            </Badge>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          {description && (
            <p className="text-gray-600 text-sm mb-4">{description}</p>
          )}
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-600 ml-1">{period}</span>
          </div>
        </div>

        <div className="flex-1 mb-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          {current && (
            <div className="text-center">
              <Badge variant="success" size="sm">
                Current Plan
              </Badge>
            </div>
          )}
          <button
            onClick={onButtonClick}
            className={cn(
              'w-full px-4 py-3 rounded-xl font-medium transition-colors',
              buttonClasses[buttonVariant]
            )}
          >
            {current ? 'Manage Plan' : buttonText}
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
