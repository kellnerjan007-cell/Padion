import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { ChatBubble } from '@/components/chat-bubble';
import { SuggestedPrompts } from '@/components/suggested-prompts';
import { MAX_FREE_CHAT_MESSAGES } from '@/utils/constants';
import type { ChatMessage } from '@/types/chat';

export default function CoachScreen() {
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const messages       = useChatStore((s) => s.messages);
  const isTyping       = useChatStore((s) => s.isTyping);
  const dailyCount     = useChatStore((s) => s.dailyCount);
  const error          = useChatStore((s) => s.error);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const sendMessage    = useChatStore((s) => s.sendMessage);
  const startSession   = useChatStore((s) => s.startSession);
  const clearError     = useChatStore((s) => s.clearError);

  const profile   = useAuthStore((s) => s.profile);
  const isPremium = profile?.isPremium ?? false;
  const isAtLimit = !isPremium && dailyCount >= MAX_FREE_CHAT_MESSAGES;

  useEffect(() => {
    if (!currentSessionId) {
      startSession();
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping || isAtLimit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    await sendMessage(text);
  }, [input, isTyping, isAtLimit, sendMessage]);

  const handlePromptSelect = useCallback(
    (prompt: string) => {
      setInput(prompt);
    },
    [],
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    [],
  );

  const isEmpty = messages.length === 0 && !isTyping;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={0}>
        {/* Header */}
        <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-primary text-2xl font-bold">AI Coach</Text>
            <Text className="text-muted text-xs">Dein persönlicher Padel-Assistent</Text>
          </View>
          {!isPremium && (
            <View className="bg-surface px-3 py-1 rounded-full">
              <Text className="text-accent font-bold text-sm">
                {dailyCount}/{MAX_FREE_CHAT_MESSAGES}
              </Text>
            </View>
          )}
        </View>

        {/* Messages */}
        {isEmpty ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-5xl mb-4">🎾</Text>
            <Text className="text-primary font-bold text-lg mb-2 text-center">
              Hallo! Ich bin dein Padel-Coach.
            </Text>
            <Text className="text-muted text-sm text-center">
              Stell mir Fragen über Spieler, Taktik, Turniere oder Technik.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerClassName="pt-4 pb-2"
            showsVerticalScrollIndicator={false}
            windowSize={10}
            maxToRenderPerBatch={10}
            initialNumToRender={20}
            ListFooterComponent={
              isTyping ? (
                <View className="flex-row items-center gap-2 px-4 mb-3">
                  <View className="bg-surface rounded-2xl px-4 py-3 rounded-bl-sm">
                    <ActivityIndicator size="small" color="#E94560" />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Daily limit banner */}
        {isAtLimit && (
          <View className="mx-4 mb-2 bg-surface border border-accent rounded-xl p-3">
            <Text className="text-accent font-bold text-sm">Tageslimit erreicht 🔒</Text>
            <Text className="text-muted text-xs mt-0.5">
              Upgrade auf Premium für unbegrenzte Coach-Nachrichten.
            </Text>
          </View>
        )}

        {/* Error banner */}
        {error && error !== 'DAILY_LIMIT_REACHED' && (
          <Pressable onPress={clearError} className="mx-4 mb-2 bg-surface rounded-xl p-3">
            <Text className="text-red-400 text-sm">{error} · Tippe zum Schließen</Text>
          </Pressable>
        )}

        {/* Suggested prompts (only when empty) */}
        {isEmpty && <SuggestedPrompts onSelect={handlePromptSelect} />}

        {/* Input bar */}
        <View className="flex-row items-end px-4 py-3 gap-2 border-t border-surface">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={isAtLimit ? 'Limit erreicht…' : 'Frag deinen Coach…'}
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={500}
            editable={!isAtLimit}
            className="flex-1 bg-surface text-primary rounded-2xl px-4 py-3 text-sm max-h-28"
            style={{ color: '#F2F2F7' }}
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isTyping || isAtLimit}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              input.trim() && !isTyping && !isAtLimit ? 'bg-accent' : 'bg-surface'
            }`}
          >
            <Text className={`text-lg ${input.trim() && !isAtLimit ? 'text-black' : 'text-muted'}`}>
              ↑
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
