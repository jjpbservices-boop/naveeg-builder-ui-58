# Export Guide: Cursor + Vercel + Supabase

This guide provides step-by-step instructions to migrate your Naveeg DMS project to a new development environment using Cursor, Vercel, and Supabase.

## Prerequisites

- [Cursor IDE](https://cursor.sh/) installed
- [Vercel CLI](https://vercel.com/cli) installed
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Node.js 18+ installed
- Git configured

## Step 1: Create New Repository in Cursor

1. Open Cursor IDE
2. Create a new project or clone this repository:
   ```bash
   git clone <your-repository-url>
   cd naveeg-dms
   ```

## Step 2: Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in the environment variables in `.env`:
   ```bash
   # Supabase (get from Supabase dashboard)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # 10Web API (get from 10Web dashboard)
   TENWEB_API_BASE=https://api.10web.io
   TENWEB_API_KEY=your_tenweb_api_key
   
   # Stripe (get from Stripe dashboard)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Google PageSpeed Insights
   PSI_API_KEY=your_google_psi_api_key
   
   # Optional: Sentry for error tracking
   SENTRY_DSN=your_sentry_dsn
   ```

## Step 3: Install Dependencies and Verify Setup

1. Run the post-clone verification:
   ```bash
   chmod +x scripts/post-clone-check.sh
   ./scripts/post-clone-check.sh
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify TypeScript compilation:
   ```bash
   npm run typecheck
   ```

4. Run linting:
   ```bash
   npm run lint
   ```

## Step 4: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Link your local project:
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```

3. Deploy database schema and functions:
   ```bash
   chmod +x scripts/supabase-deploy.sh
   ./scripts/supabase-deploy.sh
   ```

4. Verify health endpoints:
   ```bash
   curl "$(supabase status | grep 'Edge Functions' | awk '{print $3}')/billing/health"
   ```

## Step 5: Stripe Configuration

1. Set up your Stripe account and get API keys
2. Configure webhook endpoint:
   ```bash
   chmod +x scripts/verify-webhooks.sh
   ./scripts/verify-webhooks.sh
   ```

3. In Stripe Dashboard:
   - Go to Webhooks section
   - Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events: `customer.subscription.*`, `invoice.payment_*`
   - Copy webhook secret to `.env`

## Step 6: Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Configure environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from your `.env` file
   - Set build command: `npm run build`
   - Set output directory: `dist`

5. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

## Step 7: Final Verification

1. Test the build locally:
   ```bash
   npm run build
   npm run preview
   ```

2. Run the smoke tests:
   ```bash
   npm run test:e2e
   ```

3. Verify production deployment:
   - Check Vercel deployment logs
   - Test key user flows
   - Verify webhook connectivity
   - Check edge function health endpoints

## Step 8: Post-Deployment Setup

1. **Domain Configuration** (optional):
   - Configure custom domain in Vercel
   - Update CORS settings in edge functions if needed

2. **Monitoring Setup**:
   - Configure Sentry for error tracking
   - Set up Vercel analytics
   - Monitor Supabase metrics

3. **Team Access**:
   - Invite team members to Vercel project
   - Configure Supabase team access
   - Set up appropriate permissions

## Troubleshooting

### Common Issues

**Build Failures:**
- Check TypeScript errors: `npm run typecheck`
- Verify all dependencies: `npm install`
- Check environment variables

**Edge Function Issues:**
- Verify Supabase connection: `supabase status`
- Check function logs: `supabase functions logs`
- Test locally: `supabase functions serve`

**Authentication Problems:**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure JWT configuration

**Payment Issues:**
- Verify Stripe keys and webhook
- Check webhook secret
- Test in Stripe test mode first

### Support Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Project Issues](https://github.com/your-repo/issues)

## Maintenance

### Regular Tasks
- Monitor error rates in Sentry/Vercel
- Review Supabase usage and performance
- Update dependencies monthly
- Review and rotate API keys quarterly

### Backup Strategy
- Database: Automated via Supabase
- Code: Git repository
- Environment variables: Secure document/vault
- Stripe data: Export monthly

## Success Checklist

- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] TypeScript compilation passes
- [ ] Supabase project linked and deployed
- [ ] Edge functions healthy
- [ ] Stripe webhook configured
- [ ] Vercel deployment successful
- [ ] Production site accessible
- [ ] User authentication working
- [ ] Website creation flow working
- [ ] Payment flow working
- [ ] Analytics loading

🎉 **Congratulations!** Your Naveeg DMS is now running on Cursor + Vercel + Supabase!