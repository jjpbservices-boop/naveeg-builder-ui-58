import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function BlogPage() {
  const t = getTranslations('en');

  const blogPosts = [
    {
      id: 1,
      title: "How to Choose the Right Website Template for Your Business",
      excerpt: "Selecting the perfect template is crucial for your business success. Here's how to make the right choice.",
      date: "2024-01-15",
      category: "Design Tips",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "The Complete Guide to Website SEO for Small Businesses",
      excerpt: "Learn the essential SEO strategies that will help your website rank higher and attract more customers.",
      date: "2024-01-10",
      category: "Marketing",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "Why Fast Loading Times Matter for Your Website",
      excerpt: "Speed isn't just about user experience—it affects your search rankings and conversion rates too.",
      date: "2024-01-05",
      category: "Performance",
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "Building Trust Through Professional Website Design",
      excerpt: "Your website's design directly impacts how customers perceive your business. Here's how to build trust.",
      date: "2024-01-01",
      category: "Business",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            Blog & Resources
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
            Tips, guides, and insights to help you build and grow your online presence.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="container-clean">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <span className="inline-block bg-[var(--wash-1)] text-[var(--muted)] text-xs font-medium px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold mb-3 text-[var(--text)] line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-[var(--muted)] mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span>{post.readTime}</span>
                </div>
                
                <a 
                  href={`/blog/${post.id}`}
                  className="inline-block mt-4 text-[var(--text)] font-medium hover:underline"
                >
                  Read more →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-[var(--wash-2)]">
        <div className="container-clean max-w-2xl text-center">
          <h2 className="mb-6">Stay Updated</h2>
          <p className="text-lg text-[var(--muted)] mb-8">
            Get the latest tips and insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button className="btn-black whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
