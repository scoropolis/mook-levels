import Foundation
import Capacitor
import StoreKit

@objc(MookCommercePlugin)
public final class MookCommercePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MookCommercePlugin"
    public let jsName = "MookCommerce"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "acknowledge", returnType: CAPPluginReturnPromise)
    ]

    private let allowedProductIDs: Set<String> = [
        "com.skygardenapps.mookworlds.power.sky.5",
        "com.skygardenapps.mookworlds.power.sun.5",
        "com.skygardenapps.mookworlds.power.rock.5",
        "com.skygardenapps.mookworlds.power.time.5",
        "com.skygardenapps.mookworlds.power.bundle.12",
        "com.skygardenapps.mookworlds.removeads"
    ]
    private let removeAdsID = "com.skygardenapps.mookworlds.removeads"

    @objc public func getProducts(_ call: CAPPluginCall) {
        let requested = Set(call.getArray("ids", String.self) ?? []).intersection(allowedProductIDs)
        Task {
            do {
                let products = try await Product.products(for: requested)
                let payload: [[String: Any]] = products.map { product in
                    ["id": product.id, "displayName": product.displayName, "description": product.description, "displayPrice": product.displayPrice]
                }
                call.resolve(["products": payload, "removeAds": await ownsRemoveAds(), "pending": await pendingDeliveries()])
            } catch {
                call.reject("Unable to load StoreKit products", nil, error)
            }
        }
    }

    @objc public func purchase(_ call: CAPPluginCall) {
        guard let productID = call.getString("productId"), allowedProductIDs.contains(productID) else {
            call.reject("Unknown product identifier")
            return
        }
        Task { @MainActor in
            do {
                guard let product = try await Product.products(for: [productID]).first else {
                    call.reject("Product is not configured in the current StoreKit environment")
                    return
                }
                let result: Product.PurchaseResult
                if #available(iOS 18.2, *) {
                    guard let viewController = bridge?.viewController else {
                        call.reject("Apple checkout could not find the active app screen")
                        return
                    }
                    result = try await product.purchase(confirmIn: viewController)
                } else {
                    result = try await product.purchase()
                }
                switch result {
                case .success(let verification):
                    let transaction = try verified(verification)
                    call.resolve(["cancelled": false, "deliveries": [delivery(for: transaction)]])
                case .userCancelled:
                    call.resolve(["cancelled": true, "deliveries": []])
                case .pending:
                    call.resolve(["cancelled": false, "pending": true, "deliveries": []])
                @unknown default:
                    call.reject("Unsupported StoreKit purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)", nil, error)
            }
        }
    }

    @objc public func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(["removeAds": await ownsRemoveAds(), "pending": await pendingDeliveries()])
            } catch {
                call.reject("Restore failed", nil, error)
            }
        }
    }

    @objc public func acknowledge(_ call: CAPPluginCall) {
        guard let transactionID = call.getString("transactionId"), let id = UInt64(transactionID) else {
            call.reject("Invalid transaction identifier")
            return
        }
        Task {
            for await result in Transaction.unfinished {
                if let transaction = try? verified(result), transaction.id == id {
                    await transaction.finish()
                    call.resolve()
                    return
                }
            }
            call.resolve()
        }
    }

    private func pendingDeliveries() async -> [[String: Any]] {
        var deliveries: [[String: Any]] = []
        for await result in Transaction.unfinished {
            if let transaction = try? verified(result), allowedProductIDs.contains(transaction.productID) {
                deliveries.append(delivery(for: transaction))
            }
        }
        return deliveries
    }

    private func ownsRemoveAds() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if let transaction = try? verified(result), transaction.productID == removeAdsID, transaction.revocationDate == nil {
                return true
            }
        }
        return false
    }

    private func delivery(for transaction: Transaction) -> [String: Any] {
        ["productId": transaction.productID, "transactionId": String(transaction.id)]
    }

    private func verified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let value): return value
        case .unverified(_, let error): throw error
        }
    }
}
