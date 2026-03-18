import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth-service';
import { transformProfile } from '@/utils/transforms';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);

  const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

  const checkUsername = async (value: string) => {
    setUsername(value);
    setIsAvailable(null);
    setError(null);

    if (!USERNAME_REGEX.test(value)) return;

    setIsChecking(true);
    const available = await authService.checkUsernameAvailable(value);
    setIsAvailable(available);
    setIsChecking(false);
  };

  const handleConfirm = async () => {
    if (!session?.user || !username || !displayName || !isAvailable) return;

    if (!USERNAME_REGEX.test(username)) {
      setError('3–20 Zeichen, nur Buchstaben, Zahlen und _');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    try {
      await authService.setUsername(session.user.id, username, displayName);
      const profile = await authService.getProfile(session.user.id);
      if (profile) setProfile(profile);
      router.replace('/(tabs)');
    } catch {
      setError('Fehler beim Speichern. Bitte nochmal versuchen.');
    } finally {
      setIsSaving(false);
    }
  };

  const usernameHint = () => {
    if (!username) return null;
    if (!USERNAME_REGEX.test(username)) {
      return <Text className="text-warning text-xs mt-1">3–20 Zeichen, nur a–z, 0–9 und _</Text>;
    }
    if (isChecking) {
      return <Text className="text-muted text-xs mt-1">Wird geprüft…</Text>;
    }
    if (isAvailable === true) {
      return <Text className="text-success text-xs mt-1">✓ Verfügbar</Text>;
    }
    if (isAvailable === false) {
      return <Text className="text-accent text-xs mt-1">✗ Bereits vergeben</Text>;
    }
    return null;
  };

  const canConfirm = username && displayName && isAvailable === true && !isSaving;

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background px-6 justify-center">
      <Text className="text-primary text-3xl font-bold mb-2">Wähle deinen Namen</Text>
      <Text className="text-muted text-sm mb-10">
        Dein Benutzername ist öffentlich und erscheint in der Rangliste.
      </Text>

      <Text className="text-muted text-xs mb-1 ml-1">Anzeigename</Text>
      <TextInput
        className="bg-surface text-primary rounded-xl px-4 py-4 mb-6"
        placeholder="z.B. Jan Müller"
        placeholderTextColor="#A0A0B0"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      <Text className="text-muted text-xs mb-1 ml-1">Benutzername</Text>
      <TextInput
        className="bg-surface text-primary rounded-xl px-4 py-4"
        placeholder="z.B. janpadel"
        placeholderTextColor="#A0A0B0"
        value={username}
        onChangeText={checkUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {usernameHint()}

      {error && (
        <Text className="text-accent text-sm mt-4">{error}</Text>
      )}

      <Pressable
        onPress={handleConfirm}
        disabled={!canConfirm}
        className="bg-accent rounded-xl py-4 items-center mt-8 active:opacity-80 disabled:opacity-40"
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-primary font-bold">Weiter</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}
