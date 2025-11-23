# Dream App - Documentation Technique

## Structure Détaillée des Fonctionnalités

### Gestion des Rêves

- Classification en trois types :
  - Rêves lucides (🌙)
  - Cauchemars (😱)
  - Rêves normaux (💤)

- Métadonnées complètes :
  - Horodatage du sommeil et de l'enregistrement
  - Géolocalisation (lieu du rêve)
  - Participants (personnages)
  - Analyse émotionnelle avant/après
  - Intensité émotionnelle (échelle 0-10)
  - Qualité du sommeil (échelle 0-10)
  - Clarté du souvenir (échelle 0-10)
  - Signification personnelle
  - Système de hashtags (jusqu'à 3)

### Fonctionnalités de Partage

#### Export Non-Chiffré

- Format : JSON standard
- Nom de fichier : `<dream_id>.json`
- Structure : Objet DreamData complet
- Utilisation : Partage simple, intégration avec d'autres outils

#### Export Chiffré

- Algorithme : AES-GCM
- Protection : Mot de passe avec PBKDF2
- Format de fichier : `<dream_id>.enc.json`
- Structure du fichier chiffré :

```json
{
  "_enc": "AESGCMv1",
  "s": "<sel en hex>",
  "iv": "<iv en hex>",
  "ct": "<données chiffrées en hex>"
}
```

### Analyse Statistique

- Types de rêves (distribution)
- Top 10 des éléments récurrents :
  - Hashtags
  - Personnages
  - Lieux
- Métriques numériques :
  - Moyennes
  - Minimums
  - Maximums
  - Nombre d'occurrences

## Interfaces de Données

### DreamData

```typescript
interface DreamData {
  id: string;
  dreamText: string;
  isLucidDream: boolean;
  isNightmare: boolean;
  isNormalDream: boolean;
  tone?: 'positive' | 'negative' | 'neutral';
  clarity?: number;
  emotionBefore?: number;
  emotionAfter?: number;
  hashtags?: {
    hashtag1?: { id: string; label: string };
    hashtag2?: { id: string; label: string };
    hashtag3?: { id: string; label: string };
  };
  todayDate: string;
  characters: string[];
  location: string;
  personalMeaning: string;
  emotionalIntensity?: number;
  sleepQuality?: number;
  sleepDate: string;
}
```

### Hashtag

```typescript
interface Hashtag {
  id: string;
  label: string;
}
```

## Services

### AsyncStorageService

- Clé principale : définie dans AsyncStorageConfig
- Méthodes :
  - getData : Lecture des rêves
  - setData : Sauvegarde des rêves

## Composants Principaux

### DreamForm

- Gestion du formulaire de saisie
- Validation des données
- Enregistrement local

### DreamList

- Affichage des rêves
- Actions :
  - Édition
  - Suppression
  - Export (chiffré/non-chiffré)
  - Import

### StatsModal

- Visualisation des statistiques
- Graphiques et métriques

## Interface Utilisateur

- Navigation par onglets
- Support thème sombre/clair
- Composants adaptatifs (mobile/web)
- Modales pour actions spécifiques

## Sécurité et Performance

- Chiffrement côté client
- Stockage local sécurisé
- Optimisation des listes longues
- Gestion du cache
