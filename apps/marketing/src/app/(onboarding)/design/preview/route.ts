import { NextResponse } from 'next/server';
import { previewSite } from '../../actions';

export async function POST(req: Request) {
  try {
    const { draft_id } = await req.json();
    
    if (!draft_id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }
    
    const result = await previewSite(draft_id);
    return NextResponse.json(result ?? { success: true });
  } catch (error) {
    console.error('Preview site error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' }, 
      { status: 500 }
    );
  }
}
