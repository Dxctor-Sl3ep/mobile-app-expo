import { DreamHashtags } from './Hashtag';

export interface DreamData {
  id: string; 
  dreamText: string;
  isLucidDream: boolean;
  isNightmare: boolean;
  isNormalDream: boolean;
  tone?: 'positive' | 'negative' | 'neutral' | null;
  clarity?: number;
  emotionBefore?: number;
  emotionAfter?: number;
  hashtags?: DreamHashtags;
  todayDate: string;     
  characters: string[];
  location: string;
  personalMeaning: string;
  emotionalIntensity: number;
  sleepQuality: number;
  sleepDate: string;     
}
