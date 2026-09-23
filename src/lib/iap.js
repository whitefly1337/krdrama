// IAP product IDs — create these in App Store Connect and Google Play Console
export const IAP_PRODUCTS = {
  weekly: "com.dramapulse.vip.weekly",
  monthly: "com.dramapulse.vip.monthly",
  yearly: "com.dramapulse.vip.yearly",
};

export const PLAN_DAYS = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

// Check if native IAP is available (Capacitor plugin installed in external wrapper)
export function isIAPAvailable() {
  return (
    typeof window !== "undefined" &&
    window.Capacitor &&
    window.Capacitor.isNative &&
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.InAppPurchases
  );
}

function getIAPPlugin() {
  if (!isIAPAvailable()) return null;
  return window.Capacitor.Plugins.InAppPurchases;
}

// Fetch product details (price, title) from the store
export async function fetchProducts(productIds) {
  const IAP = getIAPPlugin();
  if (!IAP) return [];
  try {
    const result = await IAP.requestProducts({ productIds });
    return result.products || [];
  } catch (e) {
    console.error("IAP fetchProducts error:", e);
    return [];
  }
}

// Start a purchase for a product ID
// Returns { receipt, platform } on success
export async function purchaseSubscription(productId) {
  const IAP = getIAPPlugin();
  if (!IAP) {
    throw new Error("In-app purchases are only available in the native app.");
  }
  const result = await IAP.purchase({ productId });
  // The result contains the transaction/receipt data
  // Structure varies by plugin version — adapt to your installed plugin
  const receipt = result.receipt || result.transactionReceipt || result.data?.receipt || JSON.stringify(result);
  const platform = window.Capacitor.getPlatform();
  return { receipt, platform };
}

// Restore previous purchases
export async function restorePurchases() {
  const IAP = getIAPPlugin();
  if (!IAP) {
    throw new Error("In-app purchases are only available in the native app.");
  }
  const result = await IAP.restorePurchases();
  return result.purchases || result.transactions || [];
}