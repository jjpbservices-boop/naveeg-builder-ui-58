import type { PageMeta, Section } from './types';

export function normalizeSitemap(pages: PageMeta[], minPages = 5, minSections = 5): PageMeta[] {
  const padSection = (i: number): Section => ({
    section_title: `Custom Section ${i+1}`,
    section_description: `User-defined section ${i+1}.`
  });
  
  const padPage = (i: number): PageMeta => ({
    title: `Page ${i+1}`,
    description: `Custom page ${i+1}.`,
    sections: Array.from({ length: minSections }, (_, j) => padSection(j))
  });

  const normalized = pages.map((p) => ({
    ...p,
    sections: [
      ...(p.sections || []),
      ...Array.from({ length: Math.max(0, minSections - (p.sections?.length || 0)) },
        (_, j) => padSection((p.sections?.length || 0) + j)
      )
    ]
  }));

  return [
    ...normalized,
    ...Array.from({ length: Math.max(0, minPages - normalized.length) },
      (_, i) => padPage(normalized.length + i)
    )
  ];
}
