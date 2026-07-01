import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useCurrency } from '@/contexts/CurrencyContext';
import { formatNumber } from '@/utils/formatters';

interface Props {
  balance: number;
}

function getAmountFontSize(value: number): number {
  const len = formatNumber(Math.abs(value)).replace(/\s/g, '').length;
  if (len <= 6) return 38;
  if (len <= 9) return 30;
  if (len <= 12) return 24;
  return 20;
}

export default function BalanceCard({ balance }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const isNegative = balance < 0;
  const fontSize = getAmountFontSize(balance);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={isNegative ? ['#1A1A2E', '#2D1B69'] : ['#1A237E', '#283593']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <Text style={styles.label}>Current Balance</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DZD</Text>
          </View>
        </View>
        <Text style={[styles.amount, { fontSize }]}>
          {formatNumber(Math.abs(balance))}
        </Text>
        <Text style={styles.currencyLine}>Algerian Dinar (DZD)</Text>
        {isNegative && (
          <Text style={styles.negativeLabel}>Balance is negative</Text>
        )}
        <View style={styles.decorCircle} />
        <View style={styles.decorCircle2} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    paddingBottom: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  amount: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  currencyLine: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  negativeLabel: {
    color: '#FF7675',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  decorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -30,
    top: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    right: 60,
    bottom: -20,
  },
});
