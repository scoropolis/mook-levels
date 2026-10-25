import Capacitor

final class MookBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(MookCommercePlugin())
        bridge?.registerPluginInstance(MookAdsPlugin())
    }
}
