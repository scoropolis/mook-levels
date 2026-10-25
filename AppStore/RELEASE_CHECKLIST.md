# Mook Worlds iOS Release Checklist

## Identity and account

- [ ] Confirm App Store name availability for `Mook Worlds`.
- [x] Register bundle ID `com.skygardenapps.mookworlds` on team `588GPA4GL2`.
- [x] Create the App Store Connect app record only after name and bundle identity are confirmed.

## Binary

- [ ] Pass browser regression tests.
- [ ] Pass unsigned Release simulator build.
- [ ] Verify version/build, bundle ID, portrait orientation, deployment target, generated icons, and privacy manifest in the built bundle.
- [ ] Test a signed build on a physical iPhone.
- [ ] Archive and validate with Apple before requesting upload approval.

## Listing and privacy

- [ ] Verify public support, privacy, and marketing URLs.
- [ ] Capture final screenshots from the release build.
- [ ] Complete App Privacy as no data collected only if the final binary/SDK inventory still supports it.
- [ ] Complete age rating, export compliance, content rights, and accessibility fields.
- [ ] Obtain separate approval for price, countries, distribution, and manual release mode before changing those fields.

## v1.1 commerce and ads gates

- [x] Create the six StoreKit products listed in docs/MONETIZATION.md and confirm final tiers and territories.
- [ ] Add StoreKit review screenshots before submission.
- [ ] Complete the StoreKit sandbox/device matrix, including pending, duplicate, interrupted, restore, reinstall, refund, and offline cases.
- [x] Configure production AdMob identifiers while retaining official sample identifiers only in Debug code paths.
- [ ] Approve and device-test UMP consent, age/territory behavior, and final privacy disclosures before enabling MookAdsEnabled.
- [ ] Prove interstitials occur only after losses, require three losses and two-minute spacing without an arbitrary session ceiling, and are suppressed by Remove Ads.
- [ ] Reconcile this checklist with docs/V1_1_RELEASE_CHECKPOINT.md before release-candidate approval.

## Approval gates

- [ ] Upload approval for exact version/build.
- [ ] Commercial/distribution approval.
- [ ] App Review submission approval.
- [ ] Public release approval after Apple approval.

