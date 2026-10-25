# Monetization v1.1

Status: **AdMob account and privacy prerequisites verified; internal build 6 uses official Google test demand pending physical-device proof**

The six StoreKit product records and one loss-only interstitial unit are configured externally. No privacy answers, uploads, submissions, or releases were changed.

## Power-up economy

- Power-ups are typed consumable balances: sky, sun, rock, and time.
- New and pre-economy installs receive a one-time starter migration of one unit of each type. Existing version-1 economy records retain their exact saved balances and ledger, including any power-ups granted by older builds.
- Each power becomes available with its matching world: Time Slow in Green Valley (World 1), Sky God in Sky Current (World 2), Sun God in Sunhold Sands (World 3), and Rock God in Rock Summit (World 4).
- A locked power cannot be equipped or purchased. The mixed 12-item pack becomes purchasable when all four powers are unlocked in World 4. Inventory already granted by a verified transaction remains saved even while a contained power is locked.
- Selecting a power does not consume it. All selected powers are consumed atomically when play begins.
- Balances may stockpile without an app-imposed cap in v1.1.
- Level completion and four-star scores do not grant power-ups. Stars control progression and Endless access; inventory changes only through the starter migration, consumption, or a verified StoreKit delivery.
- Storage is versioned and contains typed balances plus a bounded transaction/reward ledger. A future token wallet can be added as another typed account without redefining existing balances.
- Inventory is device-local. Consumables are not represented as restorable purchases and no cross-device inventory claim is made.

## StoreKit 2

The iOS app includes a local MookCommerce Capacitor bridge. It loads products, verifies StoreKit transactions, exposes unfinished verified transactions for reconciliation, and finishes each transaction only after the web economy acknowledges idempotent delivery. AppStore.sync() restores the Remove Ads entitlement.

| Product ID | Type | App-side delivery | Provisional display intent |
| --- | --- | --- | --- |
| com.skygardenapps.mookworlds.power.sky.5 | Consumable | Sky God ×5 | US $0.99-equivalent tier |
| com.skygardenapps.mookworlds.power.sun.5 | Consumable | Sun God ×5 | US $0.99-equivalent tier |
| com.skygardenapps.mookworlds.power.rock.5 | Consumable | Rock God ×5 | US $0.99-equivalent tier |
| com.skygardenapps.mookworlds.power.time.5 | Consumable | Time Slow ×5 | US $0.99-equivalent tier |
| com.skygardenapps.mookworlds.power.bundle.12 | Consumable | Power-Up Variety Pack: three of every type (12 total) | US $1.99-equivalent tier |
| com.skygardenapps.mookworlds.removeads | Non-consumable | Remove Ads | US $2.99-equivalent tier |

These US prices and equivalent tiers were verified in App Store Connect on October 5, 2026 across the app's 175 territories. StoreKit's localized `displayPrice` replaces the in-app US fallback copy.

## AdMob policy and implementation

- Interstitial eligibility is evaluated only from a loss result. Wins never call the ad path.
- The first eligible presentation requires three losses and at least two session minutes.
- After an impression, another requires three more losses and at least two minutes.
- There is no arbitrary per-session impression ceiling; every later impression still requires three additional losses and at least two minutes since the prior impression.
- Ads are requested only after the result UI is safely presented, never during gameplay, result animation, purchase, or continue selection.
- Remove Ads suppresses every interstitial request.
- No-fill and presentation errors fail closed and gameplay continues.
- Debug builds use Google's official iOS sample app ID and interstitial test unit.
- Production AdMob identifiers are installed. Internal build 6 enables the release ad path but forces Google's official test interstitial ID; production demand remains off until physical-device acceptance and an explicitly approved production build.
- UMP refreshes consent information before Google Mobile Ads starts, presents a required consent form, and blocks ad requests unless the SDK reports that ads may be requested.
- Mook Worlds is classified as general audience, so every UMP consent-information request explicitly sends the under-age-of-consent tag as false (`isTaggedForUnderAgeOfConsent = false` in Swift).
- A Privacy choices control appears when UMP reports that privacy options are required.
- “Playable” creative is not promised. The integration requests ordinary interstitial demand; creative and mediation inventory determine what appears.
- Rewarded ads are not exposed in v1.1.

## External release gates

1. Run StoreKit sandbox/device tests for success, cancellation, pending/Ask to Buy, duplicate callback, interrupted delivery, unfinished reconciliation, restore, reinstall, offline launch, and revoked/refunded Remove Ads.
2. Publish the advertising-aware privacy policy before the test build; the European consent message is already published and applies to Mook Worlds.
3. Keep the verified root `app-ads.txt` record live. AdMob identity, address PIN and bank details unlock only after Google's earnings thresholds and do not block initial serving.
4. Complete legal review of the privacy policy and App Privacy answers against the final SDK/data behavior.
5. Prove consent, privacy options, loss-only timing and spacing, no-fill, background/foreground, orientation, and Remove Ads suppression on a physical device.
6. Obtain explicit approval before uploading the internal test build, switching `MookAdsTestMode` off, submission, distribution, or public release.
