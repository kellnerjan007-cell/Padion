import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { pushService } from '@/services/push-service';
import { useAuthStore } from '@/stores/auth-store';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationsEnabled(status === 'granted');
    });
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const token = await pushService.registerForPush();
      setNotificationsEnabled(token !== null);
      if (!token) {
        Alert.alert(
          'Berechtigung erforderlich',
          'Bitte erlaube Benachrichtigungen in den iOS-Einstellungen.',
        );
      }
    } else {
      await pushService.unregister();
      setNotificationsEnabled(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Konto löschen',
      'Dein Konto und alle Daten werden unwiderruflich gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View className="px-4 pt-2 pb-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text className="text-accent text-base">‹ Zurück</Text>
          </Pressable>
          <Text className="text-primary text-lg font-bold ml-4">Einstellungen</Text>
        </View>

        {/* Notifications */}
        <View className="px-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">
            Benachrichtigungen
          </Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-background">
              <View className="flex-1 mr-3">
                <Text className="text-primary font-semibold">Push-Benachrichtigungen</Text>
                <Text className="text-muted text-xs mt-0.5">
                  Live-Scores, Tippergebnisse, Freundeanfragen
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#48484A', true: '#E94560' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-1 mr-3">
                <Text className="text-primary font-semibold">Match-Erinnerungen</Text>
                <Text className="text-muted text-xs mt-0.5">
                  5 Minuten vor Spielbeginn
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#48484A', true: '#E94560' }}
                thumbColor="#FFFFFF"
                disabled={!notificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* Account */}
        <View className="px-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Konto</Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <View className="px-4 py-4 border-b border-background">
              <Text className="text-muted text-xs">Eingeloggt als</Text>
              <Text className="text-primary font-semibold mt-0.5">
                {profile?.username ?? '–'}
              </Text>
            </View>
            <Pressable
              onPress={handleDeleteAccount}
              className="px-4 py-4 active:opacity-70"
            >
              <Text className="text-red-400 font-semibold">Konto löschen</Text>
            </Pressable>
          </View>
        </View>

        {/* Legal */}
        <View className="px-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Rechtliches</Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <View className="px-4 py-4 border-b border-background">
              <Text className="text-primary font-semibold">Datenschutz</Text>
            </View>
            <View className="px-4 py-4 border-b border-background">
              <Text className="text-primary font-semibold">Nutzungsbedingungen</Text>
            </View>
            <View className="px-4 py-4">
              <Text className="text-primary font-semibold">Impressum</Text>
            </View>
          </View>
        </View>

        {/* Version */}
        <Text className="text-center text-muted text-xs">Padion v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
