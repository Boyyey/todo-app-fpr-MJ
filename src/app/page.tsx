"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Confetti from "react-confetti";
import NotesWidget from "../components/NotesWidget";
import TodosWidget from "../components/TodosWidget";
import GoalsWidget from "../components/GoalsWidget";
import TimeWidget from "../components/TimeWidget";
import WeatherWidget from "../components/WeatherWidget";
import QuoteWidget from "../components/QuoteWidget";
import ProfileModal from "../components/ProfileModal";
import { useTheme } from "../components/ThemeProvider";
import TimerWidget from "../components/TimerWidget";
import HabitTrackerWidget from "../components/HabitTrackerWidget";
import StatsWidget from "../components/StatsWidget";
import ProductivityRing from "../components/ProductivityRing";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name?: string; birthday?: string }>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [showBirthdayUI, setShowBirthdayUI] = useState(false); // State for banner and confetti visibility
  const [recycleConfetti, setRecycleConfetti] = useState(false);
  const { theme, setTheme } = useTheme();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated") {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);

          let isTodayBirthday = false; // Default to false
          if (data.birthday) {
            const today = new Date();
            const birthDate = new Date(data.birthday + 'T00:00:00');
            isTodayBirthday = today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
          }
          
          // Now, explicitly set the state based on the check
          if (isTodayBirthday) {
            if (!isBirthday) { // Only trigger if it wasn't already the birthday
              setIsBirthday(true);
              setShowBirthdayUI(true);
              setRecycleConfetti(true);
            }
          } else {
            // This is the crucial fix: turn off the UI if it's not the birthday
            setIsBirthday(false);
            setShowBirthdayUI(false);
            setRecycleConfetti(false);
          }
        }
      }
    };
    fetchProfile();
  }, [status, profileOpen, isBirthday]); // Added isBirthday to dependency array

  // Effect to stop confetti and hide banner after a delay
  useEffect(() => {
    if (isBirthday) {
      const timer = setTimeout(() => {
        setRecycleConfetti(false);
        setShowBirthdayUI(false); // Hide UI
      }, 15000); // Stop after 15 seconds

      return () => clearTimeout(timer);
    }
  }, [isBirthday]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 min-h-screen">
      {showBirthdayUI && <Confetti width={windowSize.width} height={windowSize.height} recycle={recycleConfetti} />}
      <header className="w-full max-w-3xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setProfileOpen(true)} className="w-12 h-12 rounded-full bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-300 font-bold text-xl flex items-center justify-center">
            {profile.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
          </button>
          <div>
            <div className="font-semibold text-lg">Welcome, <span className="text-blue-600 dark:text-blue-400">{profile.name || session?.user?.name || session?.user?.email}</span></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Your daily dashboard</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span className="sr-only">Toggle theme</span>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 transition-colors ml-2"
            title="Sign out"
            onClick={async () => { await signOut({ callbackUrl: '/login' }); }}
          >
            <span className="sr-only">Sign out</span>
            ⎋
          </button>
        </div>
      </header>
      {showBirthdayUI && (
        <div className="w-full max-w-3xl mb-4 p-4 rounded-xl bg-gradient-to-r from-pink-200 via-yellow-100 to-green-200 dark:from-pink-900 dark:via-yellow-900 dark:to-green-900 text-center text-lg font-semibold shadow animate-pulse">
          🎉 Happy Birthday, {profile.name || session?.user?.name || session?.user?.email}! 🎂
        </div>
      )}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      
      <main className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeWidget />
        <WeatherWidget city={profile?.city} accentColor={profile?.accent_color} />
        <QuoteWidget />
        <NotesWidget />
        <TodosWidget />
        <ProductivityRing />
        <GoalsWidget />
        <TimerWidget />
      </main>

      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 mt-6 mx-auto">
        <div className="flex-1"><HabitTrackerWidget /></div>
        <div className="flex-1"><StatsWidget /></div>
      </div>
    </div>
  );
}
