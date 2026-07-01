import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOperations } from '@/contexts/OperationsContext';
import { ThemePreference, useTheme } from '@/contexts/ThemeContext';
import { useColors } from '@/hooks/useColors';

const THEME_OPTIONS: { label: string; value: ThemePreference; icon: keyof typeof Feather.glyphMap }[] = [
  { label: 'Light', value: 'light', icon: 'sun' },
  { label: 'Dark', value: 'dark', icon: 'moon' },
  { label: 'System default', value: 'system', icon: 'smartphone' },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { operations } = useOperations();
  const { preference, setPreference } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const webPadTop = Platform.OS === 'web' ? 16 : insets.top;
  const totalOps = operations.length;

  const currentThemeLabel = THEME_OPTIONS.find((o) => o.value === preference)?.label ?? 'System default';

  const Row = ({
    icon,
    label,
    value,
    onPress,
    danger,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? '#EF444418' : colors.background }]}>
        <Feather name={icon} size={16} color={danger ? '#EF4444' : colors.mutedForeground} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? '#EF4444' : colors.foreground }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
        {onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: webPadTop + 12, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>GENERAL</Text>
          <Row icon="dollar-sign" label="Currency" value="DZD" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row icon="database" label="Total operations" value={String(totalOps)} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>APPEARANCE</Text>
          <Row
            icon="sun"
            label="Theme"
            value={currentThemeLabel}
            onPress={() => setThemeModalVisible(true)}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
          <Row icon="info" label="App name" value="Money Manager" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row icon="code" label="Version" value="1.0.0" />
        </View>
      </ScrollView>

      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setThemeModalVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Choose Theme</Text>
            {THEME_OPTIONS.map((opt, i) => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  styles.sheetRow,
                  i < THEME_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => {
                  setPreference(opt.value);
                  setThemeModalVisible(false);
                }}
              >
                <View style={[styles.sheetIcon, { backgroundColor: colors.background }]}>
                  <Feather name={opt.icon} size={16} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.sheetLabel, { color: colors.foreground }]}>{opt.label}</Text>
                {preference === opt.value && (
                  <Feather name="check" size={18} color="#22C55E" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  content: { paddingHorizontal: 20, gap: 16, paddingTop: 8 },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, marginLeft: 46 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  sheet: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  sheetTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  sheetIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheetLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
});
