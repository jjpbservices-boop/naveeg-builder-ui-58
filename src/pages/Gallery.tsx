import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye } from 'lucide-react';

const Gallery: React.FC = () => {
  const { t } = useTranslation('gallery');
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = ['all', 'restaurant', 'services', 'retail', 'portfolio', 'blog', 'ecommerce'];
  
  const sites = Array.from({ length: 12 }, (_, i) => {
    const siteData = t(`sites.${i}`, { returnObjects: true }) as any;
    return {
      id: i,
      name: siteData?.name || `Website ${i + 1}`,
      category: siteData?.category || filters[Math.floor(Math.random() * (filters.length - 1)) + 1],
      description: siteData?.description || 'A beautiful website built with Naveeg',
    };
  });

  const filteredSites = activeFilter === 'all' 
    ? sites 
    : sites.filter(site => site.category === activeFilter);

  const handleViewDemo = (siteId: number) => {
    navigate({ to: '/preview' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-sansation text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`touch-target ${
                activeFilter === filter 
                  ? 'bg-gradient-primary hover:bg-primary-hover text-white' 
                  : ''
              }`}
            >
              {t(`filter.${filter}`)}
            </Button>
          ))}
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="group bg-card rounded-2xl border shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
            >
              {/* Preview Image */}
              <div className="aspect-video bg-gradient-soft relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground text-lg font-medium">
                    {site.name}
                  </span>
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDemo(site.id)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('viewDemo')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('visitSite')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-sansation font-semibold text-xl text-foreground">
                    {site.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {t(`filter.${site.category}`)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {site.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-white">
            <h2 className="font-sansation text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 touch-target"
              onClick={() => navigate({ to: '/describe' })}
            >
              {t('cta.button')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;