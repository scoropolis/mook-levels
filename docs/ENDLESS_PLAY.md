# Endless Play Backlog

Status: **Coming Soon — product direction captured, gameplay not implemented**

## Player promise

Endless Play is a high-score survival run that continues until the player fails.

## First implementation direction

- Begin with green and red targets.
- Progressively introduce blue, yellow, gray rock, and purple targets.
- Keep escalating difficulty for the duration of the run.
- Add periodic checkpoints. The initial checkpoint interval under consideration is approximately two minutes, but timing is intentionally TBD pending balancing.
- Allow exactly one continue per run.
- A continue starts a fresh attempt from the latest checkpoint while preserving the current run and high-score context.

## Deferred decisions

- Exact difficulty curves, mechanic introduction timing, checkpoint interval, scoring, and failure tuning require a dedicated balancing pass.
- A universal leaderboard may be added later; it is not part of the first Endless Play implementation.
- Until gameplay exists, the world-map destination remains non-interactive and labeled **Coming Soon**. Its cloud lock clears only after all ten World 5 levels are completed.
