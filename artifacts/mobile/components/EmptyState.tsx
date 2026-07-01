import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface Props {
  onAdd?: () => void;
  message?: string;
  showButton?: boolean;
}

export default function EmptyState({
  onAdd,
  message = 'No operations yet',
  showButton = true,
}: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.muted }]}>
        <Feather name="inbox" size={36} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{message}</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Your transactions will appear here
      </Text>
      {showButton && onAdd && (
        <Pressable
          style={[styles.btn, { backgroundColor: '#1A237E' }]}
          onPress={onAdd}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.btnText}>Add First Operation</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
