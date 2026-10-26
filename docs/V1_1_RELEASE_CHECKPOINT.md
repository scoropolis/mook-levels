# Mook Worlds v1.1 Release Checkpoint

Checkpoint date: 2026-10-05

## Implemented locally

- Playable Endless destination after World 5, escalating mechanics, two-minute checkpoints, one continue, and durable local high score.
- Versioned counted power-up inventory, starter migration, atomic consumption, stockpiles, and one-time deterministic perfect-clear rewards.
- Dormant StoreKit 2 bridge retained for a later release; current Store and purchase UI are unreachable.
- AdMob app bridge with official test configuration in Debug, installed production identifiers in Release, UMP request gating/privacy options, immediate every-third-loss eligibility, and Remove Ads suppression.
- Expanded browser regressions and iOS dependency/project wiring.

## Not live and not claimed

- The App Store Connect products exist with approved tiers/territories, but remain unsubmitted and still need review screenshots.
- The linked AdMob app and one loss-only interstitial exist; serving remains disabled and the app still requires AdMob review.
- A European consent message is saved only as a draft; account settings, final privacy/App Privacy declarations, publication, and device proof remain unapproved.
- No upload, submission, review request, or release has occurred.
- No physical-device StoreKit sandbox or ad presentation proof exists yet.

## Required before release candidate approval

- [x] Defer StoreKit products, screenshots, and sandbox testing to a later commerce release.
- [x] Production AdMob IDs installed; Debug/sample IDs remain limited to Debug code paths.
- [ ] UMP/consent, age handling, territory behavior, and privacy disclosures approved and device-tested.
- [x] Remove Ads omitted from this release; no restore/refund claim is presented.
- [ ] Full browser tests, web build, unsigned Release simulator build, signed device build, and visual states re-proved from the exact release commit.
- [ ] Separate explicit approval obtained for upload, commercial settings, submission, and public release.
