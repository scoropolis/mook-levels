# Endless Play v1.1

Status: **implemented locally; external release proof still required**

## Player promise

Endless Play unlocks after all ten World 5 levels are complete. It is a high-score survival run that escalates until four misses end the attempt.

## v1.1 rules and balance

- The run starts with green targets and red traps.
- Blue swipes enter at 0:30, yellow holds at 1:00, gray rocks at 1:30, and purple reactions at 2:00.
- Spawn cadence starts at 1,050 ms and tightens by 3 ms per elapsed second to a 340 ms floor.
- Two simultaneous action targets become possible at 1:15; three become possible at 3:00.
- Response windows gradually contract to conservative floors: 1.3 seconds for green/red, 1.25 seconds for blue, 2.1 seconds for yellow, 2.8 seconds for rocks, and 0.65 seconds for purple.
- Rock strength rises from 2–3 hits to a maximum of 5 in long runs.
- Every two elapsed game minutes banks a checkpoint and the score at that checkpoint.
- Exactly one continue is available per run, only after a checkpoint exists. It clears the board, restores four lives, and starts a fresh attempt from the latest checkpoint with the banked score and elapsed difficulty.
- The run's durable high score is stored locally on the device.
- Time Slow affects game time consistently, so mechanic rollout and checkpoints use elapsed game time rather than wall-clock time.

## Test hooks and tuning

Automated coverage validates unlock gating, mechanic rollout, monotonic cadence escalation, checkpoint restoration, one-continue enforcement, and high-score persistence. Constants live beside the gameplay engine in index.html; change this document and the tests when tuning them.

## Deferred

- A universal leaderboard is not part of v1.1 and requires identity, backend, moderation, fraud, and privacy decisions.
- Cross-device high-score sync is not implemented.
