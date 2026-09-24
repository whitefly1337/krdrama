import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

// Code-based reset (no email links), so it works identically in the browser
// and inside the iOS app: email → 6-digit code → new password.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Always advance, so the form doesn't reveal which emails have accounts.
    await supabase.auth.resetPasswordForEmail(email).catch(() => {});
    setLoading(false);
    setStep("code");
  };

  const verifyCode = async () => {
    setError("");
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
      if (verifyError) throw verifyError;
      setStep("password");
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const errorBox = error && (
    <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
  );

  const backToLogin = (
    <Link to="/login" className="text-primary font-medium hover:underline">
      <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
    </Link>
  );

  if (step === "code") {
    return (
      <AuthLayout
        icon={Mail}
        title="Check your email"
        subtitle={`If an account exists for ${email}, we sent it a 6-digit code`}
        onBack={() => setStep("email")}
        footer={backToLogin}
      >
        {errorBox}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={verifyCode} disabled={loading || code.length < 6}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
        </Button>
      </AuthLayout>
    );
  }

  if (step === "password") {
    return (
      <AuthLayout icon={Lock} title="New password" subtitle="Enter your new password below">
        {errorBox}
        <form onSubmit={savePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save password"}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll email you a code to reset it"
      onBack={() => navigate(-1)}
      footer={backToLogin}
    >
      {errorBox}
      <form onSubmit={sendCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send code"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
