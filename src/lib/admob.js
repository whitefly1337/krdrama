// AdMob Rewarded Video helper
// The @capacitor-community/admob plugin is installed during native build.
// On web, rewarded ads are not available.

export function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  const cap = window.Capacitor;
  if (!cap) return false;
  if (typeof cap.isNativePlatform === 'function') return cap.isNativePlatform();
  return cap.platform && cap.platform !== 'web';
}

export async function showRewardedVideoAd(adUnitId) {
  if (!isNativePlatform()) {
    throw new Error('Rewarded ads are only available in the native app');
  }
  const cap = window.Capacitor;
  const AdMob = cap.Plugins?.AdMob;
  if (!AdMob) throw new Error('AdMob plugin not available');

  await AdMob.prepareRewardVideoAd({ adUnitID: adUnitId });
  const reward = await AdMob.showRewardVideoAd();
  return reward;
}