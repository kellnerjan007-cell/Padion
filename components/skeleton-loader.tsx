import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  count?: number;
}

function SkeletonCard() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animStyle} className="bg-surface rounded-2xl p-4 mb-3 mx-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 gap-2">
          <View className="h-3 bg-secondary rounded w-3/4" />
          <View className="h-3 bg-secondary rounded w-1/2 mt-3" />
          <View className="h-3 bg-secondary rounded w-3/4" />
          <View className="h-3 bg-secondary rounded w-1/2" />
        </View>
        <View className="w-16 h-10 bg-secondary rounded ml-4" />
      </View>
    </Animated.View>
  );
}

export function SkeletonLoader({ count = 4 }: SkeletonLoaderProps) {
  return (
    <View className="mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
