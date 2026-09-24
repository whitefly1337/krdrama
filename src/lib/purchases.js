import { Purchases } from "@revenuecat/purchases-capacitor";
import { supabase } from "@/api/supabaseClient";
import { config } from "@/lib/config";
import { isIOS, isNative } from "@/lib/platform";

// RevenueCat handles StoreKit, receipt validation, renewals and refunds. The
// RevenueCat app user id is always the Supabase user id, which is how the
// revenuecat-webhook / sync-subscription edge functions find the user.

let resolveReady;
const readyPromise = new Promise((resolve) => (resolveReady = resolve));
let configuredFor = null;
// Serializes configure/logIn so quick user switches can't configure twice.
let queue = Promise.resolve();

function ready(timeoutMs = 15000) {
  return Promise.race([
    readyPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("In-app purchases are not available right now")), timeoutMs)
    ),
  ]);
}

export function purchasesAvailable() {
  return isNative() && isIOS() && Boolean(config.revenueCatIosKey);
}

// Called by AuthProvider whenever the signed-in (or anonymous) user changes.
export function identifyPurchasesUser(userId) {
  if (!purchasesAvailable() || !userId) return Promise.resolve();
  queue = queue.then(async () => {
    if (configuredFor === userId) return;
    try {
      if (configuredFor === null) {
        await Purchases.configure({ apiKey: config.revenueCatIosKey, appUserID: userId });
        resolveReady();
      } else {
        await Purchases.logIn({ appUserID: userId });
      }
      configuredFor = userId;
    } catch (e) {
      console.error("RevenueCat identify failed", e);
    }
  });
  return queue;
}

// Packages of the "current" offering configured in the RevenueCat dashboard.
export async function getPackages() {
  if (!purchasesAvailable()) return [];
  await ready();
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export function isPurchaseCancelled(error) {
  return error?.userCancelled === true || error?.code === "1";
}

// The store has already charged the user at this point, so a failed sync must
// not surface as a failed purchase: retry briefly, then let the webhook finish.
async function syncWithRetry(attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await syncSubscription();
      if (result?.active) return result;
    } catch (e) {
      console.warn("sync-subscription failed", e);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return { active: false };
}

export async function purchasePackage(aPackage) {
  await ready();
  await Purchases.purchasePackage({ aPackage });
  return syncWithRetry();
}

export async function restorePurchases() {
  await ready();
  await Purchases.restorePurchases();
  return syncWithRetry(1);
}

// Asks the backend to re-read the entitlement from RevenueCat so VIP applies
// immediately; the webhook keeps it current afterwards.
export async function syncSubscription() {
  const { data, error } = await supabase.functions.invoke("sync-subscription");
  if (error) throw error;
  return data; // { active, subscription }
}
