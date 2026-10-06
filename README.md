# Mook Worlds

A separate level-based edition of Mook. The original endless score-chaser remains unchanged at https://scoropolis.github.io/mook-game/.

## Structure

- 7 themed stages with 10 levels each
- 30-second levels
- Persistent unlock progress in the browser
- Every clear awards one to four stars from remaining lives; each level permanently keeps its best star result
- Level-clear cards animate the point total and earned stars and wait for the player to continue
- Every level starts with a briefing and counted, device-local power-up inventory; new players receive one of each power and existing saved inventories are preserved
- Sky God clears blue swipes, Sun God clears yellow holds, and Rock God breaks gray rocks automatically
- Time Slow runs game time at 75% speed, stretching the same 30 game seconds to 40 real seconds
- Powers unlock with their matching worlds: Time Slow in World 1, Sky God in World 2, Sun God in World 3, and Rock God in World 4; locked powers and packs cannot be used or purchased
- The world journey is an upward-winding, cloud-revealed map with themed world sections and a current-level Mook marker
- Current-level marker assets: `assets/mook-map-marker.png` (128 px) and `assets/mook-map-marker@2x.png` (256 px), optimized from the preserved generated transparent original
- Four-star clears award one deterministic power-up once per level; StoreKit-ready direct packs can add stockpile inventory
- The opening screen offers Mook Worlds and Endless Play; Endless unlocks at 100 total best-score stars with a live remaining-star countdown, escalating mechanics, two-minute checkpoints, one continue, and a local high score
- The iOS app contains StoreKit 2 and gated AdMob bridges; production products, ads, consent, and release remain externally gated
- Every level opens with a hands-on world-specific interaction and waits for the player
- Openers progress through green tap, blue swipe, yellow hold, three-hit rock, purple tap, opposite red tap, and quantum red-to-green change
- Difficulty rises across each set of 10 levels
- In Worlds 2–5, the featured mechanic rises from 10% of action cells in Level 1 to 33% in Level 10
- World cells use a paced quota rather than pure chance, preventing entire rounds without the featured mechanic
- Previously introduced mechanics remain in rotation, so later worlds continue mixing swipes, holds, rocks, and earlier targets
- Green, red, and blue cells keep a two-second response window
- Yellow holds allow three seconds; rocks allow four seconds
- At most four targets can occupy the eight-cell board, with no more than three greens
- A short late-input grace window prevents one miss from costing two lives
- Stage 1: green targets and red traps
- Stage 2: adds blue directional swipes
- Stage 3: adds yellow hold targets
- Stage 4: Rock Summit adds three-hit rocks
- Stage 4 Levels 5–9 vary regular rocks from two to four hits; Level 10 can also produce five-hit rocks
- Stage 5: adds one-second purple tap cells; every level waits on a purple opener before its timer starts
- Stage 6: Reverse Realm swaps green/red behavior and requires swiping opposite blue arrows
- Reverse Realm ramps in groups: Levels 1–2 use paced reversed red/green mixes with guaranteed green traps; Levels 3–5 add opposite arrows; Level 6 adds yellow; Level 7 adds rocks; Levels 8–10 include every item at easy, medium, and hard pacing
- Stage 7: Quantum Flux flips green/red cells and arrow directions after one second; rocks hide their strength until the first hit
- Quantum Flux now mirrors the gradual Reverse Realm ramp: Levels 1–2 use only paced quantum red/green cells; Levels 3–5 introduce changing arrows from easy to hard; Level 6 adds yellow; Level 7 adds hidden rocks; Levels 8–10 combine everything at easy, medium, and hard pacing

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
