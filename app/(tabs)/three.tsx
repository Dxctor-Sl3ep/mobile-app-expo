// app/(tabs)/three.tsx

import DreamList from '@/components/DreamList';
import StatsModal from '@/components/StatsModal';
import { Text as ThemedText } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import Colors from '@/constants/Colors';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import { useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';

export default function SearchScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const [queryTag, setQueryTag] = useState('');
  const [queryPerson, setQueryPerson] = useState('');
  const [queryLocation, setQueryLocation] = useState('');
  const [dreams, setDreams] = useState<DreamData[]>([]);
  const [results, setResults] = useState<DreamData[]>([]);
  const [statsOpen, setStatsOpen] = useState(false);

  const navigation = useNavigation();

  const load = async () => {
    const arr = (await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey)) || [];
    setDreams(arr as DreamData[]);
    setResults([]);



  };

  useEffect(() => {
    load();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="percent"
          onPress={() => setStatsOpen(true)}
          accessibilityLabel="Statistiques"
        />
      ),
    });
  }, [navigation]);

  const runSearch = () => {
    const t = queryTag.trim().toLowerCase();
    const p = queryPerson.trim().toLowerCase();
    const l = queryLocation.trim().toLowerCase();

    if (!t && !p && !l) {
      setResults([]);
      return;
    }

    const filtered = dreams.filter((d) => {
      let tagMatch = true;
      if (t) {
        const labels = [d.hashtags?.hashtag1?.label, d.hashtags?.hashtag2?.label, d.hashtags?.hashtag3?.label]
          .filter(Boolean)
          .map((s) => (s || '').toLowerCase());
        tagMatch = labels.some((lbl) => lbl.includes(t));
      }

      let personMatch = true;
      if (p) {
        const chars = (d.characters || []).map((c) => c.toLowerCase());
        personMatch = chars.some((c) => c.includes(p));
      }

      let locationMatch = true;
      if (l) {
        locationMatch = (d.location || '').toLowerCase().includes(l);
      }

      return tagMatch && personMatch && locationMatch;
    });

    setResults(filtered);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ThemedText style={[styles.title, { color: theme.text }]}></ThemedText>

        <TextInput label="Tag" value={queryTag} onChangeText={setQueryTag} mode="outlined" style={styles.input} />
        <TextInput label="Personne" value={queryPerson} onChangeText={setQueryPerson} mode="outlined" style={styles.input} />
        <TextInput label="Lieu" value={queryLocation} onChangeText={setQueryLocation} mode="outlined" style={styles.input} />

        <Button mode="contained" onPress={runSearch} style={styles.searchBtn}>
          Rechercher
        </Button>

        <View style={{ height: 12 }} />

        <DreamList dreams={results} noScroll showBottomActions={false} />
      </ScrollView>

      <StatsModal visible={statsOpen} onClose={() => setStatsOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, textAlign: 'center', color: '#FFFFFF' },
  input: { marginBottom: 12 },
  searchBtn: { alignSelf: 'center', marginBottom: 8 },
  card: { marginBottom: 10 },
  dreamText: { fontSize: 16, fontWeight: '500', marginBottom: 6, color: '#FFFFFF' },
  detail: { fontSize: 14, color: '#FFFFFF' },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: 150, fontWeight: '600', color: '#FFFFFF' },
  value: { flex: 1, color: '#FFFFFF' },
});
