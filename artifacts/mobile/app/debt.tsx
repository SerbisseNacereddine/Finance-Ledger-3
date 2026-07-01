import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import OperationItem from '@/components/OperationItem';
import SearchBar from '@/components/SearchBar';
import SegmentedControl from '@/components/SegmentedControl';
import { useOperations } from '@/contexts/OperationsContext';
import { useColors } from '@/hooks/useColors';
import { Operation, TimeFilter } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { filterByTime, filterByType } from '@/utils/filters';

const COLOR = '#F97316';

export default function DebtScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { operations, deleteOperation } = useOperations();
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let ops = filterByType(operations, 'debt');
    ops = filterByTime(ops, filter);
    if (search.trim()) ops = ops.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));
    return ops.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [operations, filter, search]);

  const total = useMemo(() => filtered.reduce((s, o) => s + o.amount, 0), [filtered]);

  const handleEdit = (op: Operation) => router.push({ pathname: '/add-operation', params: { id: op.id } });
  const handleDelete = (id: string) => setDeleteId(id);
  const confirmDelete = async () => {
    if (deleteId) {
      await deleteOperation(deleteId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeleteId(null);
    }
  };

  const webPadTop = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: webPadTop + 12, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Debt</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl value={filter} onChange={setFilter} />

        <View style={[styles.totalCard, { backgroundColor: COLOR + '15' }]}>
          <Text style={[styles.totalLabel, { color: COLOR }]}>Total Debt</Text>
          <Text style={[styles.totalAmount, { color: COLOR }]}>{formatNumber(total)}</Text>
          <Text style={[styles.totalNote, { color: COLOR + 'AA' }]}>Money you owe to others</Text>
        </View>

        <SearchBar value={search} onChange={setSearch} />

        {filtered.length === 0 ? (
          <EmptyState message="No debts found" showButton={false} />
        ) : (
          <View style={[styles.listCard, { backgroundColor: colors.card }]}>
            {filtered.map((op, i) => (
              <View key={op.id}>
                <OperationItem operation={op} onDelete={handleDelete} onEdit={handleEdit} />
                {i < filtered.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={deleteId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { paddingHorizontal: 20, gap: 16 },
  totalCard: { borderRadius: 20, padding: 20, gap: 4, alignItems: 'center' },
  totalLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  totalAmount: { fontSize: 32, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  totalNote: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  listCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});
