import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const token = authHeader.replace('Bearer ', '');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    throw new Error(`Authentication error: ${userError.message}`);
  }

  const user = userData.user;
  if (!user?.email) {
    throw new Error('User not authenticated or email not available');
  }

  return user;
}