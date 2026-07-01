import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BalanceCard from '@/components/BalanceCard';
import EmptyState from '@/components/EmptyState';
import OperationItem from '@/components/OperationItem';
import SearchBar from '@/components/SearchBar';
import SegmentedControl from '@/components/SegmentedControl';
import StatCard from '@/components/StatCard';
import { useOperations } from '@/contexts/OperationsContext';
import { useColors } from '@/hooks/useColors';
import { Operation, TimeFilter } from '@/types';
import { computeTotals, filterByTime } from '@/utils/filters';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { operations } = useOperations();
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => filterByTime(operations, filter), [operations, filter]);
  const totals = useMemo(() => computeTotals(filtered), [filtered]);
  const allTotals = useMemo(() => computeTotals(operations), [operations]);

  const recent = useMemo(() => {
    let ops = [...operations];
    if (search.trim()) {
      ops = ops.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));
    }
    return ops
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [operations, search]);

  const handleEdit = (op: Operation) => {
    router.push({ pathname: '/add-operation', params: { id: op.id } });
  };

  const webPadTop = Platform.OS === 'web' ? 16 : insets.top;
  const webPadBottom = Platform.OS === 'web' ? 0 : insets.bottom;
  const hasData = totals.income > 0 || totals.expense > 0 || totals.debt > 0 || totals.lent > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: webPadTop + 8, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good day</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>Money Manager</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.card }]}
            onPress={() => router.push('/settings')}
          >
            <Feather name="settings" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={[styles.addIconBtn, { backgroundColor: '#1A237E' }]}
            onPress={() => router.push('/add-operation')}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: webPadBottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <BalanceCard balance={allTotals.balance} />

        <SegmentedControl value={filter} onChange={setFilter} />

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <StatCard
              title="Income"
              amount={totals.income}
              color={colors.income}
              icon="trending-up"
              onPress={() => router.push('/income')}
              delay={0}
            />
            <StatCard
              title="Expense"
              amount={totals.expense}
              color={colors.expense}
              icon="trending-down"
              onPress={() => router.push('/expense')}
              delay={60}
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              title="Debt"
              amount={totals.debt}
              color={colors.debt}
              icon="credit-card"
              onPress={() => router.push('/debt')}
              delay={120}
            />
            <StatCard
              title="Money Lent"
              amount={totals.lent}
              color={colors.lent}
              icon="send"
              onPress={() => router.push('/lent')}
              delay={180}
            />
          </View>
        </View>

        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Operations</Text>
          <Text style={[styles.countBadge, { color: colors.mutedForeground }]}>
            {operations.length} total
          </Text>
        </View>

        <SearchBar value={search} onChange={setSearch} />

        {recent.length === 0 ? (
          <EmptyState
            onAdd={() => router.push('/add-operation')}
            showButton={operations.length === 0}
            message={search ? 'No results found' : 'No operations yet'}
          />
        ) : (
          <View style={[styles.listCard, { backgroundColor: colors.card }]}>
            {recent.map((op, i) => (
              <View key={op.id}>
                <OperationItem
                  operation={op}
                  onEdit={handleEdit}
                />
                {i < recent.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  greeting: { fontSize: 12, fontFamily: 'Inter_400Regular', letterSpacing: 0.3 },
  appName: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, gap: 16 },
  statGrid: { gap: 10 },
  statRow: { flexDirection: 'row', gap: 10 },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  countBadge: { fontSize: 12, fontFamily: 'Inter_400Regular' },
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
