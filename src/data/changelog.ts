export interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  changes: string[]
  type: 'major' | 'minor' | 'patch'
}

export const changelog: ChangelogEntry[] = [
  {
    version: "2.0.0",
    date: "2024-01-15",
    title: "Major Platform Update",
    description: "Complete redesign with new AI capabilities and improved performance",
    changes: [
      "New AI-powered website generation engine",
      "Redesigned dashboard with improved UX",
      "Enhanced e-commerce integration",
      "Performance improvements across the platform",
      "New mobile app for iOS and Android"
    ],
    type: "major"
  },
  {
    version: "1.5.0",
    date: "2023-12-01",
    title: "E-commerce Enhancements",
    description: "Major improvements to online store functionality",
    changes: [
      "New payment gateway integrations",
      "Improved inventory management",
      "Enhanced product customization options",
      "Better shipping and tax calculations"
    ],
    type: "minor"
  },
  {
    version: "1.4.2",
    date: "2023-11-15",
    title: "Performance & Security",
    description: "Bug fixes and security improvements",
    changes: [
      "Fixed mobile responsiveness issues",
      "Security vulnerability patches",
      "Performance optimizations",
      "Improved error handling"
    ],
    type: "patch"
  },
  {
    version: "1.4.0",
    date: "2023-10-20",
    title: "Analytics & SEO",
    description: "New analytics dashboard and SEO tools",
    changes: [
      "New analytics dashboard",
      "Advanced SEO optimization tools",
      "Social media integration",
      "Improved content management"
    ],
    type: "minor"
  }
]
