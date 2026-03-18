import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MAX_FREE_MESSAGES = 10;
const SYSTEM_PROMPT = `Du bist Padion Coach, ein KI-Padel-Assistent für Padion – eine App für Padel-Fans.

Du kennst die Premier Padel Tour sehr gut: Spieler, Turniere, Regeln, Taktiken, Statistiken.
Du antwortest auf Deutsch (oder der Sprache des Users), bist freundlich, präzise und kennst dich mit Padel bestens aus.

Deine Spezialgebiete:
- Premier Padel Spieler & Rankings (Lebrón, Galán, Coello, Tapia, etc.)
- Padel-Regeln, Schläge (Bandeja, Vibora, Lob, Smash), Taktik
- Turnieranalysen, Match-Vorschauen und -Nachberichte
- Trainingstipps für Padel-Spieler aller Niveaus

Halte Antworten kurz und klar. Nutze Markdown (Fett, Listen) für Struktur.`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Verify JWT and get user
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let sessionId: string;
  let message: string;
  try {
    const body = await req.json();
    sessionId = body.session_id;
    message = body.message;
    if (!sessionId || !message?.trim()) throw new Error('session_id and message required');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  // Check daily limit for free users
  const today = new Date().toISOString().split('T')[0];
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, daily_chat_count, daily_chat_reset_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
  }

  // Reset daily count if new day
  if (profile.daily_chat_reset_at !== today) {
    await supabase
      .from('profiles')
      .update({ daily_chat_count: 0, daily_chat_reset_at: today })
      .eq('id', user.id);
    profile.daily_chat_count = 0;
  }

  if (!profile.is_premium && profile.daily_chat_count >= MAX_FREE_MESSAGES) {
    return new Response(
      JSON.stringify({ error: 'DAILY_LIMIT_REACHED', limit: MAX_FREE_MESSAGES }),
      { status: 429 },
    );
  }

  // Load last 20 messages for context
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20);

  const messages = [
    ...(history ?? []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // Save user message
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    role: 'user',
    content: message,
  });

  // Call Claude API
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), { status: 500 });
  }

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!claudeRes.ok) {
    const err = await claudeRes.text();
    return new Response(JSON.stringify({ error: err }), { status: 502 });
  }

  const claudeData = await claudeRes.json();
  const reply: string = claudeData.content?.[0]?.text ?? '';
  const tokensUsed: number = claudeData.usage?.output_tokens ?? 0;

  // Save assistant response
  const { data: savedMsg } = await supabase
    .from('chat_messages')
    .insert({ session_id: sessionId, role: 'assistant', content: reply, tokens_used: tokensUsed })
    .select()
    .single();

  // Increment daily chat count
  await supabase
    .from('profiles')
    .update({ daily_chat_count: profile.daily_chat_count + 1 })
    .eq('id', user.id);

  return new Response(
    JSON.stringify({ message: savedMsg, daily_count: profile.daily_chat_count + 1 }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
});
