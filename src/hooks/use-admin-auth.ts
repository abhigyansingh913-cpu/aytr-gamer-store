import { useEffect, useState } from "react";

// ⚠️ Simple password-only admin gate.
// Change this value to update your admin password.
const ADMIN_PASSWORD = "Broyougotmad";
const STORAGE_KEY = "aytr-admin-unlocked";

let listeners: Array<() => void> = [];
const notify = () => listeners.forEach((l) => l());

function readUnlocked() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "yes";
}

export function useAdminAuth() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(readUnlocked());
    setReady(true);
    const update = () => setUnlocked(readUnlocked());
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  const login = async (password: string) => {
    if (password !== ADMIN_PASSWORD) {
      throw new Error("Invalid password");
    }
    localStorage.setItem(STORAGE_KEY, "yes");
    notify();
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  };

  return { ready, isAuthenticated: unlocked, login, logout };
}
