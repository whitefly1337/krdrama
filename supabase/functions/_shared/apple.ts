// Sign in with Apple token revocation, required by App Store guideline 5.1.1(v)
// when a user deletes an account created with Apple.
// https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens

const enc = new TextEncoder();
const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function pemToDer(pem: string): Uint8Array<ArrayBuffer> {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\\n/g, "").replace(/\s+/g, "");
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

// ES256 JWT signed with the .p8 key from Apple Developer → Keys.
export async function appleClientSecret(opts: {
  teamId: string;
  keyId: string;
  clientId: string;
  privateKeyPem: string;
}): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(opts.privateKeyPem),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(enc.encode(JSON.stringify({ alg: "ES256", kid: opts.keyId })));
  const payload = b64url(
    enc.encode(
      JSON.stringify({
        iss: opts.teamId,
        iat: now,
        exp: now + 300,
        aud: "https://appleid.apple.com",
        sub: opts.clientId,
      }),
    ),
  );
  // WebCrypto ECDSA already returns the raw r||s form that JWS expects.
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${header}.${payload}`)),
  );
  return `${header}.${payload}.${b64url(sig)}`;
}

// Exchanges a fresh authorization code for a refresh token and revokes it.
// Returns false (without throwing) when Apple rejects the request, so account
// deletion itself is never blocked by Apple being unreachable.
export async function revokeAppleAuthorizationCode(code: string): Promise<boolean> {
  const teamId = Deno.env.get("APPLE_TEAM_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const clientId = Deno.env.get("APPLE_CLIENT_ID");
  const privateKeyPem = Deno.env.get("APPLE_PRIVATE_KEY");
  if (!teamId || !keyId || !clientId || !privateKeyPem) {
    console.warn("Apple revocation skipped: APPLE_* secrets are not set");
    return false;
  }

  const clientSecret = await appleClientSecret({ teamId, keyId, clientId, privateKeyPem });

  const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!tokenRes.ok) {
    console.error("Apple token exchange failed", tokenRes.status, await tokenRes.text());
    return false;
  }
  const { refresh_token, access_token } = await tokenRes.json();
  const token = refresh_token ?? access_token;
  if (!token) return false;

  const revokeRes = await fetch("https://appleid.apple.com/auth/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token,
      token_type_hint: refresh_token ? "refresh_token" : "access_token",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!revokeRes.ok) {
    console.error("Apple revoke failed", revokeRes.status, await revokeRes.text());
    return false;
  }
  return true;
}
