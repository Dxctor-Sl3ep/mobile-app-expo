import { Text as ThemedText, useThemeColor } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { AsyncStorageConfig } from '@/constants/AsyncStorageConfig';
import { DreamData } from '@/interfaces/DreamData';
import { AsyncStorageService } from '@/services/AsyncStorageService';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Checkbox, TextInput } from 'react-native-paper';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const { width } = Dimensions.get('window');

type DreamFormProps = {
  initialData?: DreamData | null;
  onSaved?: (d: DreamData) => void;
};

export default function DreamForm({ initialData = null, onSaved }: DreamFormProps) {
  const [dreamText, setDreamText] = useState('');
  const [isLucidDream, setIsLucidDream] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [isNormalDream, setIsNormalDream] = useState(false);
  const [charactersInput, setCharactersInput] = useState('');
  const [location, setLocation] = useState('');
  const [personalMeaning, setPersonalMeaning] = useState('');
  const [emotionalIntensity, setEmotionalIntensity] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [sleepDate, setSleepDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'datetime'>('datetime');
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const themeTextColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tone, setTone] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [clarity, setClarity] = useState(5);
  const [emotionBefore, setEmotionBefore] = useState(5);
  const [emotionAfter, setEmotionAfter] = useState(5);
  const [hashtag1, setHashtag1] = useState('');
  const [hashtag2, setHashtag2] = useState('');
  const [hashtag3, setHashtag3] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setDreamText(initialData.dreamText ?? '');
    setIsLucidDream(!!initialData.isLucidDream);
    setIsNightmare(!!initialData.isNightmare);
    setIsNormalDream(!!initialData.isNormalDream);
    setCharactersInput((initialData.characters ?? []).join(', '));
    setLocation(initialData.location ?? '');
    setPersonalMeaning(initialData.personalMeaning ?? '');
    setEmotionalIntensity(initialData.emotionalIntensity ?? 5);
    setSleepQuality(initialData.sleepQuality ?? 5);
    setSleepDate(initialData.sleepDate ? new Date(initialData.sleepDate) : new Date());
    setTone(initialData.tone ?? null);
    setClarity(initialData.clarity ?? 5);
    setEmotionBefore(initialData.emotionBefore ?? 5);
    setEmotionAfter(initialData.emotionAfter ?? 5);
    setHashtag1(initialData.hashtags?.hashtag1?.label ?? '');
    setHashtag2(initialData.hashtags?.hashtag2?.label ?? '');
    setHashtag3(initialData.hashtags?.hashtag3?.label ?? '');
  }, [initialData]);

  const selectType = (type: 'lucid' | 'nightmare' | 'normal') => {
    setIsLucidDream(type === 'lucid');
    setIsNightmare(type === 'nightmare');
    setIsNormalDream(type === 'normal');
  };

  const handleDreamSubmission = async (): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const formDataArray: DreamData[] =
        (await AsyncStorageService.getData(AsyncStorageConfig.keys.dreamsArrayKey)) || [];

      const characters = charactersInput
        .split(',')
        .map((char) => char.trim())
        .filter((char) => char.length > 0);

      const id = initialData?.id ?? `dream_${Date.now()}`;

      const newDream: DreamData = {
        id,
        dreamText,
        isLucidDream,
        isNightmare,
        isNormalDream,
        tone,
        clarity,
        emotionBefore,
        emotionAfter,
        hashtags: {
          hashtag1: { id: initialData?.hashtags?.hashtag1?.id ?? `h1-${Date.now()}`, label: hashtag1 },
          hashtag2: { id: initialData?.hashtags?.hashtag2?.id ?? `h2-${Date.now()}`, label: hashtag2 },
          hashtag3: { id: initialData?.hashtags?.hashtag3?.id ?? `h3-${Date.now()}`, label: hashtag3 },
        },
        todayDate: new Date().toISOString(),
        characters,
        location,
        personalMeaning,
        emotionalIntensity,
        sleepQuality,
        sleepDate: sleepDate.toISOString(),
      };

      if (initialData) {
        const idx = formDataArray.findIndex((d) => d.id === initialData.id);
        if (idx >= 0) formDataArray[idx] = { ...formDataArray[idx], ...newDream } as DreamData;
        else formDataArray.push(newDream);
      } else {
        formDataArray.push(newDream);
      }

      await AsyncStorageService.setData(AsyncStorageConfig.keys.dreamsArrayKey, formDataArray);

      if (!initialData) {
        setDreamText('');
        setIsLucidDream(false);
        setIsNightmare(false);
        setIsNormalDream(false);
        setTone(null);
        setClarity(5);
        setEmotionBefore(5);
        setEmotionAfter(5);
        setHashtag1('');
        setHashtag2('');
        setHashtag3('');
        setCharactersInput('');
        setLocation('');
        setPersonalMeaning('');
        setEmotionalIntensity(5);
        setSleepQuality(5);
        setSleepDate(new Date());
      }

      if (onSaved) onSaved(newDream);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          label="📝 Rêve"
          value={dreamText}
          onChangeText={setDreamText}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={[styles.input, { width: width * 0.8, color: themeTextColor }]}
          theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }}
          autoFocus
        />

        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              isLucidDream && styles.segmentButtonActive,
              isLucidDream && { backgroundColor: isDark ? '#6B5B95' : '#e6e6e6' },
              styles.segmentLeft,
            ]}
            onPress={() => selectType('lucid')}
          >
            <ThemedText lightColor="#000" darkColor="#fff" style={[styles.segmentText]}>{'🌙 Rêve lucide'}</ThemedText>
          </TouchableOpacity>

          <View style={[styles.segmentSeparator, { backgroundColor: isDark ? '#444' : '#ccc' }]} />

          <TouchableOpacity
            style={[styles.segmentButton, isNightmare && styles.segmentButtonActive, isNightmare && { backgroundColor: isDark ? '#6B5B95' : '#e6e6e6' }]}
            onPress={() => selectType('nightmare')}
          >
            <ThemedText lightColor="#000" darkColor="#fff" style={[styles.segmentText]}>{'😱 Cauchemar'}</ThemedText>
          </TouchableOpacity>

          <View style={[styles.segmentSeparator, { backgroundColor: isDark ? '#444' : '#ccc' }]} />

          <TouchableOpacity
            style={[
              styles.segmentButton,
              isNormalDream && styles.segmentButtonActive,
              isNormalDream && { backgroundColor: isDark ? '#6B5B95' : '#e6e6e6' },
              styles.segmentRight,
            ]}
            onPress={() => selectType('normal')}
          >
            <ThemedText lightColor="#000" darkColor="#fff" style={[styles.segmentText]}>{'💤 Rêve normal'}</ThemedText>
          </TouchableOpacity>
        </View>

        <TextInput label="🏷️ Hashtag 1" value={hashtag1} onChangeText={setHashtag1} mode="outlined" style={[styles.input, { color: themeTextColor }]} theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }} />
        <TextInput label="🏷️ Hashtag 2" value={hashtag2} onChangeText={setHashtag2} mode="outlined" style={[styles.input, { color: themeTextColor }]} theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }} />
        <TextInput label="🏷️ Hashtag 3" value={hashtag3} onChangeText={setHashtag3} mode="outlined" style={[styles.input, { color: themeTextColor }]} theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }} />

        <View style={styles.checkboxContainer}>
          <Checkbox.Item
            label="😊 Tonalité positive"
            status={tone === 'positive' ? 'checked' : 'unchecked'}
            onPress={() => setTone(tone === 'positive' ? null : 'positive')}
            labelStyle={{ color: themeTextColor }}
          />
          <Checkbox.Item
            label="☹️ Tonalité négative"
            status={tone === 'negative' ? 'checked' : 'unchecked'}
            onPress={() => setTone(tone === 'negative' ? null : 'negative')}
            labelStyle={{ color: themeTextColor }}
          />
          <Checkbox.Item
            label="😐 Tonalité neutre"
            status={tone === 'neutral' ? 'checked' : 'unchecked'}
            onPress={() => setTone(tone === 'neutral' ? null : 'neutral')}
            labelStyle={{ color: themeTextColor }}
          />
        </View>

        <TextInput label="👤 Personnages (séparés par des virgules)" value={charactersInput} onChangeText={setCharactersInput} mode="outlined" style={[styles.input, { color: themeTextColor }]} theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }} />
        <TextInput label="📍 Lieu du rêve" value={location} onChangeText={setLocation} mode="outlined" style={[styles.input, { color: themeTextColor }]} theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }} />
        <TextInput label="💭 Signification personnelle" value={personalMeaning} onChangeText={setPersonalMeaning} mode="outlined" multiline numberOfLines={3} style={[styles.input, { color: themeTextColor }]} theme={{ colors: { text: themeTextColor, placeholder: themeTextColor } }} />

        <View style={styles.dateTimeContainer}>
          <ThemedText style={styles.sliderLabel}>🕰️ Heure du coucher :</ThemedText>

          {Platform.OS === 'web' ? (
            <ReactDatePicker
              selected={sleepDate}
              onChange={(date: Date | null) => {
                if (date) setSleepDate(date);
              }}
              showTimeSelect
              dateFormat="dd/MM/yyyy à HH:mm"
              timeIntervals={15}
              className="react-datepicker-input"
            />
          ) : (

            <>
              <Button
                mode="outlined"
                onPress={() => {
                  if (Platform.OS === 'android') {
                    setPickerMode('date');
                    setShowPicker(true);
                  } else {
                    setPickerMode('datetime');
                    setShowPicker(true);
                  }
                }}
                labelStyle={{ color: themeTextColor }}
              >
                Choisir : {format(sleepDate, "dd/MM/yyyy 'à' HH:mm")}
              </Button>

              {showPicker && (
                <DateTimePicker
                  value={tempDate || sleepDate}
                  mode={pickerMode === 'datetime' ? 'datetime' : pickerMode}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      const eventType = event?.type;
                      if (eventType === 'dismissed') {
                        setShowPicker(false);
                        setTempDate(null);
                        return;
                      }

                      if (pickerMode === 'date') {
                        if (selectedDate) {
                          setTempDate(selectedDate);
                          setPickerMode('time');
                          setShowPicker(true);
                        } else {
                          setShowPicker(false);
                        }
                      } else if (pickerMode === 'time') {
                        if (selectedDate) {
                          const base = tempDate || new Date();
                          const time = selectedDate;
                          const combined = new Date(base);
                          combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
                          setSleepDate(combined);
                        }
                        setTempDate(null);
                        setShowPicker(false);
                      }
                    } else {
                      setShowPicker(Platform.OS === 'ios');
                      if (selectedDate) setSleepDate(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.sliderContainer}>
          <ThemedText style={styles.sliderLabel}>😵 Intensité émotionnelle : {emotionalIntensity}/10</ThemedText>
          <Slider value={emotionalIntensity} minimumValue={0} maximumValue={10} step={1} onValueChange={setEmotionalIntensity} />
        </View>

        <View style={styles.sliderContainer}>
          <ThemedText style={styles.sliderLabel}>🛌 Qualité du sommeil : {sleepQuality}/10</ThemedText>
          <Slider value={sleepQuality} minimumValue={0} maximumValue={10} step={1} onValueChange={setSleepQuality} />
        </View>

        <View style={styles.sliderContainer}>
          <ThemedText style={styles.sliderLabel}>🔎 Clarté du rêve : {clarity}/10</ThemedText>
          <Slider value={clarity} minimumValue={0} maximumValue={10} step={1} onValueChange={setClarity} />
        </View>

        <View style={styles.sliderContainer}>
          <ThemedText style={styles.sliderLabel}>⬅️ Émotion avant : {emotionBefore}/10</ThemedText>
          <Slider value={emotionBefore} minimumValue={0} maximumValue={10} step={1} onValueChange={setEmotionBefore} />
        </View>

        <View style={styles.sliderContainer}>
          <ThemedText style={styles.sliderLabel}>➡️ Émotion après : {emotionAfter}/10</ThemedText>
          <Slider value={emotionAfter} minimumValue={0} maximumValue={10} step={1} onValueChange={setEmotionAfter} />
        </View>

        <Button mode="contained" onPress={handleDreamSubmission} style={styles.button} labelStyle={{ color: themeTextColor }}>
          Enregistrer le rêve
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingVertical: 20 },
  input: { width: width * 0.8, marginBottom: 16 },
  checkboxContainer: { flexDirection: 'column', marginBottom: 12, width: width * 0.8 },
  button: { marginTop: 20, width: '60%', alignSelf: 'center' },
  sliderContainer: { marginVertical: 10, width: width * 0.8 },
  sliderLabel: { fontSize: 14, marginBottom: 4 },
  dateTimeContainer: { marginVertical: 12, width: width * 0.8 },
  segmentedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.8,
    backgroundColor: 'transparent',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#888',
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentButtonActive: {
    backgroundColor: '#6B5B95',
  },
  segmentText: { fontWeight: '600', textAlign: 'center', paddingHorizontal: 6 },
  segmentSeparator: { width: 1, alignSelf: 'stretch', marginVertical: 8 },
  segmentLeft: { borderTopLeftRadius: 30, borderBottomLeftRadius: 30 },
  segmentRight: { borderTopRightRadius: 30, borderBottomRightRadius: 30 },
});
