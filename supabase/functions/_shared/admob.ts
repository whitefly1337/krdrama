// Verification of AdMob rewarded-ad server-side verification (SSV) callbacks.
// https://developers.google.com/admob/android/ssv
//
// Google signs everything in the query string before "&signature=" with
// ECDSA P-256 / SHA-256. The signature is DER-encoded, URL-safe base64.

const KEYS_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";
const KEYS_TTL_MS = 60 * 60 * 1000;

type VerifierKey = { keyId: number | string; base64: string };
let cachedKeys: { at: number; keys: VerifierKey[] } | null = null;

async function fetchKeys(force = false): Promise<VerifierKey[]> {
  if (!force && cachedKeys && Date.now() - cachedKeys.at < KEYS_TTL_MS) return cachedKeys.keys;
  const res = await fetch(KEYS_URL);
  if (!res.ok) throw new Error(`AdMob keys fetch failed: ${res.status}`);
  const { keys } = await res.json();
  cachedKeys = { at: Date.now(), keys };
  return keys;
}

export function base64UrlDecode(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// DER `SEQUENCE { INTEGER r, INTEGER s }` → 64-byte r||s that WebCrypto expects.
export function derToRaw(der: Uint8Array): Uint8Array<ArrayBuffer> {
  let i = 0;
  if (der[i++] !== 0x30) throw new Error("bad DER: no sequence");
  if (der[i] & 0x80) i += 1 + (der[i] & 0x7f);
  else i += 1;
  const readInt = () => {
    if (der[i++] !== 0x02) throw new Error("bad DER: no integer");
    const len = der[i++];
    let bytes = der.slice(i, i + len);
    i += len;
    while (bytes.length > 32 && bytes[0] === 0) bytes = bytes.slice(1);
    if (bytes.length > 32) throw new Error("bad DER: integer too long");
    const out = new Uint8Array(32);
    out.set(bytes, 32 - bytes.length);
    return out;
  };
  const raw = new Uint8Array(64);
  raw.set(readInt(), 0);
  raw.set(readInt(), 32);
  return raw;
}

// `rawQuery` is the query string exactly as received (no leading "?"), because
// the signature covers the original encoding.
export async function verifySsvQuery(
  rawQuery: string,
  getKeys: (force?: boolean) => Promise<VerifierKey[]> = fetchKeys,
): Promise<boolean> {
  const sigIndex = rawQuery.indexOf("&signature=");
  if (sigIndex < 0) return false;
  const message = rawQuery.slice(0, sigIndex);
  const params = new URLSearchParams(rawQuery);
  const signature = params.get("signature");
  const keyId = params.get("key_id");
  if (!signature || !keyId) return false;

  let keys = await getKeys();
  let key = keys.find((k) => String(k.keyId) === keyId);
  if (!key) {
    // Google rotates keys; refresh once before giving up.
    keys = await getKeys(true);
    key = keys.find((k) => String(k.keyId) === keyId);
  }
  if (!key) return false;

  const publicKey = await crypto.subtle.importKey(
    "spki",
    Uint8Array.from(atob(key.base64), (c) => c.charCodeAt(0)),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    derToRaw(base64UrlDecode(signature)),
    new TextEncoder().encode(message),
  );
}
