"use client";
import React, { useEffect, useState } from "react";

interface Habit {
  name: string;
  streak: number;
  lastChecked: string; // ISO date string
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitTrackerWidget() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const today = getToday();

  useEffect(() => {
    const stored = localStorage.getItem("habits");
    if (stored) setHabits(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
    window.dispatchEvent(new Event("habits-updated")); // Dispatch event on change
  }, [habits]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits([...habits, { name: newHabit.trim(), streak: 0, lastChecked: "" }]);
    setNewHabit("");
  };

  const toggleHabit = (idx: number) => {
    setHabits(habits => habits.map((h, i) => {
      if (i !== idx) return h;
      if (h.lastChecked === today) return h; // already checked today
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = h.lastChecked === yesterday ? h.streak + 1 : 1;
      return { ...h, streak: newStreak, lastChecked: today };
    }));
  };

  const resetHabit = (idx: number) => {
    setHabits(habits => habits.map((h, i) => i === idx ? { ...h, streak: 0, lastChecked: "" } : h));
  };

  const deleteHabit = (idx: number) => {
    setHabits(habits => habits.filter((_, i) => i !== idx));
  };

  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6">
      <div className="font-semibold mb-2">Habit Tracker</div>
      <form className="flex gap-2 mb-3" onSubmit={addHabit}>
        <input
          className="flex-1 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent"
          placeholder="Add habit..."
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" type="submit">Add</button>
      </form>
      {habits.length === 0 ? (
        <div className="text-gray-400 text-center py-4">No habits yet.</div>
      ) : (
        <ul className="space-y-2">
          {habits.map((habit, idx) => (
            <li key={habit.name} className="flex items-center gap-2 bg-blue-50 dark:bg-gray-800 rounded p-2">
              <input
                type="checkbox"
                checked={habit.lastChecked === today}
                onChange={() => toggleHabit(idx)}
                className="accent-blue-500"
              />
              <span className="flex-1">{habit.name}</span>
              <span className="text-xs text-green-600 dark:text-green-300">Streak: {habit.streak}</span>
              <button onClick={() => resetHabit(idx)} className="text-xs text-gray-400 hover:text-yellow-500 ml-2">Reset</button>
              <button onClick={() => deleteHabit(idx)} className="text-xs text-gray-400 hover:text-red-500 ml-2">✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
} 