import { memo } from 'react';
import { View, Text } from 'react-native';
import type { ChatMessage } from '@/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

// Minimal markdown: **bold** and bullet lists
function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const isBullet = line.startsWith('- ') || line.startsWith('• ');
    const content = isBullet ? line.slice(2) : line;

    // Bold: **text**
    const parts = content.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? (
        <Text key={j} className="font-bold">
          {part}
        </Text>
      ) : (
        <Text key={j}>{part}</Text>
      ),
    );

    return (
      <Text key={i} className="text-sm leading-5">
        {isBullet ? <Text>{'• '}</Text> : null}
        {rendered}
        {i < lines.length - 1 ? '\n' : ''}
      </Text>
    );
  });
}

export const ChatBubble = memo(function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 px-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-accent rounded-br-sm' : 'bg-surface rounded-bl-sm'
        }`}
      >
        <Text className={isUser ? 'text-black text-sm' : 'text-primary text-sm'}>
          {renderContent(message.content)}
        </Text>
      </View>
      <Text className="text-muted text-xs mt-1 px-1">{formatTime(message.createdAt)}</Text>
    </View>
  );
});
