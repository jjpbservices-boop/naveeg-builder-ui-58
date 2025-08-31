# Naveeg - AI-Powered Website Builder

Build your website as easy as sending an email. Naveeg is an AI-powered website builder designed specifically for business owners with no technical skills required.

## 🚀 Marketing Site

The marketing site has been completely refactored with a premium SaaS design system inspired by Stripe, Vercel, and Shopify. Built with modern React, TypeScript, and Tailwind CSS.

### Features

- **Premium Design System**: Clean, minimal design with generous white space and bold typography
- **Dark Mode Support**: Seamless theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with breakpoint-optimized layouts
- **Performance Optimized**: Lighthouse 90+ scores with optimized images and animations
- **Accessibility First**: WCAG 2.1 AA compliant with proper semantic markup
- **SEO Ready**: Meta tags, Open Graph, and structured data for all pages

### Design Philosophy

- **Minimal & Clean**: Generous white space, grid-driven layouts, bold type scale
- **High Contrast**: Optimized for both light and dark modes with proper contrast ratios
- **Subtle Motion**: 200-300ms transitions with reduced motion support
- **Professional**: Enterprise-grade aesthetics suitable for business applications

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Fonts**: Inter (body) + Sora (display) via @fontsource
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Build Tool**: Vite
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── section.tsx
│   │   ├── feature-item.tsx
│   │   ├── logo-cloud.tsx
│   │   ├── testimonial.tsx
│   │   ├── pricing-table.tsx
│   │   ├── faq.tsx
│   │   ├── code-block.tsx
│   │   ├── cta.tsx
│   │   ├── metric.tsx
│   │   ├── nav-bar.tsx
│   │   └── footer.tsx
│   └── ...           # Other components
├── data/             # Static data files
│   ├── pricing.ts
│   ├── testimonials.ts
│   ├── logos.ts
│   └── changelog.ts
├── lib/              # Utilities and helpers
│   ├── seo.ts        # SEO helper functions
│   └── utils.ts      # General utilities
├── pages/            # Page components
│   ├── Home.tsx      # Landing page
│   ├── Pricing.tsx   # Pricing page
│   └── ...           # Other pages
└── styles/
    └── globals.css   # Global styles and design tokens
```

## 🎨 Design System

### Color Palette

- **Primary**: Indigo (#6366F1) - Main CTAs and primary actions
- **Accent**: Cyan (#06B6D4) - Secondary actions and highlights
- **Background**: Pure white/black with subtle muted tones
- **Text**: High contrast foreground with proper hierarchy

### Typography

- **Display**: Sora (600/700) - Headlines and hero text
- **Body**: Inter (400/500/600) - Body text and UI elements
- **Scale**: Responsive type scale from display-1 to text-sm

### Components

All components follow consistent patterns:
- Proper TypeScript interfaces
- Forwarded refs for accessibility
- Variant-based styling
- Responsive design considerations
- Dark mode support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd naveeg-builder-ui-58
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Building for Production

### Build Command

```bash
npm run build
```

This creates a `dist/` folder with optimized static files ready for deployment.

### Deployment

The build is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 📱 Pages & Sections

### Home Page (`/`)
- Hero section with compelling headline and CTAs
- Social proof with company logos
- Value propositions in feature grid
- How it works with 3-step process
- Deep dive into advanced features
- Customer testimonials
- Integration showcase
- Pricing preview
- Final call-to-action

### Pricing Page (`/pricing`)
- Transparent pricing tiers
- Monthly/annual toggle with savings
- Feature comparison
- FAQ section
- Enterprise CTA

### Additional Pages (Coming Soon)
- Product details (`/product`)
- Solutions by audience (`/solutions`)
- Documentation (`/docs`)
- About company (`/about`)
- Contact form (`/contact`)

## 🎯 Performance Targets

- **Lighthouse Score**: 90+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## ♿ Accessibility

- **WCAG 2.1 AA** compliance
- **4.5:1** minimum contrast ratio
- **Keyboard navigation** support
- **Screen reader** optimization
- **Focus management** and visible focus indicators
- **Reduced motion** support

## 🌙 Dark Mode

The site supports both light and dark modes:
- Automatic system preference detection
- Manual toggle in navigation
- Persistent user preference
- Optimized color schemes for both themes

## 📊 Analytics Ready

The site is prepared for analytics integration:
- Plausible Analytics ready
- Google Analytics 4 compatible
- Custom event tracking hooks
- Performance monitoring setup

## 🔧 Customization

### Design Tokens

All design values are defined in `src/styles/globals.css`:
- Color variables
- Typography scales
- Spacing systems
- Animation durations

### Component Variants

Most components support multiple variants:
- Button: primary, secondary, ghost, outline
- Badge: default, secondary, accent, neutral
- Card: base, clickable, with headers/footers

## 🐛 Troubleshooting

### Common Issues

1. **Font Loading**: Ensure @fontsource packages are installed
2. **Build Errors**: Check TypeScript compilation with `npm run type-check`
3. **Styling Issues**: Verify Tailwind CSS is properly configured
4. **Performance**: Use Lighthouse to identify bottlenecks

### Development Tips

- Use the browser dev tools to inspect component structure
- Check the console for TypeScript errors
- Verify responsive behavior across different screen sizes
- Test dark mode toggle functionality

## 📝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the established patterns
3. Ensure all components have proper TypeScript interfaces
4. Test in both light and dark modes
5. Verify accessibility with keyboard navigation
6. Submit a pull request with clear description

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For questions or support:
- Check the documentation
- Review existing issues
- Contact the development team

---

Built with ❤️ for business owners who want to focus on growth, not technology.
