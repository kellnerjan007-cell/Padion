import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { StatCard } from '@/components/stat-card';
import { useShare } from '@/hooks/use-share';
import { AchievementsGrid } from '@/components/achievement-badge';
import { Toast } from '@/components/toast';
import { supabase } from '@/services/supabase';
import { transformAchievement } from '@/utils/transforms';
import type { Achievement } from '@/types/achievement';

interface UserReward {
  id: string;
  prizeDescription: string;
  periodStart: string;
  claimed: boolean;
}

function flagEmoji(country: string): string {
  if (!country) return '';
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

function accuracyPercent(correct: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((correct / total) * 100)}%`;
}

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const { shareProfile } = useShare();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('achievements')
      .select('*')
      .eq('user_id', profile.id)
      .then(({ data }) => setAchievements((data ?? []).map(transformAchievement)));

    supabase
      .from('user_rewards')
      .select('id, period_start, claimed, reward:rewards(prize_description)')
      .eq('user_id', profile.id)
      .order('period_start', { ascending: false })
      .then(({ data }) =>
        setRewards(
          (data ?? []).map((r: Record<string, unknown>) => ({
            id: r.id as string,
            prizeDescription: (r.reward as Record<string, string>)?.prize_description ?? '',
            periodStart: r.period_start as string,
            claimed: r.claimed as boolean,
          })),
        ),
      );
  }, [profile?.id]);

  const handleSignOut = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Abmelden',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut();
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <Text className="text-muted">Lade Profil…</Text>
      </SafeAreaView>
    );
  }

  const accuracy = accuracyPercent(
    profile.correctPredictionsCount,
    profile.predictionsCount,
  );

  const avatarInitial = (profile.displayName || profile.username || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-2 pb-4 flex-row items-center justify-between">
          <Text className="text-primary text-2xl font-bold">Profil</Text>
          <View className="flex-row items-center gap-2">
            {profile.isPremium && (
              <View className="bg-accent px-3 py-1 rounded-full">
                <Text className="text-black text-xs font-bold">PREMIUM</Text>
              </View>
            )}
            <Pressable
              onPress={() => shareProfile(profile.username, profile.totalPoints)}
              className="bg-surface w-9 h-9 rounded-full items-center justify-center active:opacity-70"
            >
              <Text className="text-base">↗</Text>
            </Pressable>
          </View>
        </View>

        {/* Avatar + Name */}
        <View className="items-center py-6">
          <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-3 border-2 border-accent">
            <Text className="text-4xl font-bold text-accent">{avatarInitial}</Text>
          </View>
          <Text className="text-primary text-xl font-bold">{profile.displayName}</Text>
          <Text className="text-muted text-sm mt-0.5">
            @{profile.username}
            {profile.country ? `  ${flagEmoji(profile.country)}` : ''}
          </Text>
        </View>

        {/* Stats */}
        <View className="px-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Statistiken</Text>
          <View className="flex-row gap-3 mb-3">
            <StatCard label="Punkte" value={profile.totalPoints} highlight />
            <StatCard label="Genauigkeit" value={accuracy} />
            <StatCard label="Serie" value={profile.currentStreak} suffix="🔥" />
          </View>
          <View className="flex-row gap-3">
            <StatCard label="Tipps" value={profile.predictionsCount} />
            <StatCard label="Korrekt" value={profile.correctPredictionsCount} />
            <StatCard label="Besteserie" value={profile.bestStreak} suffix="🏆" />
          </View>
        </View>

        {/* Einstellungen Section */}
        <View className="px-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Konto</Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <Pressable
              onPress={() => router.push('/settings')}
              className="flex-row items-center justify-between px-4 py-4 active:opacity-70 border-b border-background"
            >
              <Text className="text-primary font-semibold">Einstellungen</Text>
              <Text className="text-muted">›</Text>
            </Pressable>

            {!profile.isPremium && (
              <Pressable
                onPress={() => router.push('/paywall')}
                className="flex-row items-center justify-between px-4 py-4 active:opacity-70 border-b border-background"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-accent font-semibold">Premium werden</Text>
                  <View className="bg-accent px-2 py-0.5 rounded">
                    <Text className="text-black text-xs font-bold">NEU</Text>
                  </View>
                </View>
                <Text className="text-muted">›</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center justify-between px-4 py-4 active:opacity-70"
            >
              <Text className="text-red-400 font-semibold">Abmelden</Text>
              <Text className="text-muted">›</Text>
            </Pressable>
          </View>
        </View>

        {/* Achievements */}
        <View className="px-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">
            Auszeichnungen ({achievements.length}/{8})
          </Text>
          <AchievementsGrid earned={achievements} />
        </View>

        {/* Rewards */}
        {rewards.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-muted text-xs uppercase tracking-widest mb-3">
              Gewonnene Preise 🎁
            </Text>
            <View className="bg-surface rounded-2xl overflow-hidden">
              {rewards.map((r, i) => (
                <View
                  key={r.id}
                  className={`flex-row items-center px-4 py-3 ${
                    i < rewards.length - 1 ? 'border-b border-background' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-primary font-semibold text-sm">{r.prizeDescription}</Text>
                    <Text className="text-muted text-xs mt-0.5">
                      {new Date(r.periodStart).toLocaleDateString('de-CH', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full ${r.claimed ? 'bg-secondary' : 'bg-accent'}`}>
                    <Text className={`text-xs font-bold ${r.claimed ? 'text-muted' : 'text-black'}`}>
                      {r.claimed ? 'Eingelöst' : 'Neu!'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* App info */}
        <Text className="text-center text-muted text-xs">Padion v1.0.0</Text>
      </ScrollView>

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
