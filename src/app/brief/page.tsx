'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, SitemapNode } from '@/stores/useOnboardingStore';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BriefPage() {
  const router = useRouter();
  const { 
    business, 
    seo, 
    sitemap, 
    setBusiness, 
    setSeo, 
    setSitemap, 
    setCurrentStep 
  } = useOnboardingStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data from 10Web response when component mounts
  useEffect(() => {
    const loadSiteData = async () => {
      try {
        // In a real implementation, you would fetch the site data from the database
        // For now, we'll use the data from the store
        if (sitemap.length === 0) {
          // Generate a default sitemap based on business type
          const defaultSitemap = generateDefaultSitemap(business.name, business.type);
          setSitemap(defaultSitemap);
        }
      } catch (err) {
        console.error('Error loading site data:', err);
      }
    };

    loadSiteData();
  }, []);

  const generateDefaultSitemap = (businessName: string, type: string): SitemapNode[] => {
    const basePages = [
      { id: 'home', title: 'Home', kind: 'page' as const },
      { id: 'about', title: 'About Us', kind: 'page' as const },
      { id: 'contact', title: 'Contact', kind: 'page' as const }
    ];

    if (type === 'ecommerce') {
      return [
        ...basePages,
        { id: 'products', title: 'Products', kind: 'category' as const, children: [
          { id: 'product-1', title: 'Featured Product', kind: 'page' as const },
          { id: 'product-2', title: 'New Arrivals', kind: 'page' as const }
        ]},
        { id: 'services', title: 'Services', kind: 'category' as const, children: [
          { id: 'service-1', title: 'Consultation', kind: 'page' as const },
          { id: 'service-2', title: 'Support', kind: 'page' as const }
        ]}
      ];
    }

    return basePages;
  };

  const handleNext = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Save the brief data to the database
      const { error } = await supabase
        .from('sites')
        .update({
          meta: {
            business,
            seo,
            sitemap
          }
        })
        .eq('id', useOnboardingStore.getState().siteId);

      if (error) throw error;

      setCurrentStep(2);
      router.push('/design');
    } catch (err) {
      setError(err.message || 'Failed to save brief. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addPage = (parentId?: string) => {
    const newPage: SitemapNode = {
      id: `page-${Date.now()}`,
      title: 'New Page',
      kind: 'page'
    };

    if (parentId) {
      // Add as child to parent
      const updateSitemap = (nodes: SitemapNode[]): SitemapNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newPage]
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateSitemap(node.children)
            };
          }
          return node;
        });
      };
      setSitemap(updateSitemap(sitemap));
    } else {
      // Add as top-level page
      setSitemap([...sitemap, newPage]);
    }
  };

  const removePage = (pageId: string) => {
    const updateSitemap = (nodes: SitemapNode[]): SitemapNode[] => {
      return nodes.filter(node => {
        if (node.id === pageId) return false;
        if (node.children) {
          return {
            ...node,
            children: updateSitemap(node.children)
          };
        }
        return true;
      });
    };
    setSitemap(updateSitemap(sitemap));
  };

  const updatePageTitle = (pageId: string, title: string) => {
    const updateSitemap = (nodes: SitemapNode[]): SitemapNode[] => {
      return nodes.map(node => {
        if (node.id === pageId) {
          return { ...node, title };
        }
        if (node.children) {
          return {
            ...node,
            children: updateSitemap(node.children)
          };
        }
        return node;
      });
    };
    setSitemap(updateSitemap(sitemap));
  };

  const renderSitemapNode = (node: SitemapNode, level = 0) => (
    <div key={node.id} className={`ml-${level * 4} mb-2`}>
      <div className="flex items-center space-x-2 p-2 bg-white rounded border">
        <span className="text-sm font-medium">{node.title}</span>
        <button
          onClick={() => updatePageTitle(node.id, prompt('Enter new title:', node.title) || node.title)}
          className="text-blue-600 hover:text-blue-800 text-xs"
        >
          Edit
        </button>
        <button
          onClick={() => removePage(node.id)}
          className="text-red-600 hover:text-red-800 text-xs"
        >
          Remove
        </button>
        {node.kind === 'category' && (
          <button
            onClick={() => addPage(node.id)}
            className="text-green-600 hover:text-green-800 text-xs"
          >
            Add Page
          </button>
        )}
      </div>
      {node.children && node.children.map(child => renderSitemapNode(child, level + 1))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Form */}
      <div className="w-1/3 bg-white p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Brief</h1>
          <p className="text-gray-600">Tell us about your business and website</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-orange-500 mx-2"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
          </div>
          <span className="ml-4 text-sm text-gray-600">Site Brief</span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => setBusiness({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type (Choose "ecommerce" for store)
            </label>
            <select
              value={business.type}
              onChange={(e) => setBusiness({ type: e.target.value as 'basic' | 'ecommerce' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="basic">Basic</option>
              <option value="ecommerce">Ecommerce</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              value={business.description}
              onChange={(e) => setBusiness({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Title (For SEO)
            </label>
            <input
              type="text"
              value={seo.title}
              onChange={(e) => setSeo({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Bakery Soft London - Finest Bakery Near Big Ben"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Description (For SEO)
            </label>
            <textarea
              value={seo.description}
              onChange={(e) => setSeo({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Discover the best bakery in London offering..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Keyphrase (FOR SEO)
            </label>
            <input
              type="text"
              value={seo.keyphrase}
              onChange={(e) => setSeo({ keyphrase: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., London bakery near Big Ben"
            />
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full mt-8 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Next Step'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Right Panel - Sitemap */}
      <div className="flex-1 bg-gray-100 p-8">
        <div className="bg-white rounded-lg p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Structure</h3>
          
          <div className="space-y-2">
            {sitemap.map(node => renderSitemapNode(node))}
          </div>

          <button
            onClick={() => addPage()}
            className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            + Add Page (Max 6)
          </button>
        </div>
      </div>
    </div>
  );
}
