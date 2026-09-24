import { AdMob, AdmobConsentStatus, RewardAdPluginEvents } from "@capacitor-community/admob";
import { config } from "@/lib/config";
import { isNative } from "@/lib/platform";

// Google's public test unit for iOS rewarded ads.
const TEST_REWARDED_IOS = "ca-app-pub-3940256099942544/1712485313";

let initPromise = null;

export function adsAvailable() {
  return isNative() && (config.admobTesting || Boolean(config.admobRewardedIos));
}

// Consent (GDPR/UMP) → App Tracking Transparency → SDK init. Called once at
// startup so the ATT prompt appears on launch, where App Review expects it.
export function initAds() {
  if (!adsAvailable()) return Promise.resolve();
  initPromise ??= (async () => {
    try {
      const consent = await AdMob.requestConsentInfo();
      if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
        await AdMob.showConsentForm();
      }
    } catch (e) {
      console.warn("AdMob consent", e);
    }
    try {
      const { status } = await AdMob.trackingAuthorizationStatus();
      if (status === "notDetermined") await AdMob.requestTrackingAuthorization();
    } catch (e) {
      console.warn("ATT", e);
    }
    await AdMob.initialize({ initializeForTesting: config.admobTesting });
  })();
  return initPromise;
}

// Shows a rewarded ad. Coins are NOT granted here: AdMob calls our admob-ssv
// edge function with a signed callback carrying `userId`. Resolves true if the
// user earned the reward, false if they closed the ad early.
export async function showRewardedAd(userId) {
  if (!adsAvailable()) throw new Error("Rewarded ads are only available in the app");
  await initAds();

  await AdMob.prepareRewardVideoAd({
    adId: config.admobTesting && !config.admobRewardedIos ? TEST_REWARDED_IOS : config.admobRewardedIos,
    isTesting: config.admobTesting,
    ssv: { userId },
  });

  // showRewardVideoAd only resolves when a reward is earned, so also watch for
  // the ad being dismissed without one.
  let dismissHandle;
  const dismissed = new Promise((resolve) => {
    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => resolve(false)).then((h) => {
      dismissHandle = h;
    });
  });
  try {
    return await Promise.race([AdMob.showRewardVideoAd().then(() => true), dismissed]);
  } finally {
    dismissHandle?.remove();
  }
}
