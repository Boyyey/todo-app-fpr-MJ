"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Note {
  id: string;
  content: string;
  done: boolean;
}

export default function NotesWidget() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    const res = await fetch("/api/notes");
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchNotes();
  }, [status]);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (status !== "authenticated" || !newNote.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    if (res.ok) {
      setNewNote("");
      fetchNotes();
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Failed to add note");
    }
  };

  const toggleDone = async (id: string, done: boolean) => {
    await fetch("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotes();
  };

  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6">
      <div className="font-semibold mb-2">Quick Notes & Reminders</div>
      {(status !== "authenticated" || loading) ? (
        <div className="text-gray-400 text-center py-4">Loading...</div>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className={`flex items-center justify-between rounded p-2 ${note.done ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200" : "bg-blue-50 dark:bg-gray-800"}`}>
              <button onClick={() => toggleDone(note.id, note.done)} className="mr-2 text-lg focus:outline-none">
                {note.done ? "✔️" : "⬜"}
              </button>
              <span className={`flex-1 text-left ${note.done ? "line-through" : ""}`}>{note.content}</span>
              <button onClick={() => deleteNote(note.id)} className="text-xs text-gray-400 hover:text-red-500 ml-2">✕</button>
            </li>
          ))}
        </ul>
      )}
      <form className="mt-3 flex gap-2" onSubmit={addNote}>
        <input
          className="flex-1 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent"
          placeholder="Add note..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          disabled={status !== "authenticated" || loading}
        />
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" type="submit" disabled={status !== "authenticated" || loading}>Add</button>
      </form>
      {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
    </section>
  );
} 