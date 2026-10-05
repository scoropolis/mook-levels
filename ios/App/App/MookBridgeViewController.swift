import Capacitor

final class MookBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginType(MookCommercePlugin.self)
        bridge?.registerPluginType(MookAdsPlugin.self)
    }
}
