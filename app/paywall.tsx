import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePurchaseStore } from '@/stores/purchase-store';
import { purchaseService } from '@/services/purchase-service';

type Plan = 'monthly' | 'yearly';

const FEATURES = [
  { icon: '🏆', label: 'Unbegrenzte Tipps',        free: '3/Tag',       premium: '∞' },
  { icon: '🤖', label: 'AI Coach Nachrichten',      free: '10/Tag',      premium: '∞' },
  { icon: '📊', label: 'Weltrangliste',              free: 'Top 10',      premium: 'Komplett' },
  { icon: '🎁', label: 'Monatliche Preise',          free: '✗',           premium: '✓' },
  { icon: '📈', label: 'Detaillierte Spieleranalyse', free: '✗',          premium: '✓' },
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  const offering       = usePurchaseStore((s) => s.offering);
  const isLoading      = usePurchaseStore((s) => s.isLoading);
  const error          = usePurchaseStore((s) => s.error);
  const loadOffering   = usePurchaseStore((s) => s.loadOffering);
  const purchaseMonthly = usePurchaseStore((s) => s.purchaseMonthly);
  const purchaseYearly  = usePurchaseStore((s) => s.purchaseYearly);
  const restorePurchases = usePurchaseStore((s) => s.restorePurchases);
  const clearError     = usePurchaseStore((s) => s.clearError);

  const isConfigured = purchaseService.isConfigured();

  useEffect(() => {
    loadOffering();
  }, []);

  const handlePurchase = async () => {
    if (!isConfigured) {
      Alert.alert(
        'Bald verfügbar 🚀',
        'Das Premium-Abo wird nach dem Launch aktiviert. Bleib dran!',
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedPlan === 'yearly') {
      await purchaseYearly();
    } else {
      await purchaseMonthly();
    }
  };

  const handleRestore = async () => {
    if (!isConfigured) return;
    await restorePurchases();
  };

  const monthly = offering?.monthly;
  const yearly  = offering?.yearly;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        {/* Close */}
        <View className="px-4 pt-2 pb-2 items-end">
          <Pressable onPress={() => router.back()} className="active:opacity-70 p-2">
            <Text className="text-muted text-lg">✕</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View className="items-center px-6 mb-8">
          <Text className="text-5xl mb-3">🏆</Text>
          <Text className="text-primary text-3xl font-bold text-center mb-2">
            Padion Premium
          </Text>
          <Text className="text-muted text-base text-center">
            Werde der beste Padel-Tipper. Unbegrenzt tippen, coachen lassen und gewinnen.
          </Text>
          {!isConfigured && (
            <View className="mt-3 bg-secondary px-4 py-2 rounded-full">
              <Text className="text-accent text-xs font-bold">🚀 Bald verfügbar</Text>
            </View>
          )}
        </View>

        {/* Feature comparison */}
        <View className="mx-4 mb-8">
          <View className="flex-row mb-2 px-2">
            <View className="flex-1" />
            <Text className="text-muted text-xs w-16 text-center">Free</Text>
            <Text className="text-accent text-xs font-bold w-16 text-center">Premium</Text>
          </View>
          <View className="bg-surface rounded-2xl overflow-hidden">
            {FEATURES.map((f, i) => (
              <View
                key={f.label}
                className={`flex-row items-center px-4 py-3 ${
                  i < FEATURES.length - 1 ? 'border-b border-background' : ''
                }`}
              >
                <Text className="text-lg mr-3">{f.icon}</Text>
                <Text className="flex-1 text-primary text-sm">{f.label}</Text>
                <Text className="text-muted text-xs w-16 text-center">{f.free}</Text>
                <Text className="text-accent font-bold text-xs w-16 text-center">{f.premium}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plan selector */}
        <View className="mx-4 mb-6">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Plan wählen</Text>
          <View className="gap-3">
            {/* Yearly */}
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setSelectedPlan('yearly'); }}
              className={`rounded-2xl p-4 border-2 ${
                selectedPlan === 'yearly' ? 'border-accent bg-accent/10' : 'border-surface bg-surface'
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-primary font-bold">Jährlich</Text>
                    <View className="bg-accent px-2 py-0.5 rounded-full">
                      <Text className="text-black text-xs font-bold">
                        {yearly?.savingsPercent ?? 32}% sparen
                      </Text>
                    </View>
                  </View>
                  <Text className="text-muted text-xs">
                    {yearly?.pricePerMonth ?? 'CHF 3.33'}/Mt · 7 Tage gratis testen
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-bold text-lg">
                    {yearly?.price ?? 'CHF 39.90'}
                  </Text>
                  <Text className="text-muted text-xs">pro Jahr</Text>
                </View>
              </View>
              {selectedPlan === 'yearly' && (
                <View className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent items-center justify-center">
                  <Text className="text-black text-xs font-bold">✓</Text>
                </View>
              )}
            </Pressable>

            {/* Monthly */}
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setSelectedPlan('monthly'); }}
              className={`rounded-2xl p-4 border-2 ${
                selectedPlan === 'monthly' ? 'border-accent bg-accent/10' : 'border-surface bg-surface'
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-primary font-bold mb-1">Monatlich</Text>
                  <Text className="text-muted text-xs">Jederzeit kündbar</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-bold text-lg">
                    {monthly?.price ?? 'CHF 4.90'}
                  </Text>
                  <Text className="text-muted text-xs">pro Monat</Text>
                </View>
              </View>
              {selectedPlan === 'monthly' && (
                <View className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent items-center justify-center">
                  <Text className="text-black text-xs font-bold">✓</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Error */}
        {error && (
          <Pressable onPress={clearError} className="mx-4 mb-4 bg-surface rounded-xl p-3">
            <Text className="text-red-400 text-sm">{error}</Text>
          </Pressable>
        )}

        {/* CTA */}
        <View className="px-4 gap-3">
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading}
            className="bg-accent rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-black font-bold text-base">
              {isLoading
                ? 'Wird verarbeitet…'
                : isConfigured
                ? `${selectedPlan === 'yearly' ? '7 Tage gratis · dann ' : ''}${
                    selectedPlan === 'yearly'
                      ? (yearly?.price ?? 'CHF 39.90') + '/Jahr'
                      : (monthly?.price ?? 'CHF 4.90') + '/Mt'
                  }`
                : 'Bald verfügbar 🚀'}
            </Text>
          </Pressable>

          {isConfigured && (
            <Pressable onPress={handleRestore} className="items-center py-2">
              <Text className="text-muted text-sm">Käufe wiederherstellen</Text>
            </Pressable>
          )}

          <Text className="text-muted text-xs text-center px-4">
            Abo verlängert sich automatisch. Jederzeit in den iOS-Einstellungen kündbar.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
