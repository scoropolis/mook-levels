# Monetization v1.3

Status: **Ads-only production candidate in preparation; StoreKit products deferred**

Mook Worlds 1.3 monetizes through AdMob interstitials only. The Store, product cards, prices, purchase actions, and Remove Ads claim are unreachable and absent from the release UI. The dormant StoreKit bridge and externally configured product records are reserved for a later release after Apple commerce agreements and testing are complete.

## Power-up economy

- Power-ups are typed consumable balances: sky, sun, rock, and time.
- New and pre-economy installs receive a one-time starter migration of one unit of each type. Existing version-1 economy records retain their saved balances and ledger.
- Each power becomes available with its matching world: Time Slow in Green Valley (World 1), Sky God in Sky Current (World 2), Sun God in Sunhold Sands (World 3), and Rock God in Rock Summit (World 4).
- Selecting a power does not consume it. All selected powers are consumed atomically when play begins.
- The first flawless four-star clear of each level grants exactly one deterministic power-up. The level ID is recorded before delivery so replaying a flawless level cannot farm duplicate rewards.
- World 1 rewards Time Slow, World 2 rewards Sky God, World 3 rewards Sun God, and World 4 rewards Rock God. Later worlds rotate through the four types.
- A new reward is explicitly revealed on the victory card with its type and resulting owned count.
- Empty inventory displays only its count. The app does not explain, advertise, or tease a future Store.
- Balances may stockpile without an app-imposed cap.
- Inventory is device-local; no cross-device inventory claim is made.

## Deferred StoreKit scope

The repository retains a local MookCommerce Capacitor bridge and six configured product identifiers for a possible future commerce release. They are not part of Mook Worlds 1.3:

- `com.skygardenapps.mookworlds.power.sky.5`
- `com.skygardenapps.mookworlds.power.sun.5`
- `com.skygardenapps.mookworlds.power.rock.5`
- `com.skygardenapps.mookworlds.power.time.5`
- `com.skygardenapps.mookworlds.power.bundle.12`
- `com.skygardenapps.mookworlds.removeads`

Do not submit these products, mention them in App Review notes, display prices, expose a Store/Coming Soon surface, or claim Remove Ads until Apple agreements and the full StoreKit sandbox/device matrix are complete.

## AdMob policy and implementation

- Interstitial eligibility is evaluated only from a loss result. Wins never call the ad path.
- The first eligible presentation occurs immediately after the third loss.
- After an impression, another requires three more losses; there is no time delay.
- There is no arbitrary per-session impression ceiling; every later impression still requires three additional losses.
- Ads are requested only after the result UI is safely presented, never during gameplay, result animation, or continue selection.
- No-fill and presentation errors fail closed and gameplay continues. An unconfirmed request never resets the loss counter.
- Fullscreen presentation is dispatched on the iOS main thread and has a bounded pre-presentation timeout.
- Debug/simulator paths use Google's official iOS test interstitial. The production release candidate uses the real AdMob app and interstitial IDs with `MookAdsTestMode=false`.
- UMP refreshes consent information before Google Mobile Ads starts, presents required consent forms, and blocks ad requests unless the SDK reports that ads may be requested.
- Mook Worlds is classified as general audience, so UMP consent requests explicitly set the under-age-of-consent tag to false.
- A Privacy Choices control appears when UMP reports that privacy options are required.
- “Playable” creative is not promised. The integration requests ordinary interstitial demand; creative and mediation inventory determine what appears.
- Rewarded ads are not exposed.

## Verified test history

- Google's official test interstitial loaded, presented, and recorded an impression in the iOS simulator.
- The exact internal TestFlight flow exposed a device-only presentation hang; moving `present(from:)` to the main thread fixed it.
- Physical TestFlight testing confirmed direct test presentation, automatic presentation after three losses, dismissal/return to gameplay, and return navigation from Privacy and Support.

## Release gates

1. Keep the verified root `app-ads.txt` record live.
2. Reconcile App Privacy answers, age rating, privacy policy, metadata, and review notes with Google Mobile Ads/UMP and the absence of IAP.
3. Verify the signed exported IPA has `MookAdsEnabled=true`, `MookAdsTestMode=false`, the real production ad unit, no visible test diagnostics, no Store entry point, and `get-task-allow=false`.
4. Do not click live ads during internal QA. Use the already-completed test-demand proof as the presentation gate.
5. Upload the exact production candidate, read back Apple processing and internal-group state, then obtain separate explicit approval before App Review submission or public release.
