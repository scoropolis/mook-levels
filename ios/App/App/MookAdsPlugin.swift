import Foundation
import Capacitor
import GoogleMobileAds
import UserMessagingPlatform

@objc(MookAdsPlugin)
public final class MookAdsPlugin: CAPPlugin, CAPBridgedPlugin, FullScreenContentDelegate {
    public let identifier = "MookAdsPlugin"
    public let jsName = "MookAds"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showInterstitial", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showPrivacyOptions", returnType: CAPPluginReturnPromise)
    ]

    private let testInterstitialID = "ca-app-pub-3940256099942544/4411468910"
    private var interstitial: InterstitialAd?
    private var presentationCall: CAPPluginCall?
    private var isPresenting = false
    private var isEnabled = false
    private var loadError: String?

    private func isTestMode() -> Bool {
        #if DEBUG
        return true
        #else
        return Bundle.main.object(forInfoDictionaryKey: "MookAdsTestMode") as? Bool ?? false
        #endif
    }

    @objc public func configure(_ call: CAPPluginCall) {
        #if DEBUG
        isEnabled = true
        #else
        isEnabled = Bundle.main.object(forInfoDictionaryKey: "MookAdsEnabled") as? Bool ?? false
        #endif
        NSLog("[MookAds] configure enabled=%@ testMode=%@", isEnabled.description, isTestMode().description)
        guard isEnabled else {
            call.resolve([
                "configured": false,
                "reason": "production-disabled",
                "privacyOptionsRequired": privacyOptionsRequired()
            ])
            return
        }

        let consentParameters = RequestParameters()
        consentParameters.isTaggedForUnderAgeOfConsent = false
        ConsentInformation.shared.requestConsentInfoUpdate(with: consentParameters) { [weak self] error in
            guard let self else { return }
            if let error {
                call.resolve([
                    "configured": false,
                    "reason": "consent-info-unavailable",
                    "privacyOptionsRequired": self.privacyOptionsRequired(),
                    "detail": error.localizedDescription
                ])
                return
            }
            ConsentForm.loadAndPresentIfRequired(from: self.bridge?.viewController) { [weak self] _ in
                guard let self else { return }
                guard ConsentInformation.shared.canRequestAds else {
                    call.resolve([
                        "configured": false,
                        "reason": "consent-required",
                        "privacyOptionsRequired": self.privacyOptionsRequired()
                    ])
                    return
                }
                MobileAds.shared.start { [weak self] _ in
                    self?.loadInterstitial()
                    NSLog("[MookAds] SDK started; loading interstitial")
                    call.resolve([
                        "configured": true,
                        "testMode": self?.isTestMode() ?? false,
                        "privacyOptionsRequired": self?.privacyOptionsRequired() ?? false
                    ])
                }
            }
        }
    }

    @objc public func showPrivacyOptions(_ call: CAPPluginCall) {
        guard privacyOptionsRequired(), let controller = bridge?.viewController else {
            call.resolve(["shown": false])
            return
        }
        ConsentForm.presentPrivacyOptionsForm(from: controller) { error in
            call.resolve(["shown": error == nil])
        }
    }

    @objc public func getStatus(_ call: CAPPluginCall) {
        call.resolve([
            "enabled": isEnabled,
            "testMode": isTestMode(),
            "canRequestAds": ConsentInformation.shared.canRequestAds,
            "adReady": interstitial != nil,
            "loadError": loadError ?? ""
        ])
    }

    @objc public func showInterstitial(_ call: CAPPluginCall) {
        guard isEnabled, let ad = interstitial, let controller = bridge?.viewController else {
            loadInterstitial()
            call.resolve([
                "shown": false,
                "reason": interstitial == nil ? "ad-not-ready" : "presentation-unavailable",
                "detail": loadError ?? "The interstitial is still loading. Try again after the next loss."
            ])
            return
        }
        presentationCall = call
        isPresenting = false
        interstitial = nil
        ad.fullScreenContentDelegate = self
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            ad.present(from: controller)
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
                guard let self, !self.isPresenting, self.presentationCall?.callbackId == call.callbackId else { return }
                self.presentationCall?.resolve([
                    "shown": false,
                    "reason": "presentation-timeout",
                    "detail": "Google did not open the interstitial within three seconds."
                ])
                self.presentationCall = nil
                self.loadInterstitial()
            }
        }
    }

    private func adUnitID() -> String {
        if isTestMode() { return testInterstitialID }
        #if !DEBUG
        return Bundle.main.object(forInfoDictionaryKey: "MookAdMobInterstitialID") as? String ?? ""
        #else
        return testInterstitialID
        #endif
    }

    private func loadInterstitial() {
        let id = adUnitID()
        guard isEnabled, !id.isEmpty else { return }
        InterstitialAd.load(with: id, request: Request()) { [weak self] ad, error in
            guard let self else { return }
            self.interstitial = ad
            self.loadError = error?.localizedDescription
            self.interstitial?.fullScreenContentDelegate = self
            if let error {
                NSLog("[MookAds] interstitial load failed: %@", error.localizedDescription)
            } else {
                NSLog("[MookAds] interstitial ready testMode=%@", self.isTestMode().description)
                #if targetEnvironment(simulator)
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
                    guard let self, self.isTestMode(), let ad = self.interstitial, let controller = self.bridge?.viewController else { return }
                    ad.fullScreenContentDelegate = self
                    self.interstitial = nil
                    NSLog("[MookAds] simulator diagnostic presenting test interstitial")
                    ad.present(from: controller)
                }
                #endif
            }
        }
    }

    private func privacyOptionsRequired() -> Bool {
        ConsentInformation.shared.privacyOptionsRequirementStatus == .required
    }

    public func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        NSLog("[MookAds] interstitial dismissed")
        isPresenting = false
        presentationCall?.resolve(["shown": true])
        presentationCall = nil
        loadInterstitial()
    }

    public func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        NSLog("[MookAds] interstitial presentation failed: %@", error.localizedDescription)
        isPresenting = false
        presentationCall?.resolve(["shown": false, "reason": "presentation-failed", "detail": error.localizedDescription])
        presentationCall = nil
        loadInterstitial()
    }

    public func adWillPresentFullScreenContent(_ ad: FullScreenPresentingAd) {
        NSLog("[MookAds] interstitial will present")
        isPresenting = true
    }

    public func adDidRecordImpression(_ ad: FullScreenPresentingAd) {
        NSLog("[MookAds] interstitial impression recorded")
    }
}
