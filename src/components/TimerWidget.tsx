"use client";
import React, { useEffect, useRef, useState } from "react";

interface Timer {
  id: string;
  name: string;
  type: "countdown" | "stopwatch" | "alarm";
  duration: number; // seconds for countdown, 0 for stopwatch, ms until alarm for alarm
  remaining: number; // seconds
  running: boolean;
  targetTime?: number; // timestamp for alarm
  createdAt: number;
}

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
}

export default function TimerWidget() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"countdown" | "stopwatch" | "alarm">("countdown");
  const [duration, setDuration] = useState(0); // seconds
  const [alarmTime, setAlarmTime] = useState("");
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(timers => timers.map(timer => {
        if (!timer.running) return timer;
        if (timer.type === "countdown") {
          if (timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          } else {
            if (timer.running) notify(timer.name);
            return { ...timer, running: false, remaining: 0 };
          }
        } else if (timer.type === "stopwatch") {
          return { ...timer, remaining: timer.remaining + 1 };
        } else if (timer.type === "alarm") {
          const now = Date.now();
          if (timer.targetTime && now >= timer.targetTime) {
            if (timer.running) notify(timer.name);
            return { ...timer, running: false, remaining: 0 };
          } else {
            return { ...timer, remaining: Math.max(0, Math.floor((timer.targetTime! - now) / 1000)) };
          }
        }
        return timer;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Notification
  function notify(label: string) {
    if (audioRef.current) audioRef.current.play();
    if (window.Notification && Notification.permission === "granted") {
      new Notification(`Timer: ${label}`, { body: "Time's up!" });
    }
  }
  useEffect(() => {
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Add timer
  const addTimer = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name required");
    if (type === "countdown" && duration <= 0) return setError("Set a duration");
    if (type === "alarm" && !alarmTime) return setError("Set alarm time");
    let timer: Timer;
    if (type === "countdown") {
      timer = {
        id: Math.random().toString(36).slice(2),
        name,
        type,
        duration,
        remaining: duration,
        running: true,
        createdAt: Date.now(),
      };
    } else if (type === "stopwatch") {
      timer = {
        id: Math.random().toString(36).slice(2),
        name,
        type,
        duration: 0,
        remaining: 0,
        running: true,
        createdAt: Date.now(),
      };
    } else {
      // alarm
      const now = new Date();
      const [h, m] = alarmTime.split(":").map(Number);
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0).getTime();
      timer = {
        id: Math.random().toString(36).slice(2),
        name,
        type,
        duration: 0,
        remaining: Math.max(0, Math.floor((target - now.getTime()) / 1000)),
        running: true,
        targetTime: target,
        createdAt: Date.now(),
      };
    }
    setTimers(t => [...t, timer]);
    setName("");
    setDuration(0);
    setAlarmTime("");
  };

  // Timer controls
  const pause = (id: string) => setTimers(t => t.map(timer => timer.id === id ? { ...timer, running: false } : timer));
  const resume = (id: string) => setTimers(t => t.map(timer => timer.id === id ? { ...timer, running: true } : timer));
  const reset = (id: string) => setTimers(t => t.map(timer => {
    if (timer.id !== id) return timer;
    if (timer.type === "countdown") return { ...timer, remaining: timer.duration, running: false };
    if (timer.type === "stopwatch") return { ...timer, remaining: 0, running: false };
    if (timer.type === "alarm") return { ...timer, remaining: timer.remaining, running: false };
    return timer;
  }));
  const remove = (id: string) => setTimers(t => t.filter(timer => timer.id !== id));

  return (
    <section className="col-span-1 md:col-span-2 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6 mt-2">
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
      <div className="font-semibold mb-2">Timers & Alarms</div>
      <form className="flex flex-col sm:flex-row gap-2 mb-4" onSubmit={addTimer}>
        <input
          className="rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent flex-1"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <select className="rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent" value={type} onChange={e => setType(e.target.value as any)}>
          <option value="countdown">Countdown</option>
          <option value="stopwatch">Stopwatch</option>
          <option value="alarm">Alarm</option>
        </select>
        {type === "countdown" && (
          <input
            type="number"
            min={1}
            className="rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent w-24"
            placeholder="Seconds"
            value={duration || ""}
            onChange={e => setDuration(Number(e.target.value))}
          />
        )}
        {type === "alarm" && (
          <input
            type="time"
            className="rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent w-28"
            value={alarmTime}
            onChange={e => setAlarmTime(e.target.value)}
          />
        )}
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" type="submit">Add</button>
      </form>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <ul className="space-y-3">
        {timers.map(timer => (
          <li key={timer.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-blue-50 dark:bg-gray-800 rounded p-3 shadow">
            <div className="flex-1">
              <div className="font-semibold text-lg">{timer.name}</div>
              <div className="text-2xl font-mono">
                {timer.type === "alarm" ? "Alarm at " + new Date(timer.targetTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : formatTime(timer.remaining)}
              </div>
              <div className="text-xs text-gray-500 capitalize">{timer.type}</div>
            </div>
            <div className="flex gap-2">
              {timer.running ? (
                <button className="px-2 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500" onClick={() => pause(timer.id)}>Pause</button>
              ) : (
                <button className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600" onClick={() => resume(timer.id)}>Resume</button>
              )}
              <button className="px-2 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => reset(timer.id)}>Reset</button>
              <button className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600" onClick={() => remove(timer.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
} 