import { Section } from '../../components/Section'
import { FadeIn } from '../../components/ui/Motion'
import Icon from '../../components/ui/Icon'

export default function Gallery() {
  const projects = [
    {
      title: "Restaurant Website",
      category: "Food",
      image: "/api/placeholder/400/300",
      description: "Modern restaurant website with online ordering and menu showcase."
    },
    {
      title: "Fitness Studio",
      category: "Wellness",
      image: "/api/placeholder/400/300",
      description: "Dynamic fitness website with class schedules and member portal."
    },
    {
      title: "Boutique Store",
      category: "Retail",
      image: "/api/placeholder/400/300",
      description: "Elegant boutique website with product catalog and online shopping."
    },
    {
      title: "Consulting Firm",
      category: "Services",
      image: "/api/placeholder/400/300",
      description: "Professional consulting website with service offerings and team profiles."
    },
    {
      title: "Dental Practice",
      category: "Healthcare",
      image: "/api/placeholder/400/300",
      description: "Clean dental website with appointment booking and service information."
    },
    {
      title: "Real Estate Agency",
      category: "Services",
      image: "/api/placeholder/400/300",
      description: "Property showcase website with listing search and agent profiles."
    },
    {
      title: "Coffee Shop",
      category: "Food",
      image: "/api/placeholder/400/300",
      description: "Cozy coffee shop website with menu and location information."
    },
    {
      title: "Yoga Studio",
      category: "Wellness",
      image: "/api/placeholder/400/300",
      description: "Peaceful yoga website with class schedules and instructor bios."
    },
    {
      title: "Law Firm",
      category: "Services",
      image: "/api/placeholder/400/300",
      description: "Professional law firm website with practice areas and attorney profiles."
    },
    {
      title: "Pet Grooming",
      category: "Services",
      image: "/api/placeholder/400/300",
      description: "Friendly pet grooming website with service packages and booking."
    },
    {
      title: "Photography Studio",
      category: "Services",
      image: "/api/placeholder/400/300",
      description: "Creative photography website with portfolio gallery and booking."
    },
    {
      title: "Bakery",
      category: "Food",
      image: "/api/placeholder/400/300",
      description: "Delicious bakery website with product showcase and order form."
    }
  ]

  const categories = ["All", "Services", "Retail", "Food", "Wellness", "Healthcare"]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">Gallery</h1>
          <p className="body max-w-2xl mx-auto">
            See what our AI can create for your business. Browse real examples from different industries.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="card overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <Icon name="building2" className="w-16 h-16 text-gray-400" />
                </div>
                <div className="p-6">
                  <div className="text-sm text-[var(--muted)] mb-2">{project.category}</div>
                  <h3 className="text-lg font-semibold mb-2 text-[var(--ink)]">{project.title}</h3>
                  <p className="text-[var(--muted)] text-sm">{project.description}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </div>
  )
}
