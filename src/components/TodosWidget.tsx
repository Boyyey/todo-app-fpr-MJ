"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Todo {
  id: string;
  content: string;
  done: boolean;
  date: string;
}

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function TodosWidget() {
  const { status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const today = getToday();

  const fetchTodos = async () => {
    setLoading(true);
    if (status === "authenticated") {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line
  }, [status]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (status !== "authenticated" || !newTodo.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newTodo, date: today }),
    });
    if (res.ok) {
      setNewTodo("");
      fetchTodos();
      window.dispatchEvent(new Event("todos-updated"));
    } else {
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Unknown error" };
      }
      setErrorMsg((data as any).error || "Failed to add todo");
    }
  };

  const toggleDone = async (id: string, done: boolean) => {
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    fetchTodos();
    window.dispatchEvent(new Event("todos-updated"));
  };

  const deleteTodo = async (id: string) => {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchTodos();
    window.dispatchEvent(new Event("todos-updated"));
  };

  const todaysTodos = todos.filter(t => t.date === today);
  const completed = todaysTodos.filter(t => t.done).length;
  const percent = todaysTodos.length ? Math.round((completed / todaysTodos.length) * 100) : 0;

  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6">
      <div className="font-semibold mb-2">To-Do List</div>
      {loading ? (
        <div className="text-gray-400 text-center py-4">Loading...</div>
      ) : (
        <ul className="space-y-2">
          {todaysTodos.map((todo) => (
            <li key={todo.id} className={`flex items-center gap-2 ${todo.done ? "line-through text-green-700 dark:text-green-200" : ""}`}>
              <input type="checkbox" checked={todo.done} onChange={() => toggleDone(todo.id, todo.done)} className="accent-blue-500" />
              <span className="flex-1">{todo.content}</span>
              <button onClick={() => deleteTodo(todo.id)} className="text-xs text-gray-400 hover:text-red-500 ml-2">✕</button>
            </li>
          ))}
        </ul>
      )}
      <form className="mt-3 flex gap-2" onSubmit={addTodo}>
        <input
          className="flex-1 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent"
          placeholder="Add task..."
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          disabled={status !== "authenticated" || loading}
        />
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" type="submit" disabled={status !== "authenticated" || loading}>Add</button>
      </form>
      {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
      <div className="mt-4 text-xs text-gray-500">Daily completion: <span className="font-bold text-blue-600 dark:text-blue-400">{percent}%</span></div>
    </section>
  );
} 