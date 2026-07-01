import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useColors } from '@/hooks/useColors';
import { Operation } from '@/types';
import { formatDate, formatNumber } from '@/utils/formatters';

const TYPE_CONFIG = {
  income:  { color: '#22C55E', icon: 'arrow-down-left' as const, label: 'Income',     sign: '+' },
  expense: { color: '#EF4444', icon: 'arrow-up-right' as const,  label: 'Expense',    sign: '−' },
  debt:    { color: '#F97316', icon: 'credit-card' as const,     label: 'Debt',       sign: '+' },
  lent:    { color: '#8B5CF6', icon: 'send' as const,            label: 'Money Lent', sign: '−' },
};

interface Props {
  operation: Operation;
  onDelete?: (id: string) => void;
  onEdit: (op: Operation) => void;
}

export default function OperationItem({ operation, onDelete, onEdit }: Props) {
  const colors = useColors();
  const config = TYPE_CONFIG[operation.type];
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });
    return (
      <Animated.View style={[styles.swipeAction, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.swipeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeableRef.current?.close();
            onDelete?.(operation.id);
          }}
        >
          <Feather name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const inner = (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onEdit(operation)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: config.color + '18' }]}>
        <Feather name={config.icon} size={18} color={config.color} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {operation.title}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(operation.date)}
        </Text>
      </View>

      <Text style={[styles.amount, { color: config.color }]} numberOfLines={1}>
        {config.sign} {formatNumber(operation.amount)}
      </Text>
    </TouchableOpacity>
  );

  if (!onDelete) return inner;

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      {inner}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flexShrink: 1,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    flexShrink: 0,
    textAlign: 'right',
  },
  swipeAction: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
