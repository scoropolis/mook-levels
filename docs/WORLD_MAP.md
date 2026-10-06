# World map and title navigation

Mook Worlds opens on a title screen with exactly two game-mode choices. **Mook Worlds** opens the ascending journey map. **Endless Play** reads the persisted per-level best-star map, displays the remaining count to 100, and enables at 100 or more stars.

The map renders Worlds 1–7 from bottom to top so progress climbs upward. Each world has an original palette, procedural CSS texture, winding ten-node route, fog cover, completed/current/locked node states, best-star display, and one current-level Mook marker. Motion collapses under `prefers-reduced-motion: reduce`.

## Mook marker asset

- Generated source preserved unchanged at: `/Users/pointform/.openclaw/agents/main/agent/codex-home/generated_images/01a11323-a97b-7a81-bf41-228e52cbb13b/exec-1ac4cb43-364b-4285-a873-de8a04c56cd8.png`
- Project 1× asset: `assets/mook-map-marker.png` (128×128 RGBA PNG)
- Project 2× asset: `assets/mook-map-marker@2x.png` (256×256 RGBA PNG)
- The marker is decorative inside the current level's already-labeled button, so its image uses an empty alt value and an aria-hidden wrapper.

The project copies both optimized assets into `www/assets/` during web preparation; the generated original remains outside the repository and is never modified.
