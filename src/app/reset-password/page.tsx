"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No reset token found. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to reset password.");
    } else {
      setMessage(data.message || "Password has been successfully reset.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-500 text-sm text-center">{message}</div>}
        
        <input 
          type="password" 
          required 
          placeholder="New Password" 
          className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          disabled={!token || !!message}
        />
        <input 
          type="password" 
          required 
          placeholder="Confirm New Password" 
          className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          disabled={!token || !!message}
        />
        
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors disabled:bg-gray-400" 
          disabled={submitting || !token || !!message}
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>

        {message && (
          <div className="text-center text-sm mt-2">
            <a href="/login" className="text-blue-600 hover:underline">Proceed to Sign In</a>
          </div>
        )}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
} 