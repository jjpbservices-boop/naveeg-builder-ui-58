import { NextRequest, NextResponse } from 'next/server';
// import { PageSpeedInsightsAPI } from '@naveeg/lib';

export async function POST(request: NextRequest) {
  try {
    const { url, strategy = 'mobile' } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!process.env.PSI_API_KEY) {
      return NextResponse.json(
        { error: 'PageSpeed Insights API key not configured' },
        { status: 500 }
      );
    }

    // TODO: Get site ID from authenticated user
    const siteId = 'mock-site-id';

    // Run PSI audit
    // const psi = new PageSpeedInsightsAPI(process.env.PSI_API_KEY);
    // const result = await psi.runAudit(url, strategy);
    
    // Temporary mock result for testing
    const result = {
      url,
      strategy,
      metrics: {
        performance: 85,
        accessibility: 90,
        bestPractices: 88,
        seo: 92,
        lcp: 2.1,
        cls: 0.05,
        tti: 3.2,
        tbt: 150,
        fcp: 1.8,
      },
      audits: [],
      raw: {},
      timestamp: new Date().toISOString(),
    };

    // TODO: Store result in database
    // await supabase.from('analytics_snapshots').insert({
    //   site_id: siteId,
    //   source: 'psi',
    //   lcp: result.metrics.lcp,
    //   cls: result.metrics.cls,
    //   inp: result.metrics.tti, // Using TTI as INP for now
    //   performance: result.metrics.performance,
    //   pagespeed_raw: result.raw,
    // });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error running PSI audit:', error);
    return NextResponse.json(
      { error: 'Failed to run PageSpeed Insights audit' },
      { status: 500 }
    );
  }
}
