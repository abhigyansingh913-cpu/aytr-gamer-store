import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { push, ref, remove, update } from "firebase/database";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Lock,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useMods } from "@/hooks/use-mods";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/lib/types";
import { cn, cleanImageUrl } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { ready, isAuthenticated } = useAdminAuth();

  if (!ready) {
    return (
      <StoreShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-dark)]" />
        </div>
      </StoreShell>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function LoginForm() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(password);
      toast.success("Welcome back, admin");
    } catch {
      toast.error("Wrong password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreShell title="Admin access">
      <button
        onClick={() => navigate({ to: "/settings" })}
        className="glass mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <form
        onSubmit={submit}
        className="glass-gold animate-float-up mx-auto max-w-sm rounded-3xl p-6"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="animate-gold-glow flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-display text-xl font-bold">Admin Login</h1>
          <p className="text-xs text-muted-foreground">
            Secure access to the upload dashboard
          </p>
        </div>

        <Field label="Password">

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="glass w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Sign in
        </button>
      </form>
    </StoreShell>
  );
}

const modSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(80),
  description: z.string().trim().min(1, "Description required").max(2000),
  category: z.enum(CATEGORIES),
  imageUrl: z.string().trim().url("Valid image URL required").max(600),
  downloadLink: z.string().trim().url("Valid download URL required").max(600),
  version: z.string().trim().min(1, "Version required").max(30),
  size: z.string().trim().min(1, "Size required").max(30),
  screenshots: z.array(z.string().url()).max(10),
  youtubeUrl: z
    .string()
    .trim()
    .url("Valid YouTube URL required")
    .max(600)
    .optional(),
});

const empty = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  imageUrl: "",
  downloadLink: "",
  version: "",
  size: "",
  screenshot1: "",
  screenshot2: "",
  youtubeUrl: "",
};

function Dashboard() {
  const { logout } = useAdminAuth();
  const { mods } = useMods();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const screenshots = [form.screenshot1, form.screenshot2]
      .map((s) => cleanImageUrl(s))
      .filter(Boolean);

    const parsed = modSchema.safeParse({
      title: form.title,
      description: form.description,
      category: form.category,
      imageUrl: cleanImageUrl(form.imageUrl),
      downloadLink: form.downloadLink.trim(),
      version: form.version,
      size: form.size,
      screenshots,
      youtubeUrl: form.youtubeUrl.trim() || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    try {
      await push(ref(db, "mods"), { ...parsed.data, createdAt: Date.now() });
      toast.success("Mod published");
      setForm(empty);
    } catch (err) {
      toast.error("Failed to publish. Check database permissions.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    try {
      await remove(ref(db, `mods/${id}`));
      toast.success("Mod deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <StoreShell title="Upload dashboard">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/settings" })}
          className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={logout}
          className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium active:scale-95"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <form onSubmit={submit} className="glass animate-float-up rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Plus className="h-5 w-5 text-[var(--gold-dark)]" /> Add new mod
        </h2>

        <Field label="App / mod title">
          <Input value={form.title} onChange={(v) => set("title", v)} placeholder="Ultra HD Textures" />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Describe the mod…"
            className="glass w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </Field>

        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="glass w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Version">
            <Input value={form.version} onChange={(v) => set("version", v)} placeholder="1.20.4" />
          </Field>
          <Field label="File size">
            <Input value={form.size} onChange={(v) => set("size", v)} placeholder="24 MB" />
          </Field>
        </div>

        <Field label="Thumbnail image URL">
          <Input value={form.imageUrl} onChange={(v) => set("imageUrl", v)} placeholder="https://…/image.jpg" />
        </Field>

        <Field label="Download link">
          <Input value={form.downloadLink} onChange={(v) => set("downloadLink", v)} placeholder="https://…/download" />
        </Field>

        <Field label="Screenshot URL 1">
          <Input value={form.screenshot1} onChange={(v) => set("screenshot1", v)} placeholder="https://…/1.jpg" />
        </Field>

        <Field label="Screenshot URL 2">
          <Input value={form.screenshot2} onChange={(v) => set("screenshot2", v)} placeholder="https://…/2.jpg" />
        </Field>

        <Field label="YouTube video link (optional)">
          <Input value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} placeholder="https://youtube.com/watch?v=…" />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Publish mod
        </button>
      </form>

      <div className="mt-6">
        <h2 className="mb-2 px-1 font-display text-base font-semibold">
          Published mods ({mods.length})
        </h2>
        <div className="flex flex-col gap-2">
          {mods.map((mod) => (
            <div key={mod.id} className="glass flex items-center gap-3 rounded-2xl p-2.5">
              <img src={mod.imageUrl} alt={mod.title} className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{mod.title}</p>
                <p className="text-xs text-muted-foreground">
                  {mod.category} · v{mod.version}
                </p>
              </div>
              <button
                onClick={() => del(mod.id)}
                aria-label="Delete mod"
                className="rounded-full p-2 text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {mods.length === 0 && (
            <p className="glass rounded-2xl py-6 text-center text-sm text-muted-foreground">
              No mods published yet.
            </p>
          )}
        </div>
      </div>
    </StoreShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block px-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "glass w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]",
      )}
    />
  );
}
