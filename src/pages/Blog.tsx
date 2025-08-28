import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';

const Blog: React.FC = () => {
  const { t } = useTranslation('blog');
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'website', 'seo', 'business', 'legal'];
  const articles = t('articles', { returnObjects: true }) as any[];
  
  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeCategory);

  const featuredArticles = articles.filter(article => article.featured);

  const handleStartTrial = () => {
    navigate({ to: '/onboarding/brief' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-sansation text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Featured Articles */}
        <section className="mb-16">
          <h2 className="font-sansation text-2xl font-bold text-foreground mb-8">
            {t('featured.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <article key={article.id} className="bg-card rounded-2xl border shadow-soft overflow-hidden hover:shadow-elegant transition-all duration-300 group">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-foreground">
                      {t(`categories.${article.category}`)}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-sansation text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime}
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="rounded-full"
            >
              {t(`categories.${category}`)}
            </Button>
          ))}
        </div>

        {/* All Articles Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredArticles.map((article) => (
              <article key={article.id} className="bg-card rounded-2xl border shadow-soft p-6 hover:shadow-elegant transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="shrink-0">
                    {t(`categories.${article.category}`)}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </div>
                </div>
                <h3 className="font-sansation text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {article.excerpt}
                </p>
                <Button variant="ghost" size="xs" className="font-medium group-hover:text-primary">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="font-sansation text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleStartTrial}
            className="bg-white text-primary hover:bg-white/90 font-semibold"
          >
            {t('cta.button')}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Blog;