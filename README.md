# Logic

Projet **monorepo** : un jeu **React / Vite** (mots, antonymes / synonymes) et une **API Express** avec **Prisma** et **PostgreSQL** pour les données persistées.

---

## Sommaire

1. [Idée du jeu](#idée-du-jeu)
2. [Structure du dépôt](#structure-du-dépôt)
3. [Frontend](#frontend)
4. [Backend (API)](#backend-api)
5. [Base de données](#base-de-données)
6. [Docker](#docker)
7. [Démarrage rapide (dev complet)](#démarrage-rapide-dev-complet)

---

## Idée du jeu

- Des « ennemis » (**mots**) apparaissent sur les bords de la zone de jeu et se déplacent vers une **base** au centre.
- Vous saisissez un mot dans la barre en bas et validez avec **Entrée**.
- **Antonyme** correct (par rapport au mot affiché) → l’ennemi ciblé est détruit, **+100** points (un seul ennemi touché : le **plus proche du centre** parmi ceux qui matchent).
- **Synonyme** (erreur dans ce jeu) → **-20** points et **accélération** de l’ennemi ciblé (même règle de priorité).
- Un ennemi qui **atteint la base** : **-1** point de **Base HP**, puis il est retiré.

Règles utiles :

- Comparaison **insensible à la casse**, **trim** sur la saisie.
- Les **accents** doivent correspondre aux données (ex. `tiède` dans le JSON).
- **Mode lent** : tant que le champ de saisie a le **focus**, la vitesse des ennemis est multipliée par **0,5**.

Les mots du jeu côté client proviennent encore de **`src/data/words.json`**. L’API expose des mots en base pour d’éventuelles intégrations ou outils ; le client ne les consomme pas encore par défaut.

---

## Structure du dépôt

```text
.
├── src/                    # Frontend React (Vite)
│   ├── components/         # Hud, GameArea, CommandInput
│   ├── engine/             # gameEngine, wordEngine, enemySystem, matchEngine
│   ├── data/               # words.json
│   ├── store/              # (réservé)
│   └── styles/
├── server/                 # API Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── lib/prisma.js   # client Prisma partagé
│   │   ├── app.js
│   │   └── index.js
│   ├── prisma.config.ts
│   └── api.http            # requêtes type REST Client
├── docker-compose.yml      # Frontend dev + PostgreSQL
├── Dockerfile              # Build Vite + nginx (prod)
└── package.json            # Scripts du frontend
```

---

## Frontend

### Stack

- **React 19**, **JavaScript** (pas TypeScript), composants **fonctionnels** uniquement.
- **Vite 6**, plugin React.

### Fichiers clés

| Zone | Rôle |
|------|------|
| `src/App.jsx` | État partie (ennemis, base HP, score), boucle de jeu, spawn, saisie |
| `src/engine/gameEngine.js` | `requestAnimationFrame`, **deltaTime**, `stepGame` (déplacements + collisions base) |
| `src/engine/enemySystem.js` | Création d’ennemis, déplacement vers le centre, retrait à la base |
| `src/engine/wordEngine.js` | Chargement `words.json`, `getRandomWord(difficulty)` |
| `src/engine/matchEngine.js` | Soumission joueur : antonyme / synonyme, score |
| `src/data/words.json` | Mots : `label`, `antonyms`, `synonyms`, `difficulty` (1–3) |

### Scripts (racine)

```bash
npm install          # ou npm ci
npm run dev          # http://localhost:5173
npm run build
npm run preview
```

---

## Backend (API)

### Stack

- **Node.js** (ES modules), **Express**.
- **Prisma ORM 7** + **PostgreSQL**, client généré dans `server/src/generated/prisma/`.
- Connexion via **`pg`** et **`@prisma/adapter-pg`** (`server/src/lib/prisma.js`).

### Variables d’environnement

- Copier **`server/.env.example`** vers **`server/.env`**.
- **`DATABASE_URL`** : chaîne PostgreSQL (voir [Docker](#docker)).

### Schéma HTTP

| Méthode | Route | Description |
|---------|--------|-------------|
| `GET` | `/health` | Corps texte `OK` |
| `GET` | `/players` | JSON : tous les joueurs |
| `GET` | `/words` | JSON : tous les mots avec `antonyms` / `synonyms` (objets liés) |
| `GET` | `/random-word` | JSON un mot au hasard ; query optionnelle `?difficulty=1` (entier ≥ 1) |

Réponses erreur possibles pour `/random-word` : **400** (paramètre `difficulty` invalide), **404** (aucun mot pour le filtre).

### Scripts (`server/`)

```bash
cd server
npm install

npm run dev            # API avec rechargement (--watch), port 3000 par défaut
npm start              # API sans watch

npm run db:generate    # Régénérer le client Prisma
npm run db:push        # Pousser le schéma sur la DB (dev)
npm run db:migrate     # Migrations (dev)
npm run db:seed        # idem `prisma db seed`
npm run seed           # idem `prisma db seed`
npm run db:setup       # db:push puis db:seed
```

Le fichier **`server/api.http`** permet d’appeler les routes depuis un client REST (VS Code / Cursor, JetBrains).

---

## Base de données

### Modèles (Prisma)

- **Player** — `username`, `email`, `createdAt`
- **Game** — liée à un joueur, `startedAt`, `endedAt` optionnel
- **Score** — une entrée par partie (`gameId` unique)
- **Word** — `label`, `difficulty`
- **RelationWord** — lien entre deux mots (`wordIdSource`, `wordIdTarget`, `type` : ex. `antonym`, `synonym`)
- **GameWord** — table de liaison partie ↔ mot

La migration / le `db:push` doivent être exécutés **avant** le seed si les tables n’existent pas.

### Seed

- **`server/prisma/seed.js`** : 2 joueurs, 2 parties, 2 scores ; **5 `RelationWord`** de type `antonym` entre paires du type *noir/blanc*, *chaud/froid*, etc. (le schéma impose une ligne **`Word`** par mot : **5 paires ⇒ 10 mots** en base).
- Commande : **`npx prisma db seed`**, **`npm run seed`** ou **`npm run db:seed`** ; première fois souvent **`npm run db:setup`**.

---

## Docker

Le fichier **`docker-compose.yml`** à la racine définit :

| Service | Image | Port(s) | Rôle |
|---------|--------|---------|------|
| **app** | `node:22-alpine` | **5173** | `npm ci` + `npm run dev` Vite (projet monté en volume) |
| **postgres** | `postgres:latest` | **5432** | Base PostgreSQL persistante (volume `postgres_data`) |

**Variables PostgreSQL actuelles** (modifiables dans le compose) :

- Base : **`logic`**
- Utilisateur : **`logic`**
- Mot de passe : **`logic`**

**`DATABASE_URL`** côté serveur (exemple) :

```text
postgresql://logic:logic@localhost:5432/logic?schema=public
```

> Avec **PostgreSQL 18+** dans l’image officielle, le volume est monté sur **`/var/lib/postgresql`** (pas seulement `…/data`), comme dans ce compose.

### Commandes utiles

```bash
# Tout (front + Postgres)
docker compose up -d

# Seulement la base
docker compose up -d postgres
```

### Production frontend (image nginx)

À la racine :

```bash
docker build -t logic-web .
docker run --rm -p 8080:80 logic-web
# http://localhost:8080
```

---

## Démarrage rapide (dev complet)

1. **PostgreSQL**  
   `docker compose up -d postgres`

2. **API**  
   - `cd server`  
   - Créer `server/.env` avec **`DATABASE_URL`** (voir ci-dessus).  
   - `npm install` puis **`npm run db:setup`** (schéma + seed).  
   - **`npm run dev`** ou **`npm start`** → API sur **http://localhost:3000**

3. **Frontend**  
   - À la racine : `npm install` puis **`npm run dev`** → **http://localhost:5173**

4. **Vérification API**  
   - `GET http://localhost:3000/health`  
   - `GET http://localhost:3000/players`  
   - `GET http://localhost:3000/words`  
   Ou utiliser **`server/api.http`**.

---

## Licence

Spécifique au projet / cours — ajuster selon votre contexte.
