# Security Guidelines

## Content Security Policy (CSP)

Implement the following CSP headers in your deployment:

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.10web.io https://www.googleapis.com;
  frame-src https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

### CSP Implementation by Platform

**Vercel (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.10web.io https://www.googleapis.com; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

**Netlify (_headers):**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.10web.io https://www.googleapis.com; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
```

## Subresource Integrity (SRI)

When loading external scripts, use SRI hashes for integrity verification:

```html
<!-- Example for future external script additions -->
<script 
  src="https://example.com/script.js" 
  integrity="sha384-hash-here" 
  crossorigin="anonymous">
</script>
```

### Generating SRI Hashes

```bash
# For remote resources
curl -s https://example.com/script.js | openssl dgst -sha384 -binary | openssl base64 -A

# For local files
openssl dgst -sha384 -binary script.js | openssl base64 -A
```

## Additional Security Headers

Implement these security headers in your deployment:

```http
# Prevent clickjacking
X-Frame-Options: DENY

# Enable XSS protection
X-XSS-Protection: 1; mode=block

# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Referrer policy
Referrer-Policy: strict-origin-when-cross-origin

# Permissions policy
Permissions-Policy: geolocation=(), microphone=(), camera=()

# Strict transport security (HTTPS only)
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Environment Variable Security

### Classification
- **PUBLIC**: Can be exposed to client-side code (prefixed with `VITE_`)
- **PRIVATE**: Server-side only, never expose to client
- **SECRET**: High-sensitivity, rotate regularly

### Examples
```bash
# PUBLIC - OK to expose
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=public_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PRIVATE - Server-side only
SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
STRIPE_SECRET_KEY=sk_test_...
TENWEB_API_KEY=api_key_here

# SECRET - High-sensitivity
STRIPE_WEBHOOK_SECRET=whsec_...
PSI_API_KEY=google_api_key_here
```

### Best Practices
1. **Never commit secrets to Git**
2. **Rotate secrets quarterly**
3. **Use different keys for staging/production**
4. **Monitor for key leakage** (GitHub secret scanning, etc.)
5. **Principle of least privilege** for API keys

## Authentication Security

### Supabase Auth Configuration
```sql
-- Row Level Security policies
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own websites" ON websites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only modify own websites" ON websites
FOR UPDATE USING (auth.uid() = user_id);
```

### JWT Security
- Automatic token refresh enabled
- Secure storage in httpOnly cookies (handled by Supabase)
- Short-lived access tokens (1 hour default)
- Refresh token rotation

## API Security

### Edge Function Security
```typescript
// Input validation with Zod
const InputSchema = z.object({
  field: z.string().min(1).max(100),
});

// Rate limiting (implemented via Supabase)
// Authentication middleware
// CORS validation
```

### External API Security
1. **API Key Rotation**: Regular rotation schedule
2. **Request Signing**: Where supported (Stripe webhooks)
3. **IP Restrictions**: When available
4. **Monitoring**: Log all external API calls

## Data Protection

### Encryption
- **In Transit**: TLS 1.3 for all connections
- **At Rest**: AES-256 encryption (Supabase default)
- **Client-side**: Sensitive form data encrypted before transmission

### Data Minimization
- Collect only necessary user data
- Automatic data retention policies
- User data export/deletion capabilities

### PII Handling
- Email addresses encrypted in logs
- IP addresses anonymized for analytics
- Payment data handled by Stripe (PCI DSS compliant)

## Vulnerability Management

### Dependencies
```bash
# Regular security audits
npm audit
npm audit fix

# Automated dependency updates
npm install -g npm-check-updates
ncu -u
```

### Code Security
- ESLint security rules enabled
- Dependabot for dependency updates
- SAST scanning in CI/CD
- Regular penetration testing

### Incident Response
1. **Detection**: Monitoring and alerting
2. **Assessment**: Severity classification
3. **Containment**: Immediate response procedures
4. **Eradication**: Fix and patch
5. **Recovery**: Service restoration
6. **Lessons Learned**: Post-incident review

## Compliance

### GDPR Compliance
- User consent mechanisms
- Data portability (export functionality)
- Right to deletion
- Privacy by design

### PCI DSS
- Stripe handles card data processing
- No card data stored in application
- Secure payment form implementation

## Monitoring and Alerting

### Security Events to Monitor
- Failed authentication attempts
- Unusual API usage patterns
- Database access anomalies
- Edge function errors
- Payment fraud indicators

### Alerting Thresholds
- 10+ failed logins in 5 minutes
- API error rate > 5%
- Unusual geographic access patterns
- Payment failures > 10%

## Regular Security Tasks

### Weekly
- Review error logs for security events
- Check for failed login attempts
- Monitor API usage patterns

### Monthly
- Update dependencies
- Review access logs
- Test backup restoration
- Security metrics review

### Quarterly
- Rotate API keys
- Security training for team
- Penetration testing
- Compliance audit

### Annually
- Full security architecture review
- Threat modeling update
- Disaster recovery testing
- Third-party security assessments