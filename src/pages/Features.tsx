import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Features: React.FC = () => {
  const { t } = useTranslation('features');

  const featureKeys = [
    'aiGeneration', 'mobileFirst', 'seoOptimized', 'fastLoading', 
    'customization', 'analytics', 'security', 'support', 
    'backup', 'domains', 'templates', 'ecommerce'
  ];

  const comparisonFeatures = [
    'AI-powered generation', 'Mobile-first design', 'SEO optimization', 
    'Custom domains', 'SSL certificates', '24/7 support', 
    'E-commerce ready', 'Advanced analytics', 'Automatic backups', 'No coding required'
  ];

  const competitors = ['Naveeg', 'Competitor A', 'Competitor B', 'Competitor C'];
  
  // Mock comparison data - Naveeg has all features, others have some missing
  const comparisonData = comparisonFeatures.map((_, index) => [
    true, // Naveeg always true
    Math.random() > 0.3, // Competitor A
    Math.random() > 0.4, // Competitor B  
    Math.random() > 0.5, // Competitor C
  ]);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-syne text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featureKeys.map((key, index) => (
            <div
              key={key}
              className="p-6 rounded-2xl bg-card border shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-syne font-semibold text-xl text-foreground mb-3">
                {t(`features.${key}.title`)}
              </h3>
              <p className="text-muted-foreground">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('comparison.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('comparison.subtitle')}
            </p>
          </div>

          <div className="bg-card rounded-2xl border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-syne font-semibold text-foreground">
                      Features
                    </th>
                    {competitors.map((competitor, index) => (
                      <th key={competitor} className="text-center p-4 font-syne font-semibold text-foreground">
                        <div className={`${index === 0 ? 'text-primary' : ''}`}>
                          {competitor}
                        </div>
                        {index === 0 && (
                          <div className="text-xs text-primary font-normal mt-1">
                            That's us!
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, featureIndex) => (
                    <tr key={feature} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-4 text-foreground font-medium">
                        {feature}
                      </td>
                      {comparisonData[featureIndex].map((hasFeature, compIndex) => (
                        <td key={compIndex} className="p-4 text-center">
                          {hasFeature ? (
                            <CheckCircle className={`h-5 w-5 mx-auto ${
                              compIndex === 0 ? 'text-primary' : 'text-success'
                            }`} />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-white">
            <h2 className="font-syne text-3xl md:text-4xl font-bold mb-4">
              Ready to experience the difference?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of businesses that chose Naveeg for their online presence
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 touch-target"
            >
              Start Building Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;