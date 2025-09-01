# Naveeg Marketing Site

A production-ready marketing website built with **Next.js 14 (App Router)**, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Font**: Sansation (Google Fonts)
- **Architecture**: Monorepo with Turbo

## 📁 Project Structure

```
naveeg-marketing/
├── apps/
│   └── marketing/           # Next.js 14 marketing app
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # Reusable components
│       │   └── content/     # i18n content
│       ├── public/          # Static assets
│       └── package.json     # Marketing app dependencies
├── package.json             # Root workspace config
├── turbo.json              # Monorepo build system
└── README.md               # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd naveeg-marketing
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (Turbo, etc.)
   npm install
   
   # Install marketing app dependencies
   cd apps/marketing
   npm install
   ```

## 🚀 Development

### Option 1: Monorepo (Recommended)
```bash
# From root directory
npm run dev
```

### Option 2: Direct marketing app
```bash
cd apps/marketing
npm run dev
```

The development server will start on **port 3000**. If port 3000 is busy, it will automatically fallback to port 3001.

**Access your site**: http://localhost:3000

## 🏗️ Build & Deploy

### Build for Production
```bash
# Build all apps
npm run build

# Build only marketing app
cd apps/marketing
npm run build
```

### Start Production Server
```bash
cd apps/marketing
npm run start
```

## 📱 Available Pages

- **Home** (`/`) - Hero, features, pricing teaser, testimonials
- **Features** (`/features`) - Detailed feature descriptions
- **How It Works** (`/how-it-works`) - 3-step process
- **Pricing** (`/pricing`) - Three pricing tiers
- **Gallery** (`/gallery`) - Website examples
- **Blog** (`/blog`) - Blog posts and insights
- **FAQ** (`/faq`) - Frequently asked questions
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form
- **Security** (`/security`) - Security features

## 🎨 Design System

### CSS Variables (Design Tokens)
```css
:root {
  --surface: #ffffff;
  --ink: #0b0d10;
  --muted: #5b6572;
  --border: rgba(14,18,22,.08);
  --shadow: 0 18px 60px rgba(10,12,16,.10);
  --radius: 1.25rem;
  --wash-1: linear-gradient(135deg,#FDFCFB 0%,#F3F7FA 100%);
  --wash-2: linear-gradient(135deg,#F9FAFB 0%,#F0F4F8 100%);
  --band-entry: #A7F3D0;
  --band-grow: #38BDF8;
  --band-custom: #8B5CF6;
  --accent-grad: linear-gradient(135deg,#6366F1 0%,#3B82F6 100%);
}
```

### Utility Classes
- `.container-max` - Max width container with responsive padding
- `.card` - Card component with shadow and border
- `.btn-black` - Primary black button with hover effects

## 🌐 Internationalization

The site supports multiple languages:
- English (EN) - Fully implemented
- Portuguese (PT) - TODO
- French (FR) - TODO
- Spanish (ES) - TODO
- Italian (IT) - TODO

Language files are located in `apps/marketing/src/content/`.

## 🔧 Customization

### Adding New Pages
1. Create a new folder in `apps/marketing/src/app/`
2. Add a `page.tsx` file
3. Update navigation in `Header.tsx`

### Modifying Components
- Header: `apps/marketing/src/components/Header.tsx`
- Footer: `apps/marketing/src/components/Footer.tsx`
- Layout: `apps/marketing/src/app/layout.tsx`

### Styling
- Global styles: `apps/marketing/src/app/globals.css`
- Tailwind config: `apps/marketing/tailwind.config.ts`

## 🚨 Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
cd apps/marketing
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clean build cache
cd apps/marketing
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
cd apps/marketing
npx tsc --noEmit
```

## 📚 Next Steps

1. **Content**: Add real content and images
2. **Analytics**: Integrate Google Analytics or similar
3. **SEO**: Add meta tags and structured data
4. **Performance**: Optimize images and implement caching
5. **Testing**: Add unit and integration tests
6. **CI/CD**: Set up automated deployment pipeline

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Submit a pull request

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ by the Naveeg Team**
