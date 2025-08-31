import React, { useState } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Send,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Section } from '@/components/ui/section'
import { CTA } from '@/components/ui/cta'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Implement actual form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Form submitted:', formData)
    setIsSubmitting(false)
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      businessName: '',
      message: ''
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section
        eyebrow="Contact Us"
        title="Need help or a quick demo?"
        description="Tell us what you do and what you need. We'll reply fast."
        className="text-center pt-32"
      >
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-lead">
            Whether you need help getting started, want to see Naveeg in action, 
            or have questions about your account, we're here to help.
          </p>
        </div>
      </Section>

      {/* Contact Form */}
      <Section className="pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div className="card-clean p-8">
              <h2 className="heading-display text-2xl mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium mb-2">
                    Business name
                  </label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Your company name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your business and what you need..."
                    rows={5}
                    className="w-full resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send message
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  We only use your data to answer your request.
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="heading-display text-xl mb-4">Other ways to reach us</h3>
                <p className="text-muted-foreground mb-6">
                  Prefer email or need immediate assistance? Here are your options:
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email us directly</h4>
                    <p className="text-muted-foreground mb-2">
                      For general inquiries and support
                    </p>
                    <a 
                      href="mailto:support@naveeg.app"
                      className="text-primary hover:underline font-medium"
                    >
                      support@naveeg.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Live chat</h4>
                    <p className="text-muted-foreground mb-2">
                      Available during business hours
                    </p>
                    <Button variant="outline" size="sm">
                      Start chat
                    </Button>
                  </div>
                </div>
              </div>

              <div className="card-clean p-6 bg-muted/20">
                <h4 className="font-semibold mb-3">Response times</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Email: Within 4 hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Live chat: Immediate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Demo requests: Same day</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section
        eyebrow="Common Questions"
        title="Quick answers to popular questions"
        description="Find answers to the most frequently asked questions about Naveeg"
        className="bg-muted/20"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {[
            {
              question: "How quickly can I get a website?",
              answer: "Most customers go from idea to live website in under 2 hours. Our AI handles the heavy lifting, so you can focus on your business."
            },
            {
              question: "Do I need technical skills?",
              answer: "No technical skills required. If you can send an email, you can build and manage your WordPress website with Naveeg."
            },
            {
              question: "Can I use my own domain?",
              answer: "Yes! Start on a free Naveeg subdomain and connect your own domain anytime. We'll help you with the setup."
            },
            {
              question: "What if I need help?",
              answer: "We offer email support for all plans, priority support for Growth+ customers, and live chat during business hours."
            }
          ].map((faq, index) => (
            <div key={index} className="card-clean p-6">
              <h3 className="font-semibold mb-3">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <CTA
        headline="Ready to get started?"
        subcopy="Join thousands of SMEs who trust Naveeg to build and manage their online presence. Start your free trial today."
        primaryButton={{
          text: "Start free",
          href: "/auth",
          loading: false
        }}
        secondaryLink={{
          text: "Book a demo",
          href: "/contact"
        }}
      />
    </div>
  )
}