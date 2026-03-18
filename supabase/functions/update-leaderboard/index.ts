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
  const todayStr = now.toISOString().split('T')[0];

  // Period start dates
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Determine season start (Jan 1 of current year)
  const seasonStartStr = `${now.getFullYear()}-01-01`;
  const alltimeStartStr = '2025-01-01';

  const periods: Array<{ period: string; period_start: string }> = [
    { period: 'weekly',   period_start: weekStartStr },
    { period: 'monthly',  period_start: monthStartStr },
    { period: 'seasonal', period_start: seasonStartStr },
    { period: 'alltime',  period_start: alltimeStartStr },
  ];

  // Fetch all profiles with total_points
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, total_points, current_streak, best_streak, correct_predictions_count, predictions_count');

  if (error || !profiles) {
    return new Response(JSON.stringify({ error: error?.message }), { status: 500 });
  }

  // For each period, upsert leaderboard entries and compute ranks
  for (const { period, period_start } of periods) {
    // Upsert each user's entry
    const upserts = profiles.map((p) => ({
      user_id: p.id,
      period,
      period_start,
      total_points: p.total_points,
      correct_predictions: p.correct_predictions_count,
      total_predictions: p.predictions_count,
      streak: p.current_streak,
      best_streak: p.best_streak,
      updated_at: now.toISOString(),
    }));

    await supabase
      .from('leaderboard_entries')
      .upsert(upserts, { onConflict: 'user_id,period,period_start' });

    // Compute ranks by total_points descending
    const { data: entries } = await supabase
      .from('leaderboard_entries')
      .select('id, total_points')
      .eq('period', period)
      .eq('period_start', period_start)
      .order('total_points', { ascending: false });

    if (entries) {
      const rankUpdates = entries.map((e, i) => ({ id: e.id, rank: i + 1 }));
      for (const u of rankUpdates) {
        await supabase
          .from('leaderboard_entries')
          .update({ rank: u.rank })
          .eq('id', u.id);
      }
    }
  }

  return new Response(
    JSON.stringify({ updated: profiles.length, periods: periods.length }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
});
