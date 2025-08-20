"use client";
import React, { useEffect, useState } from "react";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDate(date: Date) {
  return date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function TimeWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6 flex flex-col items-center">
      <div className="text-3xl font-bold mb-1">{formatTime(now)}</div>
      <div className="text-sm text-gray-500 mb-2">{formatDate(now)}</div>
    </section>
  );
} 