export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  avatar: string
}

export const testimonials: Testimonial[] = [
  {
    quote: "Zero tech in our team. We went live the same day.",
    name: "Sample",
    role: "Café owner",
    company: "Local Café",
    avatar: "/placeholders/avatar-1.jpg"
  },
  {
    quote: "We changed prices and photos ourselves. Easy.",
    name: "Sample", 
    role: "Hair salon owner",
    company: "Beauty Salon",
    avatar: "/placeholders/avatar-2.jpg"
  },
  {
    quote: "Finally, a website I can actually update without calling IT.",
    name: "Sample",
    role: "Restaurant owner", 
    company: "Family Restaurant",
    avatar: "/placeholders/avatar-3.jpg"
  },
  {
    quote: "Our customers can now book online. Game changer.",
    name: "Sample",
    role: "Service business owner",
    company: "Local Services",
    avatar: "/placeholders/avatar-4.jpg"
  }
]
