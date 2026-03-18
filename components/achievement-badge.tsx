import { View, Text, Pressable } from 'react-native';
import type { Achievement, AchievementType } from '@/types/achievement';

interface AchievementConfig {
  icon: string;
  label: string;
  description: string;
}

const ACHIEVEMENTS: Record<string, AchievementConfig> = {
  first_prediction: { icon: '🎯', label: 'Erster Tipp',      description: 'Ersten Tipp abgegeben' },
  streak_3:         { icon: '🔥', label: 'Dreier-Serie',      description: '3 richtige Tipps in Folge' },
  streak_5:         { icon: '⚡', label: 'Fünfer-Serie',      description: '5 richtige Tipps in Folge' },
  streak_10:        { icon: '💎', label: 'Zehner-Serie',      description: '10 richtige Tipps in Folge' },
  perfect_week:     { icon: '📅', label: 'Perfekte Woche',    description: '7 Tage Streak' },
  tournament_winner:{ icon: '🏆', label: 'Turniergewinner',   description: 'Turnier korrekt vorhergesagt' },
  century:          { icon: '💯', label: 'Jahrhundert',       description: '100 Tipps abgegeben' },
  sharpshooter:     { icon: '🎳', label: 'Scharfschütze',     description: '50 korrekte Tipps' },
};

interface AchievementBadgeProps {
  type: string;
  earned?: boolean;
  earnedAt?: string;
  onPress?: () => void;
}

export function AchievementBadge({ type, earned = false, earnedAt, onPress }: AchievementBadgeProps) {
  const config = ACHIEVEMENTS[type] ?? {
    icon: '⭐',
    label: type.replace(/_/g, ' '),
    description: '',
  };

  return (
    <Pressable
      onPress={onPress}
      className={`items-center p-3 rounded-2xl ${
        earned ? 'bg-surface' : 'bg-surface opacity-40'
      }`}
    >
      <Text className={`text-3xl mb-1 ${earned ? '' : 'grayscale'}`}>{config.icon}</Text>
      <Text
        className={`text-xs font-semibold text-center ${
          earned ? 'text-primary' : 'text-muted'
        }`}
        numberOfLines={2}
      >
        {config.label}
      </Text>
      {earned && earnedAt && (
        <Text className="text-muted text-xs mt-0.5">
          {new Date(earnedAt).toLocaleDateString('de-CH', { day: '2-digit', month: 'short' })}
        </Text>
      )}
    </Pressable>
  );
}

// Grid of all achievements for profile screen
interface AchievementsGridProps {
  earned: Achievement[];
}

const ALL_TYPES = Object.keys(ACHIEVEMENTS);

export function AchievementsGrid({ earned }: AchievementsGridProps) {
  const earnedMap = new Map(earned.map((a) => [a.achievementType, a.earnedAt]));

  return (
    <View className="flex-row flex-wrap gap-3">
      {ALL_TYPES.map((type) => (
        <View key={type} className="w-[22%]">
          <AchievementBadge
            type={type}
            earned={earnedMap.has(type)}
            earnedAt={earnedMap.get(type)}
          />
        </View>
      ))}
    </View>
  );
}
