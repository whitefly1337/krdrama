import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { supabase } from "@/api/supabaseClient";
import { initAds } from "@/lib/admob";
import { isNative } from "@/lib/platform";

// One-time native shell setup; a no-op on the web.
export function initNativeShell() {
  if (!isNative()) return;

  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

  // Supabase's timer-based token refresh stops while iOS suspends the app.
  App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

// Called after the first render so the splash fades into real content.
export async function onAppReady() {
  if (!isNative()) return;
  await SplashScreen.hide().catch(() => {});
  initAds();
}
