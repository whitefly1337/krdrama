const env = import.meta.env;

// Must match appId in capacitor.config.json and the URL scheme in Info.plist.
export const BUNDLE_ID = "com.krdrama.app";
export const APP_SCHEME = "krdrama";

export const config = {
  supabaseUrl: env.VITE_SUPABASE_URL,
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY,
  revenueCatIosKey: env.VITE_REVENUECAT_IOS_KEY || "",
  admobRewardedIos: env.VITE_ADMOB_REWARDED_IOS || "",
  admobTesting: env.VITE_ADMOB_TESTING === "true",
  privacyUrl: env.VITE_PRIVACY_URL || "",
  termsUrl: env.VITE_TERMS_URL || "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  supportEmail: env.VITE_SUPPORT_EMAIL || "",
};
