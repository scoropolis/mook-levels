# Monetization Direction

Status: **v1.1 product direction — implementation deferred**

No StoreKit or AdMob integration belongs in the locked-world visual change. Product identifiers, consent/privacy design, inventory economy, restoration behavior, and the sandbox test matrix require a dedicated implementation pass.

## Product decisions

### Power-up inventory

- Replace unlimited power-ups with counted consumable inventory.
- Award inventory through performance rewards and occasional giveaways.
- Sell direct consumable power-up packs in v1.1.
- Do not introduce a soft-currency or token layer yet.
- Design storage around typed balances and an auditable transaction/award model so a token wallet can be added later without migrating or redefining existing power-up balances.

### StoreKit

- Add StoreKit in a dedicated phase for consumable power-up packs.
- Add a non-consumable **Remove Ads** purchase.
- Working Remove Ads price: **US $2.99**, with final App Store tier and territory pricing TBD.
- Define purchase recovery, transaction reconciliation, interrupted purchase handling, and device/reinstall behavior before implementation. Remove Ads must support the appropriate StoreKit restore/sync path; consumable inventory recovery must not be assumed to behave like a restorable non-consumable.

### Advertising

- Use AdMob interstitials only after a lost match, never after a win.
- Enforce frequency and per-session caps.
- Present only at a safe post-result transition, never over active gameplay, the result animation, or an in-progress purchase/continue flow.
- Keep ad demand architecture compatible with interstitial and rewarded inventory.
- Do not promise “playable preview” ads as a distinct guaranteed format; playable creative depends on available demand and mediation inventory.

## Recommended implementation phases

1. **Economy specification**
   - Choose pack contents/prices, reward cadence, giveaway rules, inventory caps, consumption timing, and offline/reinstall behavior.
   - Define stable product identifiers and the future-compatible inventory schema.
2. **StoreKit and inventory**
   - Implement counted inventory, earning/consumption, consumable packs, Remove Ads, transaction reconciliation, restore/sync behavior, and failure recovery.
   - Add StoreKit configuration plus sandbox tests for purchase, cancel, pending, duplicate delivery, interrupted delivery, restore, reinstall, and offline launch.
3. **Ads, consent, and privacy**
   - Finalize AdMob application/ad-unit identifiers, consent flow, age/territory handling, privacy disclosures, and App Privacy answers.
   - Implement loss-only interstitial placement, caps, safe timing, Remove Ads suppression, and no-fill/error behavior.
4. **Balance and release proof**
   - Tune rewards, pack value, ad frequency, and retention impact.
   - Complete device testing, StoreKit sandbox proof, ad/consent test matrix, privacy review, and App Store metadata updates before upload.

## Unresolved product decisions

- Power-up pack sizes, mix, prices, and whether packs are single-type or bundled.
- Performance reward thresholds, giveaway cadence, and maximum stored inventory.
- When inventory is consumed and what happens on an aborted or interrupted level.
- Whether inventory remains device-local or gains account/server-backed reconciliation.
- Exact Remove Ads territory pricing and whether rewarded ads, if later offered, remain available after purchase.
- Interstitial frequency/session caps and minimum delay after a loss.
- Consent provider, age handling, target territories, and final privacy declarations.
- Final StoreKit product IDs, AdMob IDs, restoration/reconciliation rules, and sandbox/device test matrix.
