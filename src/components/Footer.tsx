import React from 'react'
import { Heart } from 'lucide-react'
import { Footer as FooterComponent, FooterColumn } from '@/components/ui/footer'

export default function Footer() {
  const footerColumns: FooterColumn[] = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Changelog", href: "/changelog" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Docs", href: "/docs" },
        { name: "FAQ", href: "/faq" },
        { name: "Support", href: "/contact" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy", href: "/legal" },
        { name: "Terms", href: "/legal" }
      ]
    }
  ]

  return (
    <FooterComponent
      logo={
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
            alt="Naveeg" 
            className="h-8 w-auto"
          />
          <span className="font-display text-xl font-bold">Naveeg</span>
        </div>
      }
      description="Build your business website as easily as sending an email. No technical skills required."
      columns={footerColumns}
      className="pt-16"
    />
  )
}