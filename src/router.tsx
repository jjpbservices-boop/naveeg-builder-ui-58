import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Type declarations for TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Root route with Header/Footer layout
const rootRoute = createRootRoute({
  component: () => {
    console.log('🧪 Root route component rendering');
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  },
});

// Marketing homepage
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    console.log('🧪 Index route component rendering');
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden py-32">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Rome wasn't built in a day… but your website will be
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Launch a professional website in minutes. No tech skills needed. AI-powered website generation, hosting, and simple editing.
            </p>
            <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium bg-black text-white hover:bg-gray-800 transition text-lg">
              Start free
            </button>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  AI Website Generation
                </h3>
                <p className="text-gray-600">
                  Tell us about your business, we create everything
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Hosting + SSL + Backups
                </h3>
                <p className="text-gray-600">
                  Fast EU hosting with SSL and daily backups
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Drag-and-Drop Editor
                </h3>
                <p className="text-gray-600">
                  Simple editing without technical skills
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See What's Possible
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Beautiful websites built with Naveeg in minutes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-4xl text-blue-600">🏗️</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Website {i}</h3>
                    <p className="text-gray-600 text-sm">Professional design with modern aesthetics</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="/gallery" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-black text-white hover:bg-gray-800 transition">
                View All Websites
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by Business Owners
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Restaurant Owner",
                  content: "Naveeg built my restaurant website in 15 minutes. It looks professional and brings in customers every day.",
                  rating: 5
                },
                {
                  name: "Marcus Rodriguez",
                  role: "Fitness Trainer",
                  content: "I had no idea how to build a website. Naveeg made it so simple, and it looks amazing!",
                  rating: 5
                },
                {
                  name: "Emma Thompson",
                  role: "Boutique Owner",
                  content: "The AI understood exactly what I wanted. My boutique website is beautiful and drives sales.",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <span key={j} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of business owners who've launched their websites with Naveeg
            </p>
            <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium bg-white text-blue-600 hover:bg-gray-100 transition text-lg">
              Start Building Now
            </button>
          </div>
        </section>
      </div>
    );
  },
});

// Features page
const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Succeed Online
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From AI-powered generation to professional hosting, we've got you covered
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16">
          {[
            {
              title: "AI Website Generation",
              description: "Tell us about your business and we'll create a professional website in minutes. No design skills needed.",
              icon: "🤖",
              features: ["Smart content generation", "Professional layouts", "Industry-specific designs", "SEO optimization"]
            },
            {
              title: "Hosting + SSL + Backups",
              description: "Fast EU hosting with automatic SSL certificates and daily backups. Your site is always safe and fast.",
              icon: "🚀",
              features: ["99.9% uptime guarantee", "Global CDN", "Automatic SSL", "Daily backups"]
            },
            {
              title: "Drag-and-Drop Editor",
              description: "Simple editing without technical skills. Change text, images, and layouts with ease.",
              icon: "🎨",
              features: ["Visual editor", "No coding required", "Real-time preview", "Mobile responsive"]
            },
            {
              title: "Domain Connection",
              description: "Connect your custom domain with one click. Professional branding for your business.",
              icon: "🌐",
              features: ["Custom domains", "DNS management", "Email forwarding", "Subdomain support"]
            },
            {
              title: "WordPress Auto-Login",
              description: "One-click access to your WordPress admin panel. Full control when you need it.",
              icon: "🔑",
              features: ["Secure access", "Admin panel", "Plugin management", "Content editing"]
            },
            {
              title: "Simple Analytics",
              description: "Track your website's performance with easy-to-understand metrics and insights.",
              icon: "📊",
              features: ["Traffic overview", "PageSpeed scores", "Visitor insights", "Performance tracking"]
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.features.map((item, j) => (
                  <li key={j} className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// How It Works page
const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/how-it-works',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to your professional website
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Tell Us About Your Business",
              description: "Answer a few simple questions about your business, industry, and goals. Our AI understands what makes you unique.",
              icon: "💬"
            },
            {
              step: "02",
              title: "AI Creates Your Website",
              description: "Our advanced AI generates a professional website with perfect content, design, and structure for your business.",
              icon: "🤖"
            },
            {
              step: "03",
              title: "Launch & Grow",
              description: "Your website goes live instantly with hosting, SSL, and backups included. Start growing your online presence today.",
              icon: "🚀"
            }
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">{step.step}</span>
              </div>
              <div className="text-6xl mb-4">{step.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium bg-black text-white hover:bg-gray-800 transition text-lg">
            Start Building Now
          </button>
        </div>
      </div>
    </div>
  ),
});

// Pricing page
const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your business. All plans include our core features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              name: "Entry",
              price: "€9",
              period: "/month",
              color: "bg-green-100",
              headerColor: "bg-green-500",
              description: "Perfect for small businesses getting started online",
              features: ["1 website", "AI generation", "Hosting + SSL", "Basic analytics", "Email support"]
            },
            {
              name: "Grow",
              price: "€19",
              period: "/month",
              color: "bg-blue-100",
              headerColor: "bg-blue-500",
              description: "Ideal for growing businesses with multiple websites",
              features: ["3 websites", "AI generation", "Hosting + SSL", "Advanced analytics", "Priority support", "Custom domains"]
            },
            {
              name: "Custom",
              price: "Custom",
              period: "",
              color: "bg-purple-100",
              headerColor: "bg-purple-500",
              description: "Enterprise solutions for large organizations",
              features: ["Unlimited websites", "AI generation", "Hosting + SSL", "Full analytics", "Dedicated support", "Custom integrations"]
            }
          ].map((plan, i) => (
            <div key={i} className={`${plan.color} rounded-2xl p-8 relative`}>
              <div className={`${plan.headerColor} text-white text-center py-4 px-6 rounded-t-2xl -mt-8 -mx-8 mb-6`}>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900">{plan.price}</div>
                <div className="text-gray-600">{plan.period}</div>
              </div>
              <p className="text-gray-700 mb-6 text-center">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium bg-black text-white hover:bg-gray-800 transition">
                {plan.name === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Every Plan Includes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "AI-powered website generation",
              "Professional hosting with SSL",
              "Daily automated backups",
              "Mobile-responsive design",
              "SEO optimization",
              "24/7 customer support",
              "Drag-and-drop editor",
              "Performance monitoring"
            ].map((feature, i) => (
              <div key={i} className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

// Gallery page
const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Website Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the amazing websites our AI has created for businesses just like yours
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              <div className="h-64 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <span className="text-6xl">🏗️</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Website {i + 1}</h3>
                <p className="text-gray-600 text-sm mb-4">Professional design with modern aesthetics</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Industry: Business</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// FAQ page
const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/faq',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about Naveeg
          </p>
        </div>
        
        <div className="space-y-6">
          {[
            {
              question: "How does AI website generation work?",
              answer: "Our AI analyzes your business description and industry to create a professional website with relevant content, design, and structure. It understands what makes your business unique and builds accordingly."
            },
            {
              question: "Can I edit the generated website?",
              answer: "Absolutely! You can edit every aspect of your website using our drag-and-drop editor. Change text, images, colors, and layouts without any technical skills."
            },
            {
              question: "What's included in hosting?",
              answer: "We provide fast EU hosting with automatic SSL certificates, daily backups, and 99.9% uptime guarantee. Your website is always secure and accessible."
            },
            {
              question: "Do I own my website?",
              answer: "Yes, you have full ownership of your website. You can export it, move it to another host, or cancel your subscription at any time."
            },
            {
              question: "What if I need help?",
              answer: "We offer 24/7 customer support through email and chat. Our team is here to help you succeed with your website."
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// About page
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Naveeg
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize web development and help every business succeed online
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We believe every business deserves a professional online presence. Traditional web development is expensive, 
              time-consuming, and requires technical expertise that most business owners don't have.
            </p>
            <p className="text-gray-600">
              Naveeg changes that. Our AI-powered platform creates beautiful, professional websites in minutes, 
              not months. We handle the technical complexity so you can focus on what you do best - running your business.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 text-center">
            <span className="text-8xl">🎯</span>
          </div>
        </div>
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Alex Chen", role: "CEO & Founder", avatar: "👨‍💼" },
              { name: "Sarah Kim", role: "CTO", avatar: "👩‍💻" },
              { name: "Marcus Rodriguez", role: "Head of Design", avatar: "🎨" }
            ].map((member, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

// Contact page
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Tell us how we can help..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium bg-black text-white hover:bg-gray-800 transition text-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  ),
});

// Security page
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Security & Privacy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your security and privacy are our top priorities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Enterprise-Grade Security</h2>
            <p className="text-gray-600 mb-6">
              We implement industry-leading security measures to protect your data and ensure your website is always secure.
            </p>
            <ul className="space-y-3">
              {[
                "256-bit SSL encryption",
                "Regular security audits",
                "DDoS protection",
                "Secure data centers",
                "Compliance with GDPR"
              ].map((item, i) => (
                <li key={i} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-12 text-center">
            <span className="text-8xl">🔒</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Security Checklist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Regular security updates",
              "Automated vulnerability scanning",
              "Secure authentication",
              "Data encryption at rest",
              "Secure API endpoints",
              "Comprehensive logging",
              "Incident response plan",
              "Regular penetration testing"
            ].map((item, i) => (
              <div key={i} className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

// Blog page
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: () => (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Blog & Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tips, tricks, and insights to help your business succeed online
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "10 Ways to Improve Your Website's Conversion Rate",
              excerpt: "Learn proven strategies to turn more visitors into customers...",
              date: "Dec 15, 2024",
              category: "Marketing"
            },
            {
              title: "The Complete Guide to Website Security",
              excerpt: "Protect your website from common threats and vulnerabilities...",
              date: "Dec 12, 2024",
              category: "Security"
            },
            {
              title: "How AI is Revolutionizing Web Design",
              excerpt: "Discover how artificial intelligence is changing the way websites are built...",
              date: "Dec 10, 2024",
              category: "Technology"
            }
          ].map((post, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm text-blue-600 font-medium">{post.category}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => {
    console.log('🧪 Dashboard route component rendering');
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Naveeg Dashboard</h2>
            <p className="text-gray-600 mb-4">
              This is where you'll manage your websites, domains, and settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Websites</h3>
                <p className="text-blue-700 text-sm">Manage your websites</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Analytics</h3>
                <p className="text-green-700 text-sm">View performance data</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Settings</h3>
                <p className="text-purple-700 text-sm">Configure your account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

// Health check route
const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health',
  component: () => {
    console.log('🧪 Health route component rendering');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-green-600">✅ Healthy</h1>
          <p className="text-gray-600">Backend services are running</p>
        </div>
      </div>
    );
  },
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  featuresRoute,
  howItWorksRoute,
  pricingRoute,
  galleryRoute,
  faqRoute,
  aboutRoute,
  contactRoute,
  securityRoute,
  blogRoute,
  dashboardRoute,
  healthRoute,
]);

export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}