"use client";
import React, { useEffect, useState } from "react";

const curatedQuotes = [
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  // Philosopher quotes
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Happiness is the highest good.", author: "Aristotle" },
  { text: "He who thinks great thoughts, often makes great errors.", author: "Martin Heidegger" },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre" },
  { text: "I think, therefore I am.", author: "René Descartes" },
  { text: "To live is to suffer, to survive is to find some meaning in the suffering.", author: "Friedrich Nietzsche" },
  { text: "The only thing I know is that I know nothing.", author: "Socrates" },
  { text: "One cannot step twice in the same river.", author: "Heraclitus" },
  { text: "The mind is furnished with ideas by experience alone.", author: "John Locke" },
  { text: "Liberty consists in doing what one desires.", author: "John Stuart Mill" },
];

function getNextQuoteIndex(lastIndex: number, length: number) {
  let nextIndex = Math.floor(Math.random() * length);
  // Ensure we don't repeat the last index
  while (length > 1 && nextIndex === lastIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }
  return nextIndex;
}

export default function QuoteWidget() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  useEffect(() => {
    let lastIndex = Number(localStorage.getItem("lastQuoteIndex"));
    if (isNaN(lastIndex)) lastIndex = -1;
    const idx = getNextQuoteIndex(lastIndex, curatedQuotes.length);
    setQuote(curatedQuotes[idx]);
    localStorage.setItem("lastQuoteIndex", String(idx));
  }, []);

  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6 flex flex-col justify-center items-center">
      {quote ? (
        <>
          <div className="italic text-lg text-center text-gray-700 dark:text-gray-300">“{quote.text}”</div>
          <div className="mt-2 text-xs text-gray-400">— {quote.author}</div>
        </>
      ) : (
        <div className="text-gray-400 py-4">Loading quote...</div>
      )}
    </section>
  );
} 