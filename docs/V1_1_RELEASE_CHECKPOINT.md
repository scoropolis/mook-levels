# Mook Worlds v1.1 Release Checkpoint

Checkpoint date: 2026-10-05

## Implemented locally

- Playable Endless destination after World 5, escalating mechanics, two-minute checkpoints, one continue, and durable local high score.
- Versioned counted power-up inventory, starter migration, atomic consumption, stockpiles, and one-time deterministic perfect-clear rewards.
- StoreKit 2 app bridge for five consumable pack products and one Remove Ads non-consumable, including verified unfinished-transaction reconciliation and acknowledgement.
- AdMob app bridge with official test configuration in Debug, production-disabled Release defaults, loss-only eligibility, frequency/session caps, and Remove Ads suppression.
- Expanded browser regressions and iOS dependency/project wiring.

## Not live and not claimed

- No App Store Connect products or prices have been created or changed.
- No production AdMob app/ad unit has been configured.
- No consent flow or final privacy/App Privacy declaration has been approved.
- No upload, submission, review request, or release has occurred.
- No physical-device StoreKit sandbox or ad presentation proof exists yet.

## Required before release candidate approval

- [ ] Final product identifiers, tiers, territories, display copy, tax/category configuration, and review screenshots confirmed in App Store Connect.
- [ ] StoreKit sandbox matrix completed on a signed physical-device build.
- [ ] Production AdMob IDs installed; Debug/sample IDs excluded from the release configuration.
- [ ] UMP/consent, age handling, territory behavior, and privacy disclosures approved and device-tested.
- [ ] Remove Ads restore, refund/revocation, reinstall, and multi-device expectations approved.
- [ ] Full browser tests, web build, unsigned Release simulator build, signed device build, and visual states re-proved from the exact release commit.
- [ ] Separate explicit approval obtained for upload, commercial settings, submission, and public release.
