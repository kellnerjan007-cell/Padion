import { ScrollView, Pressable, Text } from 'react-native';

const PROMPTS = [
  'Wer sind die Top 5 der Weltrangliste?',
  'Erkläre die Bandeja',
  'Tipps für mein nächstes Match?',
  'Was ist der Unterschied zwischen Vibora und Bandeja?',
  'Wie funktioniert das Premier Padel Format?',
  'Beste Aufschlag-Strategie?',
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 gap-2 py-2"
    >
      {PROMPTS.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => onSelect(prompt)}
          className="bg-surface border border-secondary px-3 py-2 rounded-xl active:opacity-70"
        >
          <Text className="text-primary text-xs" numberOfLines={1}>
            {prompt}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
