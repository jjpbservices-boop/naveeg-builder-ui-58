import { Suspense } from 'react';
import { loadDesign } from '../(onboarding)/actions';
import DesignEditor from './DesignEditor';

interface DesignPageProps {
  searchParams: { draft?: string };
}

export default async function DesignPage({ searchParams }: DesignPageProps) {
  const { draft: draft_id } = searchParams;
  
  if (!draft_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Missing Draft ID</h1>
          <p className="text-gray-600">Please start the onboarding process to continue.</p>
          <a 
            href="/start" 
            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Start
          </a>
        </div>
      </div>
    );
  }

  // Load the draft data server-side
  let draft;
  try {
    draft = await loadDesign(draft_id);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Design Not Found</h1>
          <p className="text-gray-600">Could not load your design. Please try again.</p>
          <a href="/start" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Start
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your design...</p>
          </div>
        </div>
      }>
        <DesignEditor
          draft={draft}
          endpoints={{
            save: '/design/save',
            preview: '/design/preview',
            attach: '/design/attach',
          }}
        />
      </Suspense>
    </div>
  );
}
