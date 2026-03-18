import { useCallback, useRef, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePredictionStore } from '@/stores/prediction-store';
import type { Match } from '@/types/match';

const SCORE_OPTIONS = ['2:0', '2:1', '1:2', '0:2'];

interface PredictionSheetProps {
  match: Match | null;
  onClose: () => void;
}

function flagEmoji(country: string): string {
  const code = country.toUpperCase().slice(0, 2);
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
}

export function PredictionSheet({ match, onClose }: PredictionSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%'], []);

  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [selectedScore, setSelectedScore] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const createPrediction = usePredictionStore((s) => s.createPrediction);

  const successScale = useSharedValue(1);
  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const handleTeamSelect = useCallback((team: 1 | 2) => {
    Haptics.selectionAsync();
    setSelectedTeam(team);
  }, []);

  const handleScoreSelect = useCallback((score: string) => {
    Haptics.selectionAsync();
    setSelectedScore((prev) => (prev === score ? null : score));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!match || selectedTeam === null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPrediction({
        matchId: match.id,
        predictedWinnerTeam: selectedTeam,
        predictedScore: selectedScore ?? undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      successScale.value = withSequence(
        withTiming(1.15, { duration: 180 }),
        withTiming(1, { duration: 180 }),
      );

      setTimeout(() => {
        sheetRef.current?.close();
        onClose();
      }, 800);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [match, selectedTeam, selectedScore, isSubmitting, createPrediction, onClose, successScale]);

  const pointsPreview = selectedScore ? 15 : 10;

  if (!match) return null;

  const team1Label = `${match.team1Player1.name} / ${match.team1Player2.name}`;
  const team2Label = `${match.team2Player1.name} / ${match.team2Player2.name}`;
  const flag1 = flagEmoji(match.team1Player1.country);
  const flag2 = flagEmoji(match.team2Player1.country);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#1C1C1E' }}
      handleIndicatorStyle={{ backgroundColor: '#48484A' }}
    >
      <BottomSheetView className="flex-1 px-5 pt-2 pb-8">
        {/* Title */}
        <Text className="text-primary font-bold text-lg mb-1 text-center">Tipp abgeben</Text>
        <Text className="text-muted text-sm mb-5 text-center">
          {match.tournament?.name ?? ''} · {match.round.toUpperCase()}
        </Text>

        {/* Team selection */}
        <Text className="text-muted text-xs uppercase tracking-widest mb-3">Wer gewinnt?</Text>
        <View className="flex-row gap-3 mb-5">
          <Pressable
            onPress={() => handleTeamSelect(1)}
            className={`flex-1 rounded-2xl p-4 items-center border-2 ${
              selectedTeam === 1 ? 'bg-accent border-accent' : 'bg-surface border-transparent'
            }`}
          >
            <Text className="text-2xl mb-1">{flag1}</Text>
            <Text
              className={`font-semibold text-xs text-center ${
                selectedTeam === 1 ? 'text-black' : 'text-primary'
              }`}
              numberOfLines={2}
            >
              {team1Label}
            </Text>
          </Pressable>

          <View className="items-center justify-center">
            <Text className="text-muted font-bold">vs</Text>
          </View>

          <Pressable
            onPress={() => handleTeamSelect(2)}
            className={`flex-1 rounded-2xl p-4 items-center border-2 ${
              selectedTeam === 2 ? 'bg-accent border-accent' : 'bg-surface border-transparent'
            }`}
          >
            <Text className="text-2xl mb-1">{flag2}</Text>
            <Text
              className={`font-semibold text-xs text-center ${
                selectedTeam === 2 ? 'text-black' : 'text-primary'
              }`}
              numberOfLines={2}
            >
              {team2Label}
            </Text>
          </Pressable>
        </View>

        {/* Score picker */}
        <Text className="text-muted text-xs uppercase tracking-widest mb-3">
          Ergebnis (optional, +5 Punkte)
        </Text>
        <View className="flex-row gap-2 mb-5">
          {SCORE_OPTIONS.map((score) => (
            <Pressable
              key={score}
              onPress={() => handleScoreSelect(score)}
              className={`flex-1 py-2 rounded-xl items-center border ${
                selectedScore === score
                  ? 'bg-accent border-accent'
                  : 'bg-surface border-transparent'
              }`}
            >
              <Text
                className={`font-bold text-sm ${
                  selectedScore === score ? 'text-black' : 'text-primary'
                }`}
              >
                {score}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Points preview */}
        <Text className="text-muted text-xs text-center mb-4">
          Bis zu{' '}
          <Text className="text-accent font-bold">+{pointsPreview} Punkte</Text>{' '}
          bei korrektem Tipp
        </Text>

        {/* Confirm button */}
        <Animated.View style={successStyle}>
          <Pressable
            onPress={handleConfirm}
            disabled={selectedTeam === null || isSubmitting}
            className={`rounded-2xl py-4 items-center ${
              success
                ? 'bg-green-500'
                : selectedTeam !== null
                ? 'bg-accent'
                : 'bg-surface opacity-50'
            }`}
          >
            <Text className="text-black font-bold text-base">
              {success ? '✓ Tipp gespeichert!' : isSubmitting ? 'Speichern...' : 'Tipp bestätigen'}
            </Text>
          </Pressable>
        </Animated.View>
      </BottomSheetView>
    </BottomSheet>
  );
}
