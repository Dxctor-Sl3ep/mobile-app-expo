import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Item = { label: string; value: number };
type Props = {
  data: Item[];
  max?: number;          
  valueFmt?: (n: number) => string;
  height?: number;       
};

export default function HorizontalBars({
  data,
  max,
  valueFmt = (n) => `${n}`,
  height = 18,
}: Props) {
  const localMax = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.container}>
      {data.map((d) => {
        const w = Math.max(2, Math.round((d.value / localMax) * 100));
        return (
          <View key={d.label} style={[styles.row, { height }]}>
            <Text style={styles.label} numberOfLines={1}>{d.label}</Text>
            <View style={styles.barWrap}>
              <View style={[styles.bar, { width: `${w}%` }]} />
            </View>
            <Text style={styles.value}>{valueFmt(d.value)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { width: 120, fontSize: 12, color: '#FFFFFF' },
  barWrap: { flex: 1, height: '100%', backgroundColor: '#333333', borderRadius: 8, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: '#8A6FD6' },
  value: { width: 60, textAlign: 'right', fontVariant: ['tabular-nums'], fontSize: 12, color: '#FFFFFF' },
});
