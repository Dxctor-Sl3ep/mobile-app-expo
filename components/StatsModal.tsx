import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';
import HorizontalBars from './HorizontalBars';

type Props = { visible: boolean; onClose: () => void };

type Counters = {
  total: number;
  lucid: number;
  nightmare: number;
  normal: number;
};
type NumAgg = { avg: number; min: number; max: number; count: number };

const safeNum = (v: any, def = 0) => (Number.isFinite(v) ? Number(v) : def);
const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);

export default function StatsModal({ visible, onClose }: Props) {
  const [dreams, setDreams] = useState<DreamData[]>([]);

  useEffect(() => {
    if (!visible) return;
    AsyncStorageService
      .getData(AsyncStorageConfig.keys.dreamsArrayKey)
      .then((arr) => setDreams(Array.isArray(arr) ? (arr as DreamData[]) : []))
      .catch(() => setDreams([]));
  }, [visible]);

  const counters: Counters = useMemo(() => {
    const total = dreams.length;
    let lucid = 0, nightmare = 0, normal = 0;
    for (const d of dreams) {
      if (d.isLucidDream) lucid++;
      else if (d.isNightmare) nightmare++;
      else if (d.isNormalDream) normal++;
    }
    return { total, lucid, nightmare, normal };
  }, [dreams]);

  const distTypes = useMemo(
    () => ([
      { label: 'Rêves lucides', value: counters.lucid },
      { label: 'Cauchemars', value: counters.nightmare },
      { label: 'Rêves normaux', value: counters.normal },
    ].filter(i => i.value > 0)),
    [counters]
  );

  const numAgg = (pick: (d: DreamData) => number | undefined): NumAgg => {
    let sum = 0, c = 0, min = +Infinity, max = -Infinity;
    for (const d of dreams) {
      const v = pick(d);
      if (Number.isFinite(v)) {
        const n = Number(v);
        sum += n; c++;
        if (n < min) min = n;
        if (n > max) max = n;
      }
    }
    return { avg: c ? +(sum / c).toFixed(2) : 0, min: c ? min : 0, max: c ? max : 0, count: c };
  };

  const agg = useMemo(() => ({
    emotionalIntensity: numAgg(d => d.emotionalIntensity),
    sleepQuality:      numAgg(d => d.sleepQuality),
    clarity:           numAgg(d => d.clarity),
    before:            numAgg(d => d.emotionBefore),
    after:             numAgg(d => d.emotionAfter),
  }), [dreams]);

  const toneDist = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of dreams) {
      const t = d.tone ?? 'indéfini';
      m.set(t, (m.get(t) ?? 0) + 1);
    }
    return Array.from(m, ([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [dreams]);

  const hashtagDist = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of dreams) {
      const labels = [
        d.hashtags?.hashtag1?.label,
        d.hashtags?.hashtag2?.label,
        d.hashtags?.hashtag3?.label,
      ].filter(Boolean) as string[];
      for (const lbl of labels) m.set(lbl, (m.get(lbl) ?? 0) + 1);
    }
    return Array.from(m, ([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dreams]);

  const characterDist = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of dreams) {
      for (const c of d.characters ?? []) {
        const key = String(c).trim();
        if (!key) continue;
        m.set(key, (m.get(key) ?? 0) + 1);
      }
    }
    return Array.from(m, ([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dreams]);

  const locationDist = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of dreams) {
      const key = String(d.location ?? '').trim();
      if (key) m.set(key, (m.get(key) ?? 0) + 1);
    }
    return Array.from(m, ([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dreams]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'fullScreen'}
      transparent={false}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Statistiques des rêves</Text>

        <Card style={styles.card}>
          <Card.Title title="Résumé" titleStyle={{ color: '#FFFFFF' }} />
          <Card.Content>
            <Text style={styles.statText}>Nombre total: <Text style={styles.statValue}>{counters.total}</Text></Text>
            <Text style={[styles.statText, { color: '#4169E1' }]}>Lucides: <Text style={styles.statValue}>{counters.lucid} ({pct(counters.lucid, counters.total)}%)</Text></Text>
            <Text style={[styles.statText, { color: '#DC143C' }]}>Cauchemars: <Text style={styles.statValue}>{counters.nightmare} ({pct(counters.nightmare, counters.total)}%)</Text></Text>
            <Text style={[styles.statText, { color: '#3CB371' }]}>Normaux: <Text style={styles.statValue}>{counters.normal} ({pct(counters.normal, counters.total)}%)</Text></Text>
            <Divider style={{ marginVertical: 8 }} />
            <HorizontalBars
              data={distTypes}
              valueFmt={(n) => `${n}`}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Tonalité" titleStyle={{ color: '#FFFFFF' }} />
          <Card.Content>
            <HorizontalBars data={toneDist} valueFmt={(n) => `${n}`} />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Hashtags récurrents (top 10)" titleStyle={{ color: '#FFFFFF' }} />
          <Card.Content>
            {hashtagDist.length > 0
              ? <HorizontalBars data={hashtagDist} valueFmt={(n) => `${n}`} />
              : <Text style={{ color: '#FFFFFF' }}>Aucun hashtag</Text>}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Personnages récurrents (top 10)" titleStyle={{ color: '#FFFFFF' }} />
          <Card.Content>
            {characterDist.length > 0
              ? <HorizontalBars data={characterDist} valueFmt={(n) => `${n}`} />
              : <Text style={{ color: '#FFFFFF' }}>Aucun personnage récurrent</Text>}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Lieux récurrents (top 10)" titleStyle={{ color: '#FFFFFF' }} />
          <Card.Content>
            {locationDist.length > 0
              ? <HorizontalBars data={locationDist} valueFmt={(n) => `${n}`} />
              : <Text style={{ color: '#FFFFFF' }}>Aucun lieu récurrent</Text>}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Indicateurs numériques (0–10)" titleStyle={{ color: '#FFFFFF' }} />
          <Card.Content>
            <Text style={styles.statLine}>
              <Text style={[styles.statLabel, { color: '#FF69B4' }]}>Intensité émotionnelle</Text>
              — moy: <Text style={styles.statHighlight}>{agg.emotionalIntensity.avg}</Text> | min: {agg.emotionalIntensity.min} | max: {agg.emotionalIntensity.max} | n={agg.emotionalIntensity.count}
            </Text>
            <Text style={styles.statLine}>
              <Text style={[styles.statLabel, { color: '#4682B4' }]}>Qualité du sommeil</Text>
              — moy: <Text style={styles.statHighlight}>{agg.sleepQuality.avg}</Text> | min: {agg.sleepQuality.min} | max: {agg.sleepQuality.max} | n={agg.sleepQuality.count}
            </Text>
            <Text style={styles.statLine}>
              <Text style={[styles.statLabel, { color: '#9370DB' }]}>Clarté</Text>
              — moy: <Text style={styles.statHighlight}>{agg.clarity.avg}</Text> | min: {agg.clarity.min} | max: {agg.clarity.max} | n={agg.clarity.count}
            </Text>
            <Text style={styles.statLine}>
              <Text style={[styles.statLabel, { color: '#20B2AA' }]}>Émotion avant</Text>
              — moy: <Text style={styles.statHighlight}>{agg.before.avg}</Text> | min: {agg.before.min} | max: {agg.before.max} | n={agg.before.count}
            </Text>
            <Text style={styles.statLine}>
              <Text style={[styles.statLabel, { color: '#20B2AA' }]}>Émotion après</Text>
              — moy: <Text style={styles.statHighlight}>{agg.after.avg}</Text> | min: {agg.after.min} | max: {agg.after.max} | n={agg.after.count}
            </Text>
          </Card.Content>
        </Card>

        <View style={{ height: 8 }} />
        <Button mode="contained" onPress={onClose}>Fermer</Button>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontWeight: '700', marginBottom: 4, color: '#FFFFFF' },
  card: { borderRadius: 12 },
  statText: { fontSize: 16, marginVertical: 2, color: '#FFFFFF' },
  statValue: { fontWeight: '600', color: '#FFFFFF' },
  statLine: { fontSize: 15, marginVertical: 4, color: '#FFFFFF' },
  statLabel: { fontWeight: '600', fontSize: 16 },
  statHighlight: { fontWeight: '700', color: '#FFA500' },
});
