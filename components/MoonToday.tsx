import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

function julian(d: Date) {
    return d.getTime() / 86400000 + 2440587.5;
}

function phaseNameFromAge(age: number) {
    if (age < 1.84566) return 'Nouvelle lune';
    if (age < 5.53699) return 'Premier croissant';
    if (age < 9.22831) return 'Premier quartier';
    if (age < 12.91963) return 'Gibbous croissant';
    if (age < 16.61096) return 'Pleine lune';
    if (age < 20.30228) return 'Gibbous décroissant';
    if (age < 23.99361) return 'Dernier quartier';
    if (age < 27.68493) return 'Dernier croissant';
    return 'Nouvelle lune';
}

function emojiForPhase(phase: string) {
    switch (phase) {
        case 'Nouvelle lune':
            return '🌑';
        case 'Premier croissant':
            return '🌒';
        case 'Premier quartier':
            return '🌓';
        case 'Gibbous croissant':
            return '🌔';
        case 'Pleine lune':
            return '🌕';
        case 'Gibbous décroissant':
            return '🌖';
        case 'Dernier quartier':
            return '🌗';
        case 'Dernier croissant':
            return '🌘';
        default:
            return '🌙';
    }
}

export default function MoonToday() {
    const scheme = useColorScheme();
    const theme = Colors[scheme ?? 'light'];
    const today = useMemo(() => new Date(), []);

    const phase = useMemo(() => {
        const jd = julian(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
        const synodic = 29.530588853;
        const daysSince = jd - 2451550.1;
        const newMoons = daysSince / synodic;
        const frac = newMoons - Math.floor(newMoons);
        const age = frac * synodic;
        return phaseNameFromAge(age);
    }, [today]);

    const emoji = emojiForPhase(phase);

    return (
        <Card style={[styles.card, { backgroundColor: scheme === 'dark' ? '#222' : undefined }]}>
            <Card.Content style={{ alignItems: 'center' }}>
                <View style={styles.row}>
                    <Text variant="headlineMedium" style={[styles.emoji, { color: theme.text }]}>{emoji}</Text>
                    <Text variant="titleLarge" style={[styles.text, { color: theme.text }]}>{phase}</Text>
                </View>
                <Text style={[styles.date, { color: theme.text }]}>{format(today, "EEEE dd MMMM yyyy", { locale: fr })}</Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginBottom: 12, borderRadius: 12, backgroundColor: '#222' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    emoji: { marginRight: 12 },
    text: { fontWeight: '700' },
    date: { marginTop: 6 },
});
