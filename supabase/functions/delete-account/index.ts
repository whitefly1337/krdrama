// In-app account deletion (App Store guideline 5.1.1(v)). Deleting the auth
// user cascades to every row that references it.
import { adminClient, corsHeaders, getCaller, json } from "../_shared/supabase.ts";
import { revokeAppleAuthorizationCode } from "../_shared/apple.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    if (!caller) return json({ error: "unauthorized" }, 401);

    const { apple_authorization_code } = await req.json().catch(() => ({}));
    let appleRevoked: boolean | null = null;
    if (typeof apple_authorization_code === "string" && apple_authorization_code) {
      appleRevoked = await revokeAppleAuthorizationCode(apple_authorization_code).catch((e) => {
        console.error("Apple revocation error", e);
        return false;
      });
    }

    const { error } = await admin.auth.admin.deleteUser(caller.id);
    if (error) throw error;

    return json({ ok: true, apple_revoked: appleRevoked });
  } catch (e) {
    console.error("delete-account", e);
    return json({ error: "internal_error" }, 500);
  }
});
