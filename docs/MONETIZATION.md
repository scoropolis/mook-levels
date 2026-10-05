# Monetization v1.1

Status: **app-side implementation complete locally; App Store Connect, AdMob, consent/privacy approval, and device proof remain gated**

No products, prices, ad units, privacy answers, uploads, submissions, or releases were changed externally by this implementation.

## Power-up economy

- Power-ups are typed consumable balances: sky, sun, rock, and time.
- New and pre-economy installs receive a one-time starter migration of five units of each type.
- Selecting a power does not consume it. All selected powers are consumed atomically when play begins.
- Balances may stockpile without an app-imposed cap in v1.1.
- A four-star clear earns exactly one power-up the first time that level achieves the reward. The deterministic world mapping is:
  - Worlds 1 and 5: Time Slow
  - World 2: Sky God
  - World 3: Sun God
  - World 4: Rock God
  - World 6: Sky God
  - World 7: Sun God
- Rewards are not farmable: awarded level IDs are persisted.
- Storage is versioned and contains typed balances plus a bounded transaction/reward ledger. A future token wallet can be added as another typed account without redefining existing balances.
- Inventory is device-local. Consumables are not represented as restorable purchases and no cross-device inventory claim is made.

## StoreKit 2

The iOS app includes a local MookCommerce Capacitor bridge. It loads products, verifies StoreKit transactions, exposes unfinished verified transactions for reconciliation, and finishes each transaction only after the web economy acknowledges idempotent delivery. AppStore.sync() restores the Remove Ads entitlement.

| Product ID | Type | App-side delivery | Provisional display intent |
| --- | --- | --- | --- |
| com.skygardenapps.mookworlds.power.sky.5 | Consumable | Sky God ×5 | $0.99 TBD |
| com.skygardenapps.mookworlds.power.sun.5 | Consumable | Sun God ×5 | $0.99 TBD |
| com.skygardenapps.mookworlds.power.rock.5 | Consumable | Rock God ×5 | $0.99 TBD |
| com.skygardenapps.mookworlds.power.time.5 | Consumable | Time Slow ×5 | $0.99 TBD |
| com.skygardenapps.mookworlds.power.bundle.12 | Consumable | Three of every type | $1.99 TBD |
| com.skygardenapps.mookworlds.removeads | Non-consumable | Suppress interstitials | $2.99 TBD |

Fallback prices are preview copy only. StoreKit's localized displayPrice replaces them when configured. Products and territory prices must be created separately in App Store Connect.

## AdMob policy and implementation

- Interstitial eligibility is evaluated only from a loss result. Wins never call the ad path.
- The first eligible presentation requires three losses and at least two session minutes.
- After an impression, another requires three more losses and at least two minutes.
- The cap is three interstitials per app session.
- Ads are requested only after the result UI is safely presented, never during gameplay, result animation, purchase, or continue selection.
- Remove Ads suppresses every interstitial request.
- No-fill and presentation errors fail closed and gameplay continues.
- Debug builds use Google's official iOS sample app ID and interstitial test unit.
- Release builds keep ads disabled unless MookAdsEnabled is explicitly set and a production MookAdMobInterstitialID is supplied.
- “Playable” creative is not promised. The integration requests ordinary interstitial demand; creative and mediation inventory determine what appears.
- Rewarded ads are not exposed in v1.1.

## External release gates

1. Create the six products in App Store Connect, select final tiers/territories, and attach them to the intended app/version.
2. Run StoreKit sandbox/device tests for success, cancellation, pending/Ask to Buy, duplicate callback, interrupted delivery, unfinished reconciliation, restore, reinstall, offline launch, and revoked/refunded Remove Ads.
3. Create the production AdMob app and interstitial unit; replace the sample app ID and set the production unit ID.
4. Decide age/territory treatment and implement/approve the required UMP consent flow before enabling production ads.
5. Complete legal review of the privacy policy and App Privacy answers against the final SDK/data behavior.
6. Prove loss-only timing, caps, no-fill, background/foreground, orientation, and Remove Ads suppression on a physical device.
7. Obtain explicit approval before upload, submission, pricing, distribution, or release.
