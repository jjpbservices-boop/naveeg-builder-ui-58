import { NextResponse } from 'next/server';
import { attachToUser } from '../../actions';

export async function POST(req: Request) {
  try {
    const { draft_id } = await req.json();
    
    if (!draft_id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }
    
    const result = await attachToUser(draft_id);
    return NextResponse.json(result ?? { success: true });
  } catch (error) {
    console.error('Attach user error:', error);
    return NextResponse.json(
      { error: 'Failed to attach user' }, 
      { status: 500 }
    );
  }
}
