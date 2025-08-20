"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // Sunday as week start
  return d.toISOString().slice(0, 10);
}

export default function StatsWidget() {
  const { status } = useSession();
  const [habitStats, setHabitStats] = useState({ daysAllDone: 0 });
  const [todoStats, setTodoStats] = useState({ completed: 0 });
  const [goalStats, setGoalStats] = useState({ completed: 0 });

  useEffect(() => {
    const calculateHabitStats = () => {
      const stored = localStorage.getItem("habits");
      if (stored) {
        const habits = JSON.parse(stored);
        const dateMap: Record<string, number> = {};
        habits.forEach((h: any) => {
          if (h.lastChecked) {
            dateMap[h.lastChecked] = (dateMap[h.lastChecked] || 0) + 1;
          }
        });
        const daysAllDone = Object.values(dateMap).filter(v => v === habits.length && habits.length > 0).length;
        setHabitStats({ daysAllDone });
      }
    };

    const fetchTodoStats = () => {
      if (status === "authenticated") {
        fetch("/api/todos").then(res => res.json()).then(todos => {
          const weekStart = getWeekStart();
          const completed = todos.filter((t: any) => t.done && t.date >= weekStart).length;
          setTodoStats({ completed });
        });
      }
    };

    const fetchGoalStats = () => {
      if (status === "authenticated") {
        fetch("/api/goals").then(res => res.json()).then(goals => {
          const weekStart = getWeekStart();
          const completed = goals.filter((g: any) => g.done && (!g.targetDate || g.targetDate >= weekStart)).length;
          setGoalStats({ completed });
        });
      }
    };

    // Initial fetch
    calculateHabitStats();
    fetchTodoStats();
    fetchGoalStats();

    // Listen for updates
    window.addEventListener("habits-updated", calculateHabitStats);
    window.addEventListener("todos-updated", fetchTodoStats);
    window.addEventListener("goals-updated", fetchGoalStats);

    return () => {
      // Cleanup listeners
      window.removeEventListener("habits-updated", calculateHabitStats);
      window.removeEventListener("todos-updated", fetchTodoStats);
      window.removeEventListener("goals-updated", fetchGoalStats);
    };
  }, [status]);

  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6">
      <div className="font-semibold mb-2">Motivational Stats</div>
      <ul className="space-y-2">
        <li className="flex items-center justify-between">
          <span>Days with all habits done</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{habitStats.daysAllDone}</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Todos completed this week</span>
          <span className="font-bold text-green-600 dark:text-green-400">{todoStats.completed}</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Goals completed this week</span>
          <span className="font-bold text-purple-600 dark:text-purple-400">{goalStats.completed}</span>
        </li>
      </ul>
    </section>
  );
} 