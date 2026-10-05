import Foundation
import Capacitor
import GoogleMobileAds

@objc(MookAdsPlugin)
public final class MookAdsPlugin: CAPPlugin, CAPBridgedPlugin, FullScreenContentDelegate {
    public let identifier = "MookAdsPlugin"
    public let jsName = "MookAds"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showInterstitial", returnType: CAPPluginReturnPromise)
    ]

    private let testInterstitialID = "ca-app-pub-3940256099942544/4411468910"
    private var interstitial: InterstitialAd?
    private var presentationCall: CAPPluginCall?
    private var isEnabled = false

    @objc public func configure(_ call: CAPPluginCall) {
        #if DEBUG
        isEnabled = true
        #else
        isEnabled = Bundle.main.object(forInfoDictionaryKey: "MookAdsEnabled") as? Bool ?? false
        #endif
        guard isEnabled else {
            call.resolve(["configured": false, "reason": "production-disabled"])
            return
        }
        MobileAds.shared.start { [weak self] _ in
            self?.loadInterstitial()
            call.resolve(["configured": true])
        }
    }

    @objc public func showInterstitial(_ call: CAPPluginCall) {
        guard isEnabled, let ad = interstitial, let controller = bridge?.viewController else {
            loadInterstitial()
            call.resolve(["shown": false])
            return
        }
        presentationCall = call
        interstitial = nil
        ad.fullScreenContentDelegate = self
        ad.present(from: controller)
    }

    private func adUnitID() -> String {
        #if DEBUG
        return testInterstitialID
        #else
        return Bundle.main.object(forInfoDictionaryKey: "MookAdMobInterstitialID") as? String ?? ""
        #endif
    }

    private func loadInterstitial() {
        let id = adUnitID()
        guard isEnabled, !id.isEmpty else { return }
        InterstitialAd.load(with: id, request: Request()) { [weak self] ad, _ in
            self?.interstitial = ad
            self?.interstitial?.fullScreenContentDelegate = self
        }
    }

    public func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        presentationCall?.resolve(["shown": true])
        presentationCall = nil
        loadInterstitial()
    }

    public func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        presentationCall?.resolve(["shown": false])
        presentationCall = nil
        loadInterstitial()
    }
}
