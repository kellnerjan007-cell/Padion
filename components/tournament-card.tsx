import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Tournament } from '@/types/tournament';

interface TournamentCardProps {
  tournament: Tournament;
}

const CATEGORY_COLORS: Record<string, string> = {
  major: 'bg-accent',
  p1: 'bg-secondary',
  p2: 'bg-surface',
};

const CATEGORY_LABELS: Record<string, string> = {
  major: 'MAJOR',
  p1: 'P1',
  p2: 'P2',
};

const STATUS_COLORS: Record<string, string> = {
  live: 'text-accent',
  upcoming: 'text-warning',
  completed: 'text-muted',
};

const STATUS_LABELS: Record<string, string> = {
  live: '● LIVE',
  upcoming: 'Bald',
  completed: 'Abgeschlossen',
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('de-CH', opts)} – ${e.toLocaleDateString('de-CH', opts)}`;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Pressable
      className="bg-surface rounded-2xl p-4 mb-3 mx-4 active:opacity-80"
      onPress={() => router.push(`/tournament/${tournament.id}`)}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-primary font-bold text-base" numberOfLines={1}>
            {tournament.name}
          </Text>
          <Text className="text-muted text-sm mt-1">
            {tournament.location}, {tournament.country}
          </Text>
          <Text className="text-muted text-xs mt-1">
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </Text>
        </View>

        <View className="items-end gap-1">
          <View className={`${CATEGORY_COLORS[tournament.category]} px-2 py-0.5 rounded`}>
            <Text className="text-primary text-xs font-bold">
              {CATEGORY_LABELS[tournament.category]}
            </Text>
          </View>
          <Text className={`text-xs font-semibold ${STATUS_COLORS[tournament.status]}`}>
            {STATUS_LABELS[tournament.status]}
          </Text>
        </View>
      </View>

      {tournament.prizeMoney && (
        <View className="mt-3 pt-3 border-t border-background">
          <Text className="text-muted text-xs">Preisgeld: {tournament.prizeMoney}</Text>
        </View>
      )}
    </Pressable>
  );
}
