import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useShare() {
  const shareProfile = async (username: string, points: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `Ich bin @${username} auf Padion mit ${points} Punkten! 🎾🏆\nLade dir die App herunter: https://padion.app`,
      title: 'Padion – Mein Profil',
    });
  };

  const sharePrediction = async (team1: string, team2: string, winner: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `Mein Tipp für ${team1} vs ${team2}: Sieg für ${winner}! 🎾\nTipp mit auf Padion: https://padion.app`,
      title: 'Padion – Mein Tipp',
    });
  };

  return { shareProfile, sharePrediction };
}
