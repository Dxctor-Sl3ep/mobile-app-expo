# 🌙 Journal de Rêves — Starter Kit (Expo + React Native + TypeScript)

Bienvenue dans le **starter kit *Journal de Rêves* (DreamApp)** — une application mobile multiplateforme pour enregistrer, annoter et partager ses rêves de façon sécurisée.

Ce guide présente :

* la structure du projet,
* les commandes pour exécuter et tester localement,
* des pistes d’évolution (UX, sécurité, synchronisation, thème).

---

## ✨ Fonctionnalités principales

* Création, édition et suppression d’un rêve
  (texte, type : lucide / cauchemar / normal, personnes, lieu, hashtags)
* Métadonnées :
  date du rêve, date d’enregistrement, intensité émotionnelle, qualité du sommeil, clarté, émotions avant/après
* Liste complète des rêves enregistrés
* Export **chiffré AES-GCM + PBKDF2** ou clair
* Import depuis fichier (clair ou chiffré)
* Thèmes clair/sombre automatiques

---

## 🧭 Structure du projet
### Dans son ensemble
```
├─ .gitignore
├─ .gitattributes
├─ .vscode/
│ ├─ settings.json
│ └─ extensions.json
├─ app.json
├─ package.json
├─ README.md
├─ tsconfig.json
├─ app/
│ ├─ _layout.tsx
│ ├─ +html.tsx
│ ├─ +not-found.tsx
│ ├─ modal.tsx
│ └─ (tabs)/
│ │ ├─ _layout.tsx
│ │ ├─ index.tsx
│ │ ├─ two.tsx
│ │ └─ three.tsx
├─ assets/
│ ├─ fonts/
│ │ └─ SpaceMono-Regular.ttf
│ └─ images/
│ │ ├─ adaptive-icon.png
│ │ ├─ favicon.png
│ │ ├─ icon.png
│ │ └─ splash-icon.png
├─ components/
│ ├─ DreamForm.tsx
│ ├─ DreamList.tsx
│ ├─ StyledText.tsx
│ ├─ Themed.tsx
│ ├─ useClientOnlyValue.ts
│ ├─ useClientOnlyValue.web.ts
│ ├─ useColorScheme.ts
│ ├─ useColorScheme.web.ts
│ └─ __tests__/
│ │ └─ StyledText-test.js
├─ constants/
│ ├─ Colors.ts
│ └─ AsyncStorageConfig.ts
├─ interfaces/
│ ├─ DreamData.tsx
│ └─ Hashtag.tsx
└─ services/
  └─ AsyncStorageService.tsx
```
### fichiers/dossiers Modifié
```
├─ app/                  → routes et écrans (Expo Router)
│  ├─ _layout.tsx        → configuration globale + thème
│  ├─ modal.tsx          → modal d’édition
│  └─ (tabs)/            → navigation par onglets
│
├─ components/           → UI réutilisable
│  ├─ DreamForm.tsx      → formulaire de saisie
│  ├─ DreamList.tsx      → affichage et export
│  └─ Themed.tsx, StyledText.tsx, etc.
│
├─ interfaces/           → types partagés (DreamData, Hashtag)
├─ services/             → stockage centralisé (AsyncStorage)
├─ constants/            → clés et paramètres du stockage
├─ assets/               → icônes, splash, polices
└─ app.json              → configuration Expo
```

Fichiers essentiels :

* **DreamForm.tsx** : logique de saisie et sauvegarde locale
* **DreamList.tsx** : affichage, suppression, import/export
* **AsyncStorageService.tsx** : encapsule la persistance locale
* **DreamData.tsx** : définition complète d’un rêve (types TS)

---

## ⚙️ Prérequis

* Node.js (version LTS)
* npm ou yarn
* Expo CLI (facultatif, global) :

```bash
npm install -g expo-cli
```

---

## 🚀 Démarrage

1. Installer les dépendances :

```bash
npm install
```

2. Lancer le serveur :

```bash
npx expo start
```

3. Ouvrir l’application :

* **Mobile** : scanner le QR code avec **Expo Go**
* **Simulateur** : choisir “Run on Android” ou “Run on iOS”
* **Web** : “Run Web” dans Expo DevTools ou un navigateur WEB (Chrome par exemple)

4. En cas de cache corrompu :

```bash
npx expo start -c
```

---

## 🧪 Vérifications rapides

* **Compilation TypeScript :**

```bash
npx tsc --noEmit
```

* **Lint (si configuré) :**

```bash
npm run lint
```

---

## 🔐 Sécurité et chiffrement

L’export chiffré repose sur **WebCrypto** (API native).
Sur mobile, installer une source de hasard sécurisée :

* Avec Expo :

```bash
expo install expo-random
```

* En React Native pur :

```bash
yarn add react-native-get-random-values
```

Sans cette dépendance, le code utilise `Math.random()` comme secours — toléré en développement uniquement.

---

## 🛠️ Pistes d’évolution

* Tests unitaires sur la logique métier (normalisation, crypto)
* Synchronisation distante (Firebase, Supabase)
* Autosave et suggestions de hashtags
* i18n / multilingue
* Sécurisation renforcée (biométrie, chiffrement du stockage local) et chiffrement pour le téléphone (car impossible pour le moment)

---

## 📄 Licence

Ce starter est librement réutilisable et modifiable dans le cadre d’un projet personnel ou éducatif.
