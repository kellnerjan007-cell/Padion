import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const POINTS_CORRECT_WINNER = 10;
const POINTS_CORRECT_SCORE  = 5;
const POINTS_STREAK_3       = 3;
const POINTS_STREAK_5       = 5;

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let matchId: string;
  try {
    const body = await req.json();
    matchId = body.match_id;
    if (!matchId) throw new Error('match_id required');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  // 1. Fetch the completed match
  const { data: match, error: matchErr } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (matchErr || !match) {
    return new Response(JSON.stringify({ error: 'Match not found' }), { status: 404 });
  }

  if (match.status !== 'completed' || match.winner_team == null) {
    return new Response(JSON.stringify({ error: 'Match not completed yet' }), { status: 400 });
  }

  // 2. Fetch all pending predictions for this match
  const { data: predictions, error: predErr } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)
    .eq('status', 'pending');

  if (predErr) {
    return new Response(JSON.stringify({ error: predErr.message }), { status: 500 });
  }

  if (!predictions || predictions.length === 0) {
    return new Response(JSON.stringify({ evaluated: 0 }), { status: 200 });
  }

  // Parse actual score string from sets: e.g. "2:1" means winner won 2 sets, loser 1
  function actualScoreString(winnerTeam: number, score: { sets: { team1: number; team2: number }[] }): string {
    let winnerSets = 0;
    let loserSets = 0;
    for (const s of score.sets) {
      const w = winnerTeam === 1 ? s.team1 : s.team2;
      const l = winnerTeam === 1 ? s.team2 : s.team1;
      if (w > l) winnerSets++;
      else loserSets++;
    }
    return `${winnerSets}:${loserSets}`;
  }

  const actualScore = actualScoreString(match.winner_team, match.score);
  const results: Array<{ userId: string; points: number; status: string }> = [];

  // 3. Evaluate each prediction
  for (const pred of predictions) {
    const correctWinner = pred.predicted_winner_team === match.winner_team;
    let points = 0;
    let status = 'wrong';

    if (correctWinner) {
      points += POINTS_CORRECT_WINNER;
      status = 'correct';

      if (pred.predicted_score && pred.predicted_score === actualScore) {
        points += POINTS_CORRECT_SCORE;
      }
    } else if (pred.predicted_score && pred.predicted_score === actualScore) {
      // Predicted score right but wrong team — partial
      points += POINTS_CORRECT_SCORE;
      status = 'partial';
    }

    // Update prediction row
    await supabase
      .from('predictions')
      .update({ points_earned: points, status })
      .eq('id', pred.id);

    results.push({ userId: pred.user_id, points, status });
  }

  // 4. Update profile stats per user
  for (const r of results) {
    const isCorrect = r.status === 'correct';

    // Fetch current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points, current_streak, best_streak, correct_predictions_count, predictions_count')
      .eq('id', r.userId)
      .single();

    if (!profile) continue;

    const newStreak = isCorrect ? profile.current_streak + 1 : 0;
    let streakBonus = 0;
    if (isCorrect && newStreak === 3) streakBonus = POINTS_STREAK_3;
    if (isCorrect && newStreak === 5) streakBonus = POINTS_STREAK_5;
    if (isCorrect && newStreak > 5 && newStreak % 5 === 0) streakBonus = POINTS_STREAK_5;

    const totalPoints = profile.total_points + r.points + streakBonus;

    await supabase
      .from('profiles')
      .update({
        total_points: totalPoints,
        current_streak: newStreak,
        best_streak: Math.max(profile.best_streak, newStreak),
        correct_predictions_count: profile.correct_predictions_count + (isCorrect ? 1 : 0),
        predictions_count: profile.predictions_count + 1,
      })
      .eq('id', r.userId);
  }

  // 5. Trigger leaderboard update
  await supabase.functions.invoke('update-leaderboard', {
    body: { match_id: matchId },
  });

  return new Response(
    JSON.stringify({ evaluated: predictions.length, results }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
});
