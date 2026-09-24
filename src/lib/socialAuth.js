import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";
import { supabase } from "@/api/supabaseClient";
import { APP_SCHEME, BUNDLE_ID } from "@/lib/config";
import { isNative } from "@/lib/platform";

// Social sign-in for both the web and the iOS app.
//
// Guests are anonymous Supabase users. When a guest signs in with a provider we
// first try to *link* the identity to the guest account, so coins, unlocks,
// bookmarks and purchases carry over. If that provider account already belongs
// to someone, we fall back to a normal sign-in into that existing account.

const NATIVE_REDIRECT = `${APP_SCHEME}://auth-callback`;

export class AuthCancelledError extends Error {
  constructor() {
    super("Sign-in cancelled");
    this.cancelled = true;
  }
}

async function isGuestSession() {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.user?.is_anonymous);
}

export function webCallbackUrl(returnTo = "/") {
  const url = new URL("/auth/callback", window.location.origin);
  if (returnTo && returnTo !== "/") url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

// Reads OAuth results from both the query string and the fragment.
export function parseAuthParams(urlString) {
  const url = new URL(urlString);
  const params = new URLSearchParams(url.search);
  new URLSearchParams(url.hash.replace(/^#/, "")).forEach((value, key) => params.set(key, value));
  return Object.fromEntries(params.entries());
}

// ---- Native OAuth round trip (in-app browser → krdrama://auth-callback) ----

let pending = null;
let listenersReady = false;

function ensureNativeListeners() {
  if (listenersReady) return;
  listenersReady = true;

  App.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith(NATIVE_REDIRECT)) return;
    const current = pending;
    pending = null;
    await Browser.close().catch(() => {});
    if (!current) return;

    try {
      const params = parseAuthParams(url);
      if (params.error_code === "identity_already_exists" && current.linking) {
        // Give the browser sheet time to finish dismissing before reopening it.
        await new Promise((r) => setTimeout(r, 700));
        startOAuth(current.provider, false).then(current.resolve, current.reject);
        return;
      }
      if (params.error) throw new Error(params.error_description || params.error);
      const { error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      current.resolve();
    } catch (e) {
      current.reject(e);
    }
  });

  Browser.addListener("browserFinished", () => {
    if (!pending) return;
    pending.reject(new AuthCancelledError());
    pending = null;
  });
}

async function startOAuth(provider, link, returnTo = "/") {
  const native = isNative();
  const options = {
    redirectTo: native ? NATIVE_REDIRECT : webCallbackUrl(returnTo),
    skipBrowserRedirect: native,
  };
  const { data, error } = link
    ? await supabase.auth.linkIdentity({ provider, options })
    : await supabase.auth.signInWithOAuth({ provider, options });
  if (error) throw error;

  // On the web the page is navigating to the provider; /auth/callback finishes.
  if (!native) return new Promise(() => {});

  ensureNativeListeners();
  return new Promise((resolve, reject) => {
    pending = { resolve, reject, provider, linking: link };
    Browser.open({ url: data.url, presentationStyle: "popover" }).catch((e) => {
      pending = null;
      reject(e);
    });
  });
}

// Web: navigates away. Native: resolves once the session is established.
export async function signInWithGoogle(returnTo = "/") {
  return startOAuth("google", await isGuestSession(), returnTo);
}

// Used by /auth/callback on the web when linking hit an existing account.
export function signInWithOAuthProvider(provider, returnTo = "/") {
  return startOAuth(provider, false, returnTo);
}

// ---- Sign in with Apple (native sheet, iOS) ----

function randomNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function appleAuthorize(nonce) {
  return SignInWithApple.authorize({
    clientId: BUNDLE_ID,
    redirectURI: "https://localhost", // ignored by the native iOS flow
    scopes: "email name",
    nonce,
  }).catch((e) => {
    // ASAuthorizationError.canceled (1001)
    if (String(e?.message ?? e).includes("1001")) throw new AuthCancelledError();
    throw e;
  });
}

export async function signInWithApple() {
  const rawNonce = randomNonce();
  const { response } = await appleAuthorize(await sha256Hex(rawNonce));
  const credentials = { provider: "apple", token: response.identityToken, nonce: rawNonce };

  let linked = false;
  if (await isGuestSession()) {
    const { error } = await supabase.auth.linkIdentity(credentials);
    linked = !error;
  }
  if (!linked) {
    const { error } = await supabase.auth.signInWithIdToken(credentials);
    if (error) throw error;
  }

  // Apple only shares the name on the very first authorization.
  const fullName = [response.givenName, response.familyName].filter(Boolean).join(" ");
  if (fullName) await supabase.auth.updateUser({ data: { full_name: fullName } });
}

// A fresh authorization code lets the delete-account function revoke the
// user's Apple tokens, as App Review requires.
export async function getAppleAuthorizationCode() {
  const { response } = await appleAuthorize(undefined);
  return response.authorizationCode;
}
