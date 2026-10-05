# Monetization v1.1

Status: **App Store Connect products and AdMob records configured; serving, consent/privacy approval, and device proof remain gated**

The six StoreKit product records and one loss-only interstitial unit are configured externally. No privacy answers, uploads, submissions, or releases were changed.

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
- Production AdMob identifiers are installed in the Release configuration, but Release builds remain disabled while MookAdsEnabled is false.
- UMP refreshes consent information before Google Mobile Ads starts, presents a required consent form, and blocks ad requests unless the SDK reports that ads may be requested.
- A Privacy choices control appears when UMP reports that privacy options are required.
- “Playable” creative is not promised. The integration requests ordinary interstitial demand; creative and mediation inventory determine what appears.
- Rewarded ads are not exposed in v1.1.

## External release gates

1. Run StoreKit sandbox/device tests for success, cancellation, pending/Ask to Buy, duplicate callback, interrupted delivery, unfinished reconciliation, restore, reinstall, offline launch, and revoked/refunded Remove Ads.
2. Review AdMob account-level GDPR vendor/legal-basis settings, publish the saved European consent message only after the public privacy text is accurate, and decide age/territory treatment.
3. Resolve AdMob app-ads.txt and account payment-verification gates without changing legal or banking details from this release workflow.
4. Complete legal review of the privacy policy and App Privacy answers against the final SDK/data behavior.
5. Prove consent, privacy options, loss-only timing, caps, no-fill, background/foreground, orientation, and Remove Ads suppression on a physical device.
6. Obtain explicit approval before enabling MookAdsEnabled, upload, submission, distribution, or release.
