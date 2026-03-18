import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PushPayload {
  user_id?: string;        // send to single user
  user_ids?: string[];     // send to multiple users
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound: 'default';
  priority: 'high';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let payload: PushPayload;
  try {
    payload = await req.json();
    if (!payload.title || !payload.body) throw new Error('title and body required');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  // Collect user IDs to notify
  const userIds: string[] = payload.user_ids ?? (payload.user_id ? [payload.user_id] : []);
  if (userIds.length === 0) {
    return new Response(JSON.stringify({ error: 'No user_id(s) provided' }), { status: 400 });
  }

  // Fetch push tokens from profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('push_token')
    .in('id', userIds)
    .not('push_token', 'is', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const tokens: string[] = (profiles ?? [])
    .map((p: Record<string, unknown>) => p.push_token as string)
    .filter(Boolean);

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no tokens' }), { status: 200 });
  }

  // Send via Expo Push API
  const messages: ExpoMessage[] = tokens.map((token) => ({
    to: token,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    sound: 'default',
    priority: 'high',
  }));

  const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });

  const result = await expoRes.json();

  return new Response(
    JSON.stringify({ sent: tokens.length, result }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
});
