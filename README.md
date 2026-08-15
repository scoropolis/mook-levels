# Mook Worlds

A separate level-based edition of Mook. The original endless score-chaser remains unchanged at https://scoropolis.github.io/mook-game/.

## Structure

- 4 themed stages with 10 levels each
- 60-second levels
- Persistent unlock progress in the browser
- Every stage opens with a hands-on tutorial that waits for the player
- Difficulty rises across each set of 10 levels
- Stage 1: green targets and red traps
- Stage 2: adds blue directional swipes
- Stage 3: adds yellow hold targets
- Stage 4: adds three-hit rocks

## Run locally

```sh
npm install
python3 -m http.server 8891
```

Open http://127.0.0.1:8891/.

## Test

```sh
npm test
```
