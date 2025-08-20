"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Goal {
  id: string;
  content: string;
  category: string;
  done: boolean;
}

const categories = ["Work", "Personal", "Health", "Other"];

export default function GoalsWidget() {
  const { data: session, status } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchGoals = async () => {
    setLoading(true);
    const res = await fetch("/api/goals");
    if (res.ok) {
      const data = await res.json();
      setGoals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchGoals();
  }, [status]);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (status !== "authenticated" || !newGoal.trim()) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newGoal, category }),
    });
    if (res.ok) {
      setNewGoal("");
      setCategory(categories[0]);
      fetchGoals();
      window.dispatchEvent(new Event("goals-updated")); // Dispatch event
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Failed to add goal");
    }
  };

  const toggleDone = async (id: string, done: boolean) => {
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    fetchGoals();
    window.dispatchEvent(new Event("goals-updated")); // Dispatch event
  };

  const deleteGoal = async (id: string) => {
    await fetch("/api/goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchGoals();
    window.dispatchEvent(new Event("goals-updated")); // Dispatch event
  };

  return (
    <section className="col-span-1 md:col-span-2 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6 mt-2">
      <div className="font-semibold mb-2">Daily Goals</div>
      {(status !== "authenticated" || loading) ? (
        <div className="text-gray-400 text-center py-4">Loading...</div>
      ) : goals.length === 0 ? (
        <div className="text-gray-400 text-center py-4">No goals yet.</div>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {goals.map((goal) => (
            <li key={goal.id} className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${goal.done ? "bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-200" : "bg-blue-50 dark:bg-gray-800 text-blue-900 dark:text-blue-200"}`}>
              <button onClick={() => toggleDone(goal.id, goal.done)} className="mr-1 text-lg focus:outline-none">
                {goal.done ? "✔️" : "⬜"}
              </button>
              <span className={`flex-1 ${goal.done ? "line-through" : ""}`}>{goal.content}</span>
              <span className="ml-2 text-xs text-gray-400">({goal.category})</span>
              <button onClick={() => deleteGoal(goal.id)} className="text-xs text-gray-400 hover:text-red-500 ml-2">✕</button>
            </li>
          ))}
        </ul>
      )}
      <form className="mt-3 flex flex-col sm:flex-row gap-2" onSubmit={addGoal}>
        <input
          className="flex-1 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent"
          placeholder="Add goal..."
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          disabled={status !== "authenticated" || loading}
        />
        <select
          className="rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={status !== "authenticated" || loading}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" type="submit" disabled={status !== "authenticated" || loading}>Add</button>
      </form>
      {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
    </section>
  );
} 