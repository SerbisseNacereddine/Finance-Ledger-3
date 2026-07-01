import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';

import { useColors } from '@/hooks/useColors';

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color: string;
  height?: number;
}

export default function LineChartView({ data, color, height = 140 }: Props) {
  const colors = useColors();
  const width = 320;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = 0;

  const toX = (i: number) =>
    padLeft + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) =>
    padTop + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No data for this period
        </Text>
      </View>
    );
  }

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
  const areaPath =
    `M ${toX(0)},${padTop + chartH} ` +
    data.map((d, i) => `L ${toX(i)},${toY(d.value)}`).join(' ') +
    ` L ${toX(data.length - 1)},${padTop + chartH} Z`;

  const labelIndices = data.length <= 6
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 3), Math.floor((2 * data.length) / 3), data.length - 1];

  return (
    <View style={{ width }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#grad)" />

        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>

      <View style={[StyleSheet.absoluteFill, { top: height - padBottom + 4 }]}>
        <View style={{ flexDirection: 'row', position: 'relative', width }}>
          {labelIndices.map((idx) => (
            <View
              key={idx}
              style={{
                position: 'absolute',
                left: toX(idx) - 20,
                width: 40,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                {data[idx].label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
