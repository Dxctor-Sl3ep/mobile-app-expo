// app/modal.tsx
import DreamForm from '@/components/DreamForm';
import MoonPhases from '@/components/MoonPhases';
import { Text } from '@/components/Themed';
import MoonToday from '@/components/MoonToday';
import { useColorScheme } from '@/components/useColorScheme';
import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import Colors from '@/constants/Colors';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function ModalEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [all, setAll] = useState<DreamData[] | null>(null);
  const current = useMemo(() => all?.find((d) => d.id === id) ?? null, [all, id]);

  // États individuels du rêve
  const [dreamText, setDreamText] = useState('');
  const [isLucidDream, setIsLucidDream] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [isNormalDream, setIsNormalDream] = useState(false);
  const [charactersInput, setCharactersInput] = useState('');
  const [location, setLocation] = useState('');
  const [personalMeaning, setPersonalMeaning] = useState('');
  const [emotionalIntensity, setEmotionalIntensity] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [tone, setTone] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [clarity, setClarity] = useState(5);
  const [emotionBefore, setEmotionBefore] = useState(5);
  const [emotionAfter, setEmotionAfter] = useState(5);
  const [hashtag1, setHashtag1] = useState('');
  const [hashtag2, setHashtag2] = useState('');
  const [hashtag3, setHashtag3] = useState('');
  const [sleepDate, setSleepDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const selectType = (type: 'lucid' | 'nightmare' | 'normal') => {
    setIsLucidDream(type === 'lucid');
    setIsNightmare(type === 'nightmare');
    setIsNormalDream(type === 'normal');
  };

  // Charger tous les rêves
  useEffect(() => {
    (async () => {
      const arr: DreamData[] =
        (await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey)) || [];
      setAll(arr);
    })();
  }, []);

  // Charger le rêve courant
  useEffect(() => {
    if (!current) return;
    setDreamText(current.dreamText);
    setIsLucidDream(current.isLucidDream);
    setIsNightmare(current.isNightmare);
    setIsNormalDream(current.isNormalDream);
    setTone(current.tone ?? null);
    setClarity(current.clarity ?? 5);
    setEmotionBefore(current.emotionBefore ?? 5);
    setEmotionAfter(current.emotionAfter ?? 5);
    setHashtag1(current.hashtags?.hashtag1?.label ?? '');
    setHashtag2(current.hashtags?.hashtag2?.label ?? '');
    setHashtag3(current.hashtags?.hashtag3?.label ?? '');
    setLocation(current.location ?? '');
    setPersonalMeaning(current.personalMeaning ?? '');
    setEmotionalIntensity(current.emotionalIntensity ?? 5);
    setSleepQuality(current.sleepQuality ?? 5);
    setCharactersInput((current.characters ?? []).join(', '));
    setSleepDate(new Date(current.sleepDate));
  }, [current]);

  const save = async () => {
    if (!all || !current) return;
    const idx = all.findIndex((d) => d.id === current.id);
    if (idx < 0) return;

    const updated: DreamData = {
      ...current,
      dreamText,
      isLucidDream,
      isNightmare,
      isNormalDream,
      tone,
      clarity,
      emotionBefore,
      emotionAfter,
      hashtags: {
        hashtag1: { id: current.hashtags?.hashtag1?.id ?? `h1-${current.id}`, label: hashtag1 },
        hashtag2: { id: current.hashtags?.hashtag2?.id ?? `h2-${current.id}`, label: hashtag2 },
        hashtag3: { id: current.hashtags?.hashtag3?.id ?? `h3-${current.id}`, label: hashtag3 },
      },
      characters: charactersInput.split(',').map((x) => x.trim()).filter(Boolean),
      location,
      personalMeaning,
      emotionalIntensity,
      sleepQuality,
      sleepDate: sleepDate.toISOString(),
    };

    const next = [...all];
    next[idx] = updated;
    await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, next);
    router.back();
  };

  const remove = async () => {
    if (!all || !current) return;
    const next = all.filter((d) => d.id !== current.id);
    await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, next);
    router.back();
  };

  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
        {current ? (
          <>
            <MoonToday />

            <DreamForm initialData={current} onSaved={save} />

            <View style={styles.actions}>
              <Button mode="outlined" onPress={() => router.back()}>Annuler</Button>
              <Button mode="contained" onPress={remove}>Supprimer</Button>
            </View>
          </>
        ) : (
          <View style={[styles.infoContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.tipTitle, { color: theme.text }]}>
              💡 Conseils pour induire des rêves lucides
            </Text>
            <Text style={[styles.tipText, { color: theme.text }]}>
              Voici quelques techniques simples à essayer pour favoriser les rêves lucides :
            </Text>

            <View style={{ marginTop: 8 }}>
              <Text style={[styles.tipItem, { color: theme.text }]}>
                • Tenir un journal de rêves : écrivez vos rêves chaque matin pour améliorer le rappel.
              </Text>
              <Text style={[styles.tipItem, { color: theme.text }]}>
                • Tests de réalité : demandez-vous plusieurs fois par jour "Est-ce que je rêve ?" et faites un test (pincer le nez, lire deux fois).
              </Text>
              <Text style={[styles.tipItem, { color: theme.text }]}>
                • Induction MILD : avant de dormir, répétez l'intention de reconnaître que vous rêvez.
              </Text>
              <Text style={[styles.tipItem, { color: theme.text }]}>
                • Réveil-retour-sommeil (WBTB) : réveillez-vous après 4–6h, restez éveillé 15–30 min puis rendormez-vous en gardant l'intention.
              </Text>
              <Text style={[styles.tipItem, { color: theme.text }]}>
                • Relaxation et visualisation : pratiquez la relaxation et imaginez-vous devenir lucide dans un rêve récent.
              </Text>
            </View>

            <MoonPhases days={7} />

            <View style={styles.actions}>
              <Button mode="outlined" onPress={() => router.back()} labelStyle={{ color: theme.text }}>
                Fermer
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  infoContainer: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
});
