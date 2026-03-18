import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSignUp = async () => {
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Bitte alle Felder ausfüllen');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Bitte eine gültige E-Mail-Adresse eingeben');
      return;
    }
    if (password.length < 8) {
      setLocalError('Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwörter stimmen nicht überein');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signUp(email, password);
    // After signUp, auth state change will trigger → redirect to username picker
  };

  const displayError = localError ?? error;

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-accent text-base">← Zurück</Text>
        </Pressable>

        <Text className="text-primary text-3xl font-bold mb-2">Konto erstellen</Text>
        <Text className="text-muted text-sm mb-10">
          Kostenlos starten – keine Kreditkarte nötig.
        </Text>

        <TextInput
          className="bg-surface text-primary rounded-xl px-4 py-4 mb-3"
          placeholder="E-Mail"
          placeholderTextColor="#A0A0B0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          className="bg-surface text-primary rounded-xl px-4 py-4 mb-3"
          placeholder="Passwort (min. 8 Zeichen)"
          placeholderTextColor="#A0A0B0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <TextInput
          className="bg-surface text-primary rounded-xl px-4 py-4 mb-6"
          placeholder="Passwort wiederholen"
          placeholderTextColor="#A0A0B0"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {displayError && (
          <Text className="text-accent text-sm text-center mb-4">{displayError}</Text>
        )}

        <Pressable
          onPress={handleSignUp}
          disabled={isLoading}
          className="bg-accent rounded-xl py-4 items-center active:opacity-80 disabled:opacity-40"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-primary font-bold">Registrieren</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
