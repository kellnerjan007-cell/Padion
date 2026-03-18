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
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearError();
    await signInWithApple();
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearError();
    await signInWithEmail(email, password);
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-primary text-4xl font-bold text-center mb-2">Padion</Text>
        <Text className="text-muted text-base text-center mb-12">Deine Padel-Welt</Text>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={16}
          style={{ height: 52, marginBottom: 24 }}
          onPress={handleAppleSignIn}
        />

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-surface" />
          <Text className="text-muted text-xs mx-4">oder mit E-Mail</Text>
          <View className="flex-1 h-px bg-surface" />
        </View>

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
          className="bg-surface text-primary rounded-xl px-4 py-4 mb-4"
          placeholder="Passwort"
          placeholderTextColor="#A0A0B0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {error && (
          <Text className="text-accent text-sm text-center mb-4">{error}</Text>
        )}

        <Pressable
          onPress={handleEmailSignIn}
          disabled={isLoading || !email || !password}
          className="bg-secondary rounded-xl py-4 items-center mb-6 active:opacity-80 disabled:opacity-40"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-primary font-semibold">Anmelden</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/signup')} className="items-center">
          <Text className="text-muted text-sm">
            Noch kein Konto?{' '}
            <Text className="text-accent font-semibold">Registrieren</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
