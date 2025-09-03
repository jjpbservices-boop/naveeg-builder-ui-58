import { NextResponse } from 'next/server';
import { saveDesign } from '../../actions';

export async function POST(req: Request) {
  try {
    const { draft_id, ...payload } = await req.json();
    
    if (!draft_id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }
    
    const result = await saveDesign({ draft_id, ...payload });
    return NextResponse.json(result ?? { success: true });
  } catch (error) {
    console.error('Save design error:', error);
    return NextResponse.json(
      { error: 'Failed to save design' }, 
      { status: 500 }
    );
  }
}
