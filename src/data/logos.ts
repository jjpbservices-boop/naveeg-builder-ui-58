export interface CompanyLogo {
  name: string
  logo: string
  href?: string
}

export const companyLogos: CompanyLogo[] = [
  {
    name: "Stripe",
    logo: "/placeholders/stripe-logo.png",
    href: "https://stripe.com"
  },
  {
    name: "Shopify",
    logo: "/placeholders/shopify-logo.png",
    href: "https://shopify.com"
  },
  {
    name: "Notion",
    logo: "/placeholders/notion-logo.png",
    href: "https://notion.so"
  },
  {
    name: "Vercel",
    logo: "/placeholders/vercel-logo.png",
    href: "https://vercel.com"
  },
  {
    name: "Figma",
    logo: "/placeholders/figma-logo.png",
    href: "https://figma.com"
  },
  {
    name: "Linear",
    logo: "/placeholders/linear-logo.png",
    href: "https://linear.app"
  }
]
