// src/routes/home.tsx (one-paste replacement)
// Uses your tokens from index.css (cards, btn, badge, container, section alternation, wave dividers)
// No extra deps. Internal links use plain <a> to avoid router imports.

import React from "react";

export default function Home() {
  return (
    <main>

      {/* HERO */}
      <div className="relative isolate overflow-hidden">
        {/* radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,hsl(var(--primary)/.12),transparent_60%)]" />
        {/* grid */}
        <div className="pointer-events-none absolute inset-0 [background:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:40px_40px] mix-blend-soft-light dark:opacity-40" />
        {/* grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%223%22 height=%223%22><rect width=%223%22 height=%223%22 fill=%22%23fff%22/></svg>')",
          }}
        />

        <section className="container py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm badge">
            🇪🇺 EU-based • GDPR compliant
          </div>
          <h1 className="mt-5 max-w-[18ch] leading-tight">
            Launch a modern website in minutes. Host in Europe. Own your data.
          </h1>
          <p className="mt-4 max-w-[55ch] text-muted-foreground">
            Describe your business, let AI build, then refine with a drag-and-drop editor.
            Fast, secure, and privacy-first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/describe" className="btn btn-primary">Generate my site</a>
            <a href="#pricing" className="btn btn-outline">See pricing</a>
          </div>
          <ul className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <BoltIcon className="h-4 w-4 text-primary" /> 90+ PageSpeed
            </li>
            <li className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-primary" /> Free SSL
            </li>
            <li className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-primary" /> EU hosting
            </li>
          </ul>
        </section>

        {/* angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 [mask-image:linear-gradient(to_bottom,transparent,black)] bg-[hsl(var(--background))]" />
      </div>

      {/* HOW IT WORKS */}
      <section className="bg-[hsl(var(--secondary))] py-16 md:py-20">
        <div className="container">
          <h2>How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="card p-6">
              <span className="badge">Step 1</span>
              <h3 className="mt-3">Describe</h3>
              <p className="text-muted-foreground">
                Tell us your brand, services, and style.
              </p>
            </div>
            <div className="card p-6">
              <span className="badge">Step 2</span>
              <h3 className="mt-3">Customize</h3>
              <p className="text-muted-foreground">
                Edit with our drag-and-drop editor or AI Copilot.
              </p>
            </div>
            <div className="card p-6">
              <span className="badge">Step 3</span>
              <h3 className="mt-3">Publish</h3>
              <p className="text-muted-foreground">
                EU hosting, free SSL, instant domain setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <WaveUp />

      {/* FEATURE GRID */}
      <section className="py-20">
        <div className="container">
          <h2>Everything you need to launch</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <FeatureCard title="EU hosting" desc="Data stored in the EEA with DPA on request." />
            <FeatureCard title="GDPR toolkit" desc="Cookie banner, consent logs, and data export." />
            <FeatureCard title="90+ speed" desc="Image and CDN optimization out of the box." />
            <FeatureCard title="SEO ready" desc="Sitemaps, meta, schema, redirects." />
            <FeatureCard title="WooCommerce" desc="Sell products with secure checkout." />
            <FeatureCard title="Backups & SSL" desc="Daily backups, free SSL, DDoS protection." />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[hsl(var(--secondary))] py-20">
        <div className="container">
          <h2>Loved by small businesses</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="From brief to live site in one afternoon."
              author="Claire, Bakery Owner — Lille"
            />
            <Testimonial
              quote="The editor is simple. The site is fast."
              author="Marco, Plumber — Milano"
            />
            <Testimonial
              quote="EU hosting and GDPR solved for us."
              author="Ana, Yoga Studio — Porto"
            />
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <WaveDown />

      {/* PRICING */}
      <section id="pricing" className="py-20">
        <div className="container">
          <h2 className="text-center">Simple pricing</h2>
          <p className="mt-2 text-center text-muted-foreground">
            EU hosting, SSL, and GDPR tools included.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {/* Starter */}
            <div className="card p-6 flex flex-col">
              <h3>Starter</h3>
              <div className="mt-2 text-3xl font-bold">
                €59<span className="text-base font-medium text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>AI website generation</li>
                <li>Drag-and-drop editor</li>
                <li>EU hosting + SSL + CDN</li>
                <li>1 domain (1 year)</li>
                <li>Up to 5 pages</li>
                <li>Basic analytics</li>
                <li>Email support</li>
              </ul>
              <a href="/describe" className="btn btn-primary mt-6">Start with Starter</a>
            </div>

            {/* Growth */}
            <div className="card p-6 border border-primary/30 relative flex flex-col">
              <span className="absolute -top-3 right-4 badge">Most popular</span>
              <h3>Growth</h3>
              <div className="mt-2 text-3xl font-bold">
                €119<span className="text-base font-medium text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Everything in Starter</li>
                <li>Unlimited pages</li>
                <li>Blog</li>
                <li>AI Copilot in editor</li>
                <li>WooCommerce ready</li>
                <li>Advanced SEO</li>
                <li>Priority support</li>
              </ul>
              <a href="/describe" className="btn btn-primary mt-6">Upgrade to Growth</a>
            </div>

            {/* Scale */}
            <div className="card p-6 flex flex-col">
              <h3>Scale</h3>
              <div className="mt-2 text-3xl font-bold">Talk to Sales</div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Multi-site & multi-locale</li>
                <li>Custom integrations & SSO</li>
                <li>Dedicated onboarding</li>
                <li>Performance & security SLA</li>
                <li>Migration assistance</li>
                <li>Custom DPA & contract</li>
              </ul>
              <a href="/contact" className="btn btn-outline mt-6">Book a call</a>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Prices exclude VAT. Cancel anytime. Annual plans save 20%.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[hsl(var(--secondary))] py-20">
        <div className="container">
          <h2>FAQ</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Faq q="Where is my data hosted?" a="In the EEA by default." />
            <Faq q="Is this GDPR compliant?" a="Yes. Cookie consent tools, DPA available, export and deletion on request." />
            <Faq q="Can I use my domain?" a="Yes. Starter includes one domain for a year." />
            <Faq q="Can I leave later?" a="Yes. You can export your content at any time." />
            <Faq q="Do you support e-commerce?" a="Yes. Growth includes WooCommerce setup." />
            <Faq q="Do you offer refunds?" a="Monthly: cancel anytime. Annual: pro-rated according to terms." />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2>Ready to launch?</h2>
          <p className="mt-2 text-muted-foreground">
            Generate a site now and publish when you are ready.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="/describe" className="btn btn-primary">Generate my site</a>
            <a href="/contact" className="btn btn-outline">Talk to sales</a>
          </div>
        </div>
      </section>

    </main>
  );
}

/* ----- Small presentational components (no external libs) ----- */

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-6">
      <h3>{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

function Testimonial({ quote, author }: { quote: string; author: string }) {
  return (
    <figure className="card p-6">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-primary" />
        <Star className="h-4 w-4 text-primary" />
        <Star className="h-4 w-4 text-primary" />
        <Star className="h-4 w-4 text-primary" />
        <Star className="h-4 w-4 text-primary" />
      </div>
      <blockquote className="mt-3 text-lg">
        “{quote}”
      </blockquote>
      <figcaption className="mt-2 text-sm text-muted-foreground">{author}</figcaption>
    </figure>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="card p-6">
      <summary className="cursor-pointer font-semibold">{q}</summary>
      <p className="mt-2 text-muted-foreground">{a}</p>
    </details>
  );
}

function WaveUp() {
  return (
    <div className="relative h-12">
      <svg className="absolute -top-6 w-full" viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="hsl(var(--background))" d="M0,64 C240,96 480,0 720,24 C960,48 1200,104 1440,64 L1440,0 L0,0 Z" />
      </svg>
    </div>
  );
}

function WaveDown() {
  return (
    <div className="relative h-12">
      <svg className="absolute top-0 w-full rotate-180" viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="hsl(var(--secondary))" d="M0,64 C240,96 480,0 720,24 C960,48 1200,104 1440,64 L1440,0 L0,0 Z" />
      </svg>
    </div>
  );
}

/* ----- Minimal inline icons (avoid external packages) ----- */

function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6-2a3 3 0 0 1 6 0v2h-6V6Zm6 14H7V10h10v10Z" />
    </svg>
  );
}
function ServerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3V5Zm0 5h18v4H3v-4Zm0 6h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3Zm3-9h2v2H6V7Zm0 6h2v2H6v-2Zm0 6h2v2H6v-2Z" />
    </svg>
  );
}
function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}