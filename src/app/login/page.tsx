"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError(res.error);
    } else {
      router.replace("/");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <input type="email" required placeholder="Email" className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors" disabled={submitting}>{submitting ? "Signing in..." : "Sign In"}</button>
        
        <div className="flex justify-between items-center text-sm mt-2">
          <a href="/register" className="text-blue-600 hover:underline">Register</a>
          <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
      </form>
    </div>
  );
} 