import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/services/supabase';
import { useMatchStore } from '@/stores/match-store';

/**
 * Subscribes to Supabase Realtime for live match changes.
 * - Updates match-store on score change
 * - Triggers haptic pulse when score changes
 * - Re-fetches all live matches when a match transitions to completed
 */
export function useRealtimeMatches() {
  const updateLiveMatch = useMatchStore((s) => s.updateLiveMatch);
  const refresh = useMatchStore((s) => s.refresh);
  // Keep a ref to previous scores to detect changes
  const prevScoresRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const channel = supabase
      .channel('realtime-matches')
      // Live score updates
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches' },
        (payload) => {
          const raw = payload.new as Record<string, unknown>;
          const id = raw.id as string;
          const status = raw.status as string;

          if (status === 'live') {
            const scoreStr = JSON.stringify(raw.score);
            const prevScore = prevScoresRef.current[id];

            if (prevScore !== undefined && prevScore !== scoreStr) {
              // Score actually changed – haptic pulse
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            prevScoresRef.current[id] = scoreStr;
            updateLiveMatch(raw);
          } else if (status === 'completed') {
            // Match finished – clean up ref + full refresh
            delete prevScoresRef.current[id];
            refresh();
          }
        },
      )
      // New match goes live
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: 'status=eq.live' },
        () => {
          refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateLiveMatch, refresh]);
}
