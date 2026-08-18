import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { DB_PATHS } from "@/lib/constants";
import { isEmailAllowed } from "@/lib/admin-config";

let listeners: Array<() => void> = [];
const notify = () => listeners.forEach((l) => l());

let authState: { user: User | null; admin: boolean } = { user: null, admin: false };
let authStateLoaded = false;

function isBrowser() {
  return typeof window !== "undefined";
}

async function isAdminUser(user: User): Promise<boolean> {
  if (isEmailAllowed(user.email)) return true;

  // Custom claim `{ "admin": true }` — the source of truth the security rules use.
  try {
    const idToken = await user.getIdTokenResult();
    if (idToken.claims?.admin === true) return true;
  } catch {
    /* fall through to RTDB check */
  }

  // Best-effort RTDB check for UID-based admins (guards against env-only setups).
  try {
    const snap = await get(ref(db, `${DB_PATHS.admins}/${user.uid}`));
    if (snap.exists() && snap.val() === true) return true;
  } catch {
    /* rules may block reads; fall through to deny */
  }
  return false;
}

/** Starts the Firebase Auth listener once (module-level singleton). */
function ensureAuthListener() {
  if (!isBrowser() || authStateLoaded) return;
  authStateLoaded = true;
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      authState = { user: null, admin: false };
      notify();
      return;
    }
    void isAdminUser(user).then((admin) => {
      authState = { user, admin };
      notify();
    });
  });
}

export function useAdminAuth() {
  const [state, setState] = useState(() =>
    isBrowser() ? authState : { user: null, admin: false },
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAuthListener();
    setState(authState);
    setReady(true);
    const update = () => setState(authState);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await signInWithEmailAndPassword(auth, email, password);
    const admin = await isAdminUser(user.user);
    if (!admin) {
      await signOut(auth);
      throw new Error("This account has no admin access.");
    }
    authState = { user: user.user, admin };
    notify();
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    authState = { user: null, admin: false };
    notify();
  }, []);

  return {
    ready,
    isAuthenticated: state.admin,
    user: state.user,
    login,
    logout,
  };
}
