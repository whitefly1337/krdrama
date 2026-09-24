import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { safeReturnTo } from "@/lib/authReturnTo";
import { parseAuthParams, signInWithOAuthProvider } from "@/lib/socialAuth";

// Web OAuth landing page. supabase-js has already exchanged ?code= for a
// session by the time this renders (detectSessionInUrl); we only handle errors.
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = parseAuthParams(window.location.href);
    const returnTo = safeReturnTo();

    if (params.error_code === "identity_already_exists") {
      // Linking a guest to this Google account failed because the account
      // already exists: sign into it instead.
      signInWithOAuthProvider("google", returnTo).catch((e) => setError(e.message));
      return;
    }
    if (params.error) {
      setError(params.error_description || params.error);
      return;
    }
    supabase.auth.getSession().then(() => navigate(returnTo, { replace: true }));
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 px-6 text-center">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <p className="text-lg font-semibold text-white">Sign-in failed</p>
        <p className="max-w-sm text-sm text-zinc-400">{error}</p>
        <Link to="/login" className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    </div>
  );
}
