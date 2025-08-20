"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setName(data.name || session?.user?.name || "");
          setBirthday(data.birthday || "");
          setLoading(false);
        });
    }
  }, [open, session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthday }),
    });

    if (res.ok) {
      setMessage("Profile saved successfully!");
      // Update the session to reflect the new name immediately
      await update({ name });
    } else {
      setMessage("Failed to save profile.");
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">×</button>
        <h2 className="text-xl font-bold mb-4 text-center">Edit Profile</h2>
        
        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {message && <div className="text-center text-green-500 text-sm mb-2">{message}</div>}

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="Your Name" 
              className="mt-1 block w-full rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birthday</label>
            <input 
              id="birthday"
              type="date" 
              className="mt-1 block w-full rounded px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent" 
              value={birthday} 
              onChange={e => setBirthday(e.target.value)} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors" 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
} 