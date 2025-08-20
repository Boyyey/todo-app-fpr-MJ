"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    // Register user
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
      setSubmitting(false);
      return;
    }
    // Auto sign in
    const signInRes = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (signInRes?.error) {
      setError(signInRes.error);
    } else {
      router.replace("/");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-2">Register</h1>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <input type="text" required placeholder="Username" className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="email" required placeholder="Email" className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className="rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors" disabled={submitting}>{submitting ? "Registering..." : "Register"}</button>
        <div className="text-center text-sm mt-2">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign In</a></div>
      </form>
    </div>
  );
} 