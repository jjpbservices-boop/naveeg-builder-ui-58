export interface Testimonial {
  avatar: string
  name: string
  role: string
  quote: string
  logo?: string
  company?: string
}

export const testimonials: Testimonial[] = [
  {
    avatar: "/placeholders/avatar-1.jpg",
    name: "Sarah Chen",
    role: "Owner, Bloom & Blossom Florist",
    quote: "Naveeg built our website in under an hour. The AI understood exactly what we needed - a beautiful, professional site that showcases our flowers perfectly. Our online orders increased by 300% in the first month.",
    logo: "/placeholders/company-logo-1.png",
    company: "Bloom & Blossom"
  },
  {
    avatar: "/placeholders/avatar-2.jpg",
    name: "Marcus Rodriguez",
    role: "Founder, TechStart Consulting",
    quote: "As a consultant, I needed a professional website fast. Naveeg delivered exactly what I wanted - clean, modern, and professional. The best part? I can update it myself without any technical knowledge.",
    logo: "/placeholders/company-logo-2.png",
    company: "TechStart Consulting"
  },
  {
    avatar: "/placeholders/avatar-3.jpg",
    name: "Jennifer Park",
    role: "CEO, Artisan Bakery Co.",
    quote: "We went from having no online presence to a fully functional e-commerce website in one afternoon. Naveeg's AI understood our brand perfectly and created something that looks like it cost thousands.",
    logo: "/placeholders/company-logo-3.png",
    company: "Artisan Bakery Co."
  }
]
