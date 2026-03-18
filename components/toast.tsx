import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(2200, withTiming(0, { duration: 300 }, (finished) => {
          if (finished) runOnJS(onHide)();
        })),
      );
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute bottom-24 left-6 right-6 bg-surface border border-accent rounded-2xl px-4 py-3 flex-row items-center gap-3 shadow-lg"
    >
      <Text className="text-2xl">🏆</Text>
      <Text className="text-primary font-semibold flex-1 text-sm">{message}</Text>
    </Animated.View>
  );
}
