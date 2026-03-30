# Logic

Jeu React/Vite base sur des mots (antonymes/synonymes).

## Idee du jeu
- Des "ennemis" (des mots) apparaissent sur les bords et se deplacent vers une "base" au centre.
- Vous tapez un mot dans la barre de saisie, puis validez avec `Enter`.
- Si le mot que vous tapez est un **antonyme** d'un ennemi, cet ennemi est detruit et vous gagnez des points.
- Si le mot que vous tapez est un **synonyme**, l'ennemi concerne devient plus rapide et vous perdez des points.
- Quand des ennemis atteignent la base, ils retirent de la **Base HP**.

## Comment jouer
1. Lancez le jeu.
2. Quand un ennemi (mot) approche de la base, tapez un mot dans l'input.
3. Validez avec `Enter`.

Regles importantes:
- La comparaison est insensible a la casse (`trim()` + `toLowerCase()`).
- Les espaces avant/apres sont ignores.
- Les accents doivent matcher (les donnees utilisent des mots avec caracteres accentues).
- Si plusieurs ennemis matchent le mot saisi, seul **l'ennemi le plus proche du centre** est affecte.
- Pendant que l'input est focus, le deplacement du monde est ralentit (facteur `0.5`) pour vous laisser le temps de viser.

## Points et progression
- Antonyme: +100 (et suppression de l'ennemi matchant)
- Synonyme: -20 (et augmentation de la vitesse de l'ennemi matchant)
- Chaque ennemi qui atteint la base compte comme un "hit" et reduit la Base HP (1 hit = 1 point de Base HP perdu)

## Donnees (mots)
Les mots sont stockes dans `src/data/words.json`.
Chaque entree suit ce format:
- `label`: le mot affiche pour l'ennemi
- `antonyms`: liste de mots reconnus comme antonymes
- `synonyms`: liste de mots reconnus comme synonymes
- `difficulty`: niveau numerique (utilise pour choisir le pool au spawn)

Pour ajouter des mots, editez `src/data/words.json` (la gameEngine selectionne un `difficulty` aleatoire entre 1 et 3 au spawn).

## Lancer en local
1. Installer:
   - `npm ci` (ou `npm install`)
2. Demarrer le dev server:
   - `npm run dev`
3. Ouvrir:
   - http://localhost:5173

## Build & preview
- Build production:
  - `npm run build`
- Preview local:
  - `npm run preview`

## Docker

### Dev (docker-compose)
`docker-compose.yml` demarre une image `node:22-alpine`, monte le dossier du projet, fait `npm ci`, puis `npm run dev` en exposant le port `5173`.

1. `docker compose up --build`
2. Ouvrir:
   - http://localhost:5173

### Production (Dockerfile)
Le `Dockerfile` fait:
- build React/Vite en stage `node:22-alpine`
- copie le resultat dans un `nginx:alpine`

Exemple:
- `docker build -t logic .`
- `docker run --rm -p 8080:80 logic`
Puis ouvrir:
- http://localhost:8080

