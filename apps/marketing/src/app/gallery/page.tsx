import { Section } from '../../components/Section'
import { FinalCTA } from '../../components/sections/FinalCTA'
import { Icon } from '@naveeg/ui'

export default function Gallery() {
  const categories = ['All', 'Services', 'Retail', 'Food', 'Wellness']
  const projects = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Project ${i + 1}`,
    category: categories[(i % (categories.length - 1)) + 1], // Deterministic assignment
    image: `/api/placeholder/400/300?text=Project+${i + 1}`
  }))

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">Gallery</h1>
          <p className="body max-w-2xl mx-auto">
            See what our AI can create for your business
          </p>
        </div>
        
        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Project grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="card p-6 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="building2" className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                <p className="text-sm text-[var(--muted)]">{project.category}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      
      <FinalCTA />
    </div>
  )
}
