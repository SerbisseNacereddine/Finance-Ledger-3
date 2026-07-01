import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { TimeFilter } from '@/types';

const OPTIONS: { label: string; value: TimeFilter }[] = [
  { label: 'Today',    value: 'today' },
  { label: 'Month',   value: 'month' },
  { label: 'Year',    value: 'year' },
  { label: 'All Time', value: 'all' },
];

interface Props {
  value: TimeFilter;
  onChange: (v: TimeFilter) => void;
}

export default function SegmentedControl({ value, onChange }: Props) {
  const colors = useColors();
  const scaleAnim = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const handlePress = (v: TimeFilter, i: number) => {
    onChange(v);
    Animated.sequence([
      Animated.timing(scaleAnim[i], { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim[i], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.muted }]}>
      {OPTIONS.map((opt, i) => {
        const active = opt.value === value;
        return (
          <Animated.View
            key={opt.value}
            style={[styles.optionWrap, { transform: [{ scale: scaleAnim[i] }] }]}
          >
            <Pressable
              style={[
                styles.option,
                active && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
              ]}
              onPress={() => handlePress(opt.value, i)}
            >
              <Text
                style={[
                  styles.label,
                  { color: active ? colors.foreground : colors.mutedForeground },
                  active && styles.activeLabel,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  optionWrap: {
    flex: 1,
  },
  option: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  activeLabel: {
    fontFamily: 'Inter_600SemiBold',
  },
});
