export interface SEOConfig {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  canonical?: string
}

export const setPageSEO = (config: SEOConfig) => {
  // Set title
  if (document.title !== config.title) {
    document.title = config.title
  }

  // Set meta description
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', config.description)

  // Set keywords
  if (config.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', config.keywords)
  }

  // Set Open Graph tags
  const ogTags = [
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:type', content: config.ogType || 'website' },
    { property: 'og:url', content: config.canonical || window.location.href }
  ]

  if (config.ogImage) {
    ogTags.push({ property: 'og:image', content: config.ogImage })
  }

  ogTags.forEach(tag => {
    let metaTag = document.querySelector(`meta[property="${tag.property}"]`)
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute('property', tag.property)
      document.head.appendChild(metaTag)
    }
    metaTag.setAttribute('content', tag.content)
  })

  // Set Twitter Card tags
  const twitterTags = [
    { name: 'twitter:card', content: config.twitterCard || 'summary_large_image' },
    { name: 'twitter:title', content: config.title },
    { name: 'twitter:description', content: config.description }
  ]

  if (config.ogImage) {
    twitterTags.push({ name: 'twitter:image', content: config.ogImage })
  }

  twitterTags.forEach(tag => {
    let metaTag = document.querySelector(`meta[name="${tag.name}"]`)
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute('name', tag.name)
      document.head.appendChild(metaTag)
    }
    metaTag.setAttribute('content', tag.content)
  })

  // Set canonical URL
  if (config.canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', config.canonical)
  }
}

export const defaultSEO: SEOConfig = {
  title: 'Naveeg - Build Your Website As Easy as Sending an Email',
  description: 'AI-powered website builder for business owners. Create professional WordPress websites in minutes with no technical skills required.',
  keywords: 'website builder, AI website, WordPress, business website, no-code website',
  ogImage: '/placeholders/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  canonical: 'https://naveeg.com'
}
