"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to send reset link.");
    } else {
      setMessage(data.message || "A password reset link has been sent to your email.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-center text-sm text-gray-500 mb-2">Enter your email and we'll send you a link to reset your password.</p>
        
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-500 text-sm text-center">{message}</div>}
        
        <input 
          type="email" 
          required 
          placeholder="Email" 
          className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          disabled={!!message} // Disable after success
        />
        
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors disabled:bg-gray-400" 
          disabled={submitting || !!message}
        >
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="text-center text-sm mt-2">
          <a href="/login" className="text-blue-600 hover:underline">Back to Sign In</a>
        </div>
      </form>
    </div>
  );
} 