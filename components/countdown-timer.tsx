import { useEffect, useState } from 'react';
import { Text } from 'react-native';

interface CountdownTimerProps {
  scheduledAt: string;
  className?: string;
}

function getTimeLeft(scheduledAt: string): string {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff <= 0) return 'Bald';

  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

export function CountdownTimer({ scheduledAt, className }: CountdownTimerProps) {
  const [label, setLabel] = useState(() => getTimeLeft(scheduledAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setLabel(getTimeLeft(scheduledAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return (
    <Text className={className ?? 'text-muted text-xs'}>
      {label}
    </Text>
  );
}
