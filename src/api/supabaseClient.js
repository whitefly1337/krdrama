import { createClient } from "@supabase/supabase-js";
import { Preferences } from "@capacitor/preferences";
import { config } from "@/lib/config";
import { isNative } from "@/lib/platform";

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set (see .env.example)");
}

// iOS may evict WKWebView localStorage under storage pressure; Preferences
// (UserDefaults) keeps the session for the life of the install.
const nativeStorage = {
  getItem: async (key) => (await Preferences.get({ key })).value,
  setItem: (key, value) => Preferences.set({ key, value }),
  removeItem: (key) => Preferences.remove({ key }),
};

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    // Native OAuth returns through a deep link handled in socialAuth.js.
    detectSessionInUrl: !isNative(),
    storage: isNative() ? nativeStorage : undefined,
  },
});
