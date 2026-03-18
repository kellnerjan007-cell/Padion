import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const body = await req.json().catch(() => ({}));
  const periodType: 'monthly' | 'seasonal' = body.period_type ?? 'monthly';

  // Period start: 1st of current month or Jan 1 of current year
  const periodStart = periodType === 'monthly'
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    : `${now.getFullYear()}-01-01`;

  // Fetch all reward tiers for this period type
  const { data: rewards, error: rewardErr } = await supabase
    .from('rewards')
    .select('*')
    .eq('period_type', periodType);

  if (rewardErr || !rewards?.length) {
    return new Response(JSON.stringify({ error: 'No rewards configured' }), { status: 404 });
  }

  // Fetch leaderboard for this period (premium users only for prizes)
  const leaderboardPeriod = periodType === 'monthly' ? 'monthly' : 'seasonal';
  const { data: entries, error: lbErr } = await supabase
    .from('leaderboard_entries')
    .select('user_id, rank, total_points')
    .eq('period', leaderboardPeriod)
    .eq('period_start', periodStart)
    .order('rank', { ascending: true });

  if (lbErr || !entries?.length) {
    return new Response(JSON.stringify({ error: 'No leaderboard entries' }), { status: 404 });
  }

  // Only award premium users
  const { data: premiumUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_premium', true);

  const premiumIds = new Set((premiumUsers ?? []).map((p: { id: string }) => p.id));

  const distributed: Array<{ userId: string; rewardId: string; rank: number }> = [];

  for (const entry of entries) {
    if (!premiumIds.has(entry.user_id)) continue;
    if (!entry.rank) continue;

    // Find matching reward tier
    const reward = rewards.find(
      (r: { rank_min: number; rank_max: number }) =>
        entry.rank >= r.rank_min && entry.rank <= r.rank_max,
    );
    if (!reward) continue;

    // Check not already awarded
    const { data: existing } = await supabase
      .from('user_rewards')
      .select('id')
      .eq('user_id', entry.user_id)
      .eq('reward_id', reward.id)
      .eq('period_start', periodStart)
      .maybeSingle();

    if (existing) continue;

    // Insert reward
    await supabase.from('user_rewards').insert({
      user_id: entry.user_id,
      reward_id: reward.id,
      period_start: periodStart,
    });

    // Send push notification
    await supabase.functions.invoke('send-push', {
      body: {
        user_id: entry.user_id,
        title: '🎁 Du hast einen Preis gewonnen!',
        body: `Platz ${entry.rank}: ${reward.prize_description}`,
        data: { type: 'reward', reward_id: reward.id },
      },
    });

    distributed.push({ userId: entry.user_id, rewardId: reward.id, rank: entry.rank });
  }

  return new Response(
    JSON.stringify({ distributed: distributed.length, winners: distributed }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
});
