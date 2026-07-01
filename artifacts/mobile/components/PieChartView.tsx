import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { useColors } from '@/hooks/useColors';
import { formatCurrency } from '@/utils/formatters';

interface Slice {
  value: number;
  color: string;
  label: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}

interface Props {
  income: number;
  expense: number;
  debt: number;
  lent: number;
}

export default function PieChartView({ income, expense, debt, lent }: Props) {
  const colors = useColors();
  const total = income + expense + debt + lent;

  const slices: Slice[] = [
    { value: income,  color: '#22C55E', label: 'Income' },
    { value: expense, color: '#EF4444', label: 'Expense' },
    { value: debt,    color: '#F97316', label: 'Debt' },
    { value: lent,    color: '#8B5CF6', label: 'Lent' },
  ].filter((s) => s.value > 0);

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const innerR = 40;

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Svg width={size} height={size}>
          <Path d={slicePath(cx, cy, r, 0, 359.99)} fill={colors.muted} />
          <Path d={slicePath(cx, cy, innerR, 0, 359.99)} fill={colors.card} />
        </Svg>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No data</Text>
      </View>
    );
  }

  let currentAngle = 0;
  const paths = slices.map((slice) => {
    const angle = (slice.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + angle - 0.5;
    currentAngle += angle;
    return { ...slice, path: slicePath(cx, cy, r, start, end) };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <Svg width={size} height={size}>
          <G>
            {paths.map((p, i) => (
              <Path key={i} d={p.path} fill={p.color} />
            ))}
            <Path d={slicePath(cx, cy, innerR, 0, 359.99)} fill={colors.card} />
          </G>
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={[styles.centerTotal, { color: colors.mutedForeground }]}>Total</Text>
          <Text style={[styles.centerAmount, { color: colors.foreground }]}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <View>
              <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              <Text style={[styles.legendAmount, { color: colors.foreground }]}>
                {Math.round((s.value / total) * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 20 },
  chartWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  centerLabel: { position: 'absolute', alignItems: 'center' },
  centerTotal: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  centerAmount: { fontSize: 12, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  legendAmount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  emptyContainer: { alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', position: 'absolute', bottom: 0 },
});
