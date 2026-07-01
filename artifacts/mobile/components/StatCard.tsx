import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useColors } from '@/hooks/useColors';
import { formatNumber } from '@/utils/formatters';

interface Props {
  title: string;
  amount: number;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  delay?: number;
}

export default function StatCard({ title, amount, color, icon, onPress, delay = 0 }: Props) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Pressable
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
          <Feather name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.title, { color: colors.mutedForeground }]}>{title}</Text>
        <Text
          style={[styles.amount, { color: colors.foreground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatNumber(amount)}
        </Text>

        <Text style={[styles.currency, { color: colors.mutedForeground }]}>DZD</Text>
        <View style={[styles.accent, { backgroundColor: color }]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 14,
    height: 118,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  currency: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.5,
  },
  accent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
