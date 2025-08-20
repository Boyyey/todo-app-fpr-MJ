"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const RADIUS = 60;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProductivityRing() {
  const { data: session, status } = useSession();
  const [percent, setPercent] = useState(0);
  const [animated, setAnimated] = useState(0);
  const [hasTodos, setHasTodos] = useState(false);

  useEffect(() => {
    // Only fetch todos if user is authenticated
    if (status !== "authenticated") {
      setHasTodos(false);
      setPercent(0);
      return;
    }

    const fetchAndSet = () => {
      fetch("/api/todos").then(res => res.json()).then(data => {
        // Check if data is an array (successful response) or an object with error
        if (!Array.isArray(data)) {
          console.error("Failed to fetch todos:", data);
          setHasTodos(false);
          setPercent(0);
          return;
        }
        
        const todos = data;
        const today = getToday();
        const todays = todos.filter((t: any) => t.date === today);
        setHasTodos(todays.length > 0);
        const completed = todays.filter((t: any) => t.done).length;
        const p = todays.length ? Math.round((completed / todays.length) * 100) : 0;
        setPercent(p);
      }).catch(error => {
        console.error("Error fetching todos:", error);
        setHasTodos(false);
        setPercent(0);
      });
    };
    fetchAndSet();
    window.addEventListener("todos-updated", fetchAndSet);
    return () => window.removeEventListener("todos-updated", fetchAndSet);
  }, [status]);

  // Animate the ring
  useEffect(() => {
    let raf: number;
    if (animated !== percent) {
      raf = requestAnimationFrame(() => {
        setAnimated(a => {
          if (a < percent) return Math.min(a + 2, percent);
          if (a > percent) return Math.max(a - 2, percent);
          return a;
        });
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [animated, percent]);

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;
  const gradientId = "prod-ring-gradient";

  return (
    <section className="col-span-1 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6">
      <svg width={150} height={150}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle
          cx={75}
          cy={75}
          r={RADIUS}
          stroke="#e5e7eb"
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          cx={75}
          cy={75}
          r={RADIUS}
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="2.2em"
          fill="#3b82f6"
        >
          {hasTodos ? animated : 0}%
        </text>
      </svg>
      <div className="mt-2 text-lg font-semibold text-center">Daily Productivity</div>
      <div className="text-xs text-gray-500 text-center">
        {!hasTodos
          ? "No tasks for today"
          : percent === 100
            ? "All tasks done!"
            : `${animated}% of today's todos completed`}
      </div>
    </section>
  );
} 