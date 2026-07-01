import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search operations...' }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.muted }]}>
      <Feather name="search" size={16} color={colors.mutedForeground} />
      <TextInput
        style={[styles.input, { color: colors.foreground, outline: 'none' } as any]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
      />
      {value.length > 0 && (
        <Feather
          name="x"
          size={16}
          color={colors.mutedForeground}
          onPress={() => onChange('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    padding: 0,
    margin: 0,
    outlineWidth: 0,
  } as any,
});
