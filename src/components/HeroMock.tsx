'use client'

import { motion } from 'framer-motion'
import Icon from './ui/Icon'

export function HeroMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative w-full max-w-lg mx-auto"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/60 to-gray-200/60 rounded-[1.2rem] transform rotate-3 scale-95 opacity-40" />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[1.2rem] transform -rotate-2 scale-98 shadow-lg border border-white/20" />
      
      {/* Main card */}
      <div className="relative bg-white/80 backdrop-blur-md rounded-[1.2rem] shadow-xl border border-white/40 p-6">
        {/* Browser chrome */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-gray-100/80 rounded-lg h-6 ml-2" />
        </div>
        
        {/* Content placeholders */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200/80 rounded w-3/4" />
          <div className="h-4 bg-gray-200/80 rounded w-1/2" />
          <div className="h-4 bg-gray-200/80 rounded w-5/6" />
          <div className="h-4 bg-gray-200/80 rounded w-2/3" />
        </div>
        
        {/* Icon placeholder */}
        <div className="mt-4 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 rounded-lg h-32 flex items-center justify-center">
          <Icon name="building2" className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    </motion.div>
  )
}
