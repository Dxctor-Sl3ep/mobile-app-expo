import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function MoonPhases({ days = 7 }: { days?: number }) {
    const [items, setItems] = useState<Array<{ date: Date; phase: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'api' | 'computed' | null>(null);

    const julian = (d: Date) => d.getTime() / 86400000 + 2440587.5;

    const phaseNameFromAge = (age: number) => {
        if (age < 1.84566) return 'Nouvelle lune';
        if (age < 5.53699) return 'Premier croissant';
        if (age < 9.22831) return 'Premier quartier';
        if (age < 12.91963) return 'Gibbous croissant';
        if (age < 16.61096) return 'Pleine lune';
        if (age < 20.30228) return 'Gibbous décroissant';
        if (age < 23.99361) return 'Dernier quartier';
        if (age < 27.68493) return 'Dernier croissant';
        return 'Nouvelle lune';
    };

    const computePhase = (d: Date) => {
        const jd = julian(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));
        const synodic = 29.530588853;
        const daysSince = jd - 2451550.1;
        const newMoons = daysSince / synodic;
        const frac = newMoons - Math.floor(newMoons);
        const age = frac * synodic;
        return phaseNameFromAge(age);
    };

    useEffect(() => {
        let mounted = true;
        const today = new Date();
        const dates = Array.from({ length: days }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
        });

        const tryApi = async () => {
            try {
                const month = today.getMonth() + 1;
                const year = today.getFullYear();
                const url = `https://www.icalendar37.net/lunar/api/?lang=fr&month=${month}&year=${year}&size=64&format=json`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('API unavailable');
                const json = await res.json();

                const map = new Map<string, string>();
                if (Array.isArray(json)) {
                    json.forEach((it: any) => {
                        if (!it) return;
                        const dnum = Number(it.day || it.dd || it.date || it.d);
                        const pname = it.phaseName || it.phase || it.moon || it.title;
                        if (dnum && pname) map.set(String(dnum).padStart(2, '0'), String(pname));
                    });
                } else if (json && typeof json === 'object') {
                    if (json.month && Array.isArray(json.month)) {
                        json.month.forEach((it: any) => {
                            const dnum = Number(it.day || it.dd || it.date || it.d);
                            const pname = it.phaseName || it.phase || it.moon || it.title;
                            if (dnum && pname) map.set(String(dnum).padStart(2, '0'), String(pname));
                        });
                    }
                    Object.keys(json).forEach((k) => {
                        const v = (json as any)[k];
                        if (!v) return;
                        if (typeof v === 'object' && (v.phaseName || v.phase)) {
                            const dayNum = Number(k);
                            if (!Number.isNaN(dayNum)) map.set(String(dayNum).padStart(2, '0'), String(v.phaseName || v.phase));
                        }
                    });
                }

                const out = dates.map((d) => {
                    const dayKey = String(d.getDate()).padStart(2, '0');
                    const found = map.get(dayKey);
                    return { date: d, phase: found ?? computePhase(d) };
                });

                if (mounted) {
                    setItems(out);
                    setSource('api');
                    setLoading(false);
                }
            } catch (e) {
                const out = dates.map((d) => ({ date: d, phase: computePhase(d) }));
                if (mounted) {
                    setItems(out);
                    setSource('computed');
                    setLoading(false);
                }
            }
        };

        tryApi();
        return () => {
            mounted = false;
        };
    }, [days]);

    const scheme = useColorScheme();
    const theme = Colors[scheme ?? 'light'];

    return (
        <Card style={{ marginBottom: 12, borderRadius: 12, backgroundColor: scheme === 'dark' ? '#222' : undefined }}>
            <Card.Content>
                <Text style={{ fontWeight: '600', marginBottom: 8, textAlign: 'center', color: theme.text }}>
                    🌓 Phases lunaires (aujourd'hui et {days - 1} jours)
                    {source ? ` — source: ${source}` : ''}
                </Text>
                {loading ? (
                    <Text style={{ color: theme.text }}>Chargement…</Text>
                ) : (
                    items.map((it) => {
                        const key = format(it.date, 'yyyy-MM-dd');
                        const todayKey = format(new Date(), 'yyyy-MM-dd');
                        const isToday = key === todayKey;
                        return (
                            <View
                                key={key}
                                style={{
                                    marginTop: 8,
                                    padding: isToday ? 8 : 0,
                                    borderRadius: isToday ? 8 : 0,
                                    backgroundColor: isToday ? (scheme === 'dark' ? '#333' : '#eef') : 'transparent',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: isToday ? 15 : 14,
                                        color: theme.text,
                                        fontWeight: isToday ? '800' : '400',
                                    }}
                                >
                                    {isToday ? '✨ ' : ''}{format(it.date, "EEEE dd MMMM yyyy", { locale: fr })} — {it.phase}
                                </Text>
                            </View>
                        );
                    })
                )}
            </Card.Content>
        </Card>
    );
}
