'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@naveeg/ui';
import type { TenWebSitemapDraft, SiteBrief, PageMeta, Section } from '@naveeg/lib';

interface DesignEditorProps {
  draft: TenWebSitemapDraft & { brief: SiteBrief; region?: string; slug?: string };
  endpoints: {
    save: string;
    preview: string;
    attach: string;
  };
}

export default function DesignEditor({ draft: initialDraft, endpoints }: DesignEditorProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSave = async () => {
    if (!draft) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(endpoints.save, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: draft.id || draft.website_id,
          colors: draft.colors,
          fonts: draft.fonts,
          pages_meta: draft.pages_meta
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!draft) return;
    
    setIsPreviewing(true);
    try {
      const response = await fetch(endpoints.preview, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: draft.id || draft.website_id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to preview');
      }
      
      const result = await response.json();
      if (result.url) {
        setPreviewUrl(result.url);
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to preview:', error);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSignUp = async () => {
    if (!draft) return;
    
    try {
      const response = await fetch(endpoints.attach, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: draft.id || draft.website_id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to attach');
      }
      
      // Redirect to dashboard
      window.location.href = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/app`;
    } catch (error) {
      console.error('Failed to attach to user:', error);
    }
  };

  const addPage = () => {
    if (!draft) return;
    
    const newPage: PageMeta = {
      title: `Page ${draft.pages_meta.length + 1}`,
      description: `Custom page ${draft.pages_meta.length + 1}`,
      sections: [
        { section_title: 'Hero Section', section_description: 'Main content area' },
        { section_title: 'About Section', section_description: 'Information about this page' }
      ]
    };
    
    setDraft({
      ...draft,
      pages_meta: [...draft.pages_meta, newPage]
    });
  };

  const addSection = (pageIndex: number) => {
    if (!draft) return;
    
    const newSection: Section = {
      section_title: `Section ${draft.pages_meta[pageIndex].sections.length + 1}`,
      section_description: 'Custom section content'
    };
    
    const updatedPages = [...draft.pages_meta];
    updatedPages[pageIndex].sections.push(newSection);
    
    setDraft({
      ...draft,
      pages_meta: updatedPages
    });
  };

  const updatePage = (pageIndex: number, field: keyof PageMeta, value: string) => {
    if (!draft) return;
    
    const updatedPages = [...draft.pages_meta];
    updatedPages[pageIndex] = { ...updatedPages[pageIndex], [field]: value };
    
    setDraft({
      ...draft,
      pages_meta: updatedPages
    });
  };

  const updateSection = (pageIndex: number, sectionIndex: number, field: keyof Section, value: string) => {
    if (!draft) return;
    
    const updatedPages = [...draft.pages_meta];
    updatedPages[pageIndex].sections[sectionIndex] = { 
      ...updatedPages[pageIndex].sections[sectionIndex], 
      [field]: value 
    };
    
    setDraft({
      ...draft,
      pages_meta: updatedPages
    });
  };

  const deletePage = (pageIndex: number) => {
    if (!draft || draft.pages_meta.length <= 5) return; // Enforce minimum 5 pages
    
    const updatedPages = draft.pages_meta.filter((_, index) => index !== pageIndex);
    setDraft({
      ...draft,
      pages_meta: updatedPages
    });
  };

  const deleteSection = (pageIndex: number, sectionIndex: number) => {
    if (!draft || draft.pages_meta[pageIndex].sections.length <= 5) return; // Enforce minimum 5 sections
    
    const updatedPages = [...draft.pages_meta];
    updatedPages[pageIndex].sections = updatedPages[pageIndex].sections.filter((_, index) => index !== sectionIndex);
    
    setDraft({
      ...draft,
      pages_meta: updatedPages
    });
  };

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Design Not Found</h1>
          <p className="text-gray-600">Please start the onboarding process to continue.</p>
          <a href="/start" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Start
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Design Your Website
          </h1>
          <p className="text-xl text-gray-600">
            Customize colors, fonts, and structure. We pre-selected colors based on your business info. If you already have a brand palette, update your Primary and Secondary colors here.
          </p>
          {draft.region && (
            <p className="text-xs text-neutral-500 mt-2">
              Datacenter: Frankfurt ({draft.region})
            </p>
          )}
          {draft.slug && (
            <p className="text-sm text-blue-600 mt-2">
              Your website: <span className="font-mono">{draft.slug}.naveeg.com</span>
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Colors & Fonts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Design</h2>
            
            {/* Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Colors</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={draft.colors?.primary_color || '#3B82F6'}
                    onChange={(e) => setDraft({
                      ...draft,
                      colors: { ...draft.colors, primary_color: e.target.value }
                    })}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={draft.colors?.secondary_color || '#8B5CF6'}
                    onChange={(e) => setDraft({
                      ...draft,
                      colors: { ...draft.colors, secondary_color: e.target.value }
                    })}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Dark</label>
                  <input
                    type="color"
                    value={draft.colors?.background_dark || '#1F2937'}
                    onChange={(e) => setDraft({
                      ...draft,
                      colors: { ...draft.colors, background_dark: e.target.value }
                    })}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Fonts */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fonts</h3>
              <select
                value={draft.fonts?.primary_font || 'Poppins'}
                onChange={(e) => setDraft({
                  ...draft,
                  fonts: { ...draft.fonts, primary_font: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                onClick={handlePreview}
                disabled={isPreviewing}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isPreviewing ? 'Generating Preview...' : 'Preview Website'}
              </button>
              
              <button
                onClick={handleSignUp}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Sign Up & Continue
              </button>
            </div>
          </motion.div>

          {/* Right Panel - Sitemap Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Website Structure</h2>
              <button
                onClick={addPage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Page
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Always render at least 5 suggested pages with 5 sections each. You can add or remove before building.
            </p>

            <div className="space-y-4">
              {draft.pages_meta.map((page, pageIndex) => (
                <div key={pageIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={page.title}
                      onChange={(e) => updatePage(pageIndex, 'title', e.target.value)}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                    />
                    <button
                      onClick={() => deletePage(pageIndex)}
                      disabled={draft.pages_meta.length <= 5}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="trash-2" className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={page.description}
                    onChange={(e) => updatePage(pageIndex, 'description', e.target.value)}
                    placeholder="Page description..."
                    className="w-full text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 mb-3"
                  />
                  
                  <div className="space-y-2">
                    {page.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={section.section_title}
                          onChange={(e) => updateSection(pageIndex, sectionIndex, 'section_title', e.target.value)}
                          className="flex-1 text-sm text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                        />
                        <button
                          onClick={() => deleteSection(pageIndex, sectionIndex)}
                          disabled={page.sections.length <= 5}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon name="x" className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addSection(pageIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
