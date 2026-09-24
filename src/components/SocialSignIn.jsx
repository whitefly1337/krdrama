import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { signInWithApple, signInWithGoogle } from "@/lib/socialAuth";
import { isIOS, isNative } from "@/lib/platform";

function AppleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.37 12.54c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66ZM14.1 5.79c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.76-.96 2.8 1.02.08 2.05-.52 2.68-1.28Z" />
    </svg>
  );
}

// Apple + Google buttons. `onSuccess` runs once a session exists (native);
// on the web Google navigates away and /auth/callback takes over.
export default function SocialSignIn({ returnTo = "/", onSuccess, onError }) {
  const [busy, setBusy] = useState(null);
  const showApple = isNative() && isIOS();

  const run = async (provider, fn) => {
    setBusy(provider);
    onError?.("");
    try {
      await fn();
      onSuccess?.();
    } catch (e) {
      if (!e?.cancelled) onError?.(e?.message || "Sign-in failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {showApple && (
        <Button
          className="w-full h-12 text-sm font-medium bg-white text-black hover:bg-white/90"
          disabled={busy !== null}
          onClick={() => run("apple", signInWithApple)}
        >
          {busy === "apple" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <AppleIcon className="w-5 h-5 mr-2" />}
          Continue with Apple
        </Button>
      )}
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium"
        disabled={busy !== null}
        onClick={() => run("google", () => signInWithGoogle(returnTo))}
      >
        {busy === "google" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <GoogleIcon className="w-5 h-5 mr-2" />}
        Continue with Google
      </Button>
    </div>
  );
}
