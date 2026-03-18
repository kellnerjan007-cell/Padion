import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Profile {
  id: string;
  predictions_count: number;
  correct_predictions_count: number;
  current_streak: number;
  best_streak: number;
}

const ACHIEVEMENT_CHECKS: Array<{
  type: string;
  check: (p: Profile) => boolean;
}> = [
  { type: 'first_prediction',  check: (p) => p.predictions_count >= 1 },
  { type: 'streak_3',          check: (p) => p.best_streak >= 3 },
  { type: 'streak_5',          check: (p) => p.best_streak >= 5 },
  { type: 'streak_10',         check: (p) => p.best_streak >= 10 },
  { type: 'century',           check: (p) => p.predictions_count >= 100 },
  { type: 'sharpshooter',      check: (p) => p.correct_predictions_count >= 50 },
  {
    type: 'perfect_week',
    check: (p) => p.current_streak >= 7,
  },
];

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let userId: string;
  try {
    const body = await req.json();
    userId = body.user_id;
    if (!userId) throw new Error('user_id required');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  // Fetch profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, predictions_count, correct_predictions_count, current_streak, best_streak')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
  }

  // Fetch already earned achievements
  const { data: existing } = await supabase
    .from('achievements')
    .select('achievement_type')
    .eq('user_id', userId);

  const earned = new Set((existing ?? []).map((a: { achievement_type: string }) => a.achievement_type));

  // Check which new achievements were unlocked
  const newAchievements: string[] = [];
  for (const { type, check } of ACHIEVEMENT_CHECKS) {
    if (!earned.has(type) && check(profile as Profile)) {
      newAchievements.push(type);
    }
  }

  if (newAchievements.length === 0) {
    return new Response(JSON.stringify({ new: [] }), { status: 200 });
  }

  // Insert new achievements
  await supabase.from('achievements').insert(
    newAchievements.map((type) => ({ user_id: userId, achievement_type: type })),
  );

  // Send push notification for each new achievement
  for (const type of newAchievements) {
    await supabase.functions.invoke('send-push', {
      body: {
        user_id: userId,
        title: '🏆 Neue Auszeichnung!',
        body: `Du hast "${type.replace(/_/g, ' ')}" freigeschaltet!`,
        data: { type: 'achievement', achievement_type: type },
      },
    });
  }

  return new Response(
    JSON.stringify({ new: newAchievements }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
});
