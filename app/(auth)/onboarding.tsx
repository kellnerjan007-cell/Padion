import { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🎾',
    title: 'Live Scores',
    subtitle: 'Verfolge alle Premier Padel Matches in Echtzeit – Satz für Satz, überall.',
    accent: '#E94560',
  },
  {
    id: '2',
    emoji: '🏆',
    title: 'Predictions',
    subtitle: 'Tippe Match-Ergebnisse, sammle Punkte und steig in der Rangliste auf.',
    accent: '#FFB300',
  },
  {
    id: '3',
    emoji: '🤖',
    title: 'AI Coach',
    subtitle: 'Dein persönlicher Padel-Experte – Technik, Taktik, Spieler-Analysen.',
    accent: '#00C853',
  },
];

function SlideItem({ item, isActive }: { item: Slide; isActive: boolean }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    if (isActive) {
      opacity.value    = withDelay(80, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
      translateY.value = withDelay(80, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
    } else {
      opacity.value    = withTiming(0, { duration: 200 });
      translateY.value = withTiming(30, { duration: 200 });
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View style={animStyle} className="items-center">
        <Text style={{ fontSize: 88 }}>{item.emoji}</Text>
        <Text className="text-primary text-3xl font-bold mt-8 text-center">{item.title}</Text>
        <Text className="text-muted text-base mt-4 text-center leading-6">{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    buttonScale.value = withTiming(0.95, { duration: 80 }, () => {
      buttonScale.value = withTiming(1, { duration: 80 });
    });

    if (isLast) {
      router.replace('/(auth)/login');
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <SlideItem item={item} isActive={index === activeIndex} />
        )}
      />

      {/* Dot indicators */}
      <View className="flex-row justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <Animated.View
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === activeIndex ? 'bg-accent' : 'bg-surface'
            }`}
            style={{ width: i === activeIndex ? 24 : 8 }}
          />
        ))}
      </View>

      {/* CTA */}
      <View className="px-6 pb-12">
        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={handleNext}
            className="bg-accent rounded-2xl py-4 items-center"
          >
            <Text className="text-black text-base font-bold">
              {isLast ? "Los geht's 🎾" : 'Weiter'}
            </Text>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          className="mt-4 items-center"
        >
          <Text className="text-muted text-sm">Überspringen</Text>
        </Pressable>
      </View>
    </View>
  );
}
