import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { memo, useCallback, useState } from "react";
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
  Megaphone,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAdminMods } from "@/hooks/use-mods";
import { useAdminAds } from "@/hooks/use-ads";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/lib/types";
import type { Mod, Ad } from "@/lib/types";
import { cn, cleanImageUrl } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { ready, isAuthenticated } = useAdminAuth();

  if (!ready) {
    return (
      <StoreShell hideBottomNav performanceMode>
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
    <StoreShell title="Admin access" hideBottomNav performanceMode>
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

function Dashboard() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <StoreShell title="Upload dashboard" hideBottomNav performanceMode>
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

      <AddModForm />
      <ModsList />
      <AddBannerForm />
      <BannersList />
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

function AddModForm() {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const set = useCallback(
    (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v })),
    [],
  );

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
      setShowExtras(false);
      window.dispatchEvent(new Event("aytr-admin-mods-refresh"));
    } catch {
      toast.error("Failed to publish. Check database permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
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

      <button
        type="button"
        onClick={() => setShowExtras((s) => !s)}
        className="glass mb-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold"
      >
        <span>Screenshots & YouTube (optional)</span>
        {showExtras ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showExtras && (
        <>
          <Field label="Screenshot URL 1">
            <Input value={form.screenshot1} onChange={(v) => set("screenshot1", v)} placeholder="https://…/1.jpg" />
          </Field>

          <Field label="Screenshot URL 2">
            <Input value={form.screenshot2} onChange={(v) => set("screenshot2", v)} placeholder="https://…/2.jpg" />
          </Field>

          <Field label="YouTube video link">
            <Input value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} placeholder="https://youtube.com/watch?v=…" />
          </Field>
        </>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Publish mod
      </button>
    </form>
  );
}

const INITIAL_VISIBLE = 20;

function ModsList() {
  const { mods, loading, error, refresh } = useAdminMods();
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? mods : mods.slice(0, INITIAL_VISIBLE);

  const del = useCallback(async (id: string) => {
    try {
      await remove(ref(db, `mods/${id}`));
      await refresh();
      toast.success("Mod deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }, [refresh]);

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="font-display text-base font-semibold">
          Published mods ({mods.length})
        </h2>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {error && (
          <p className="glass rounded-2xl px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {visible.map((mod) => (
          <ModRow key={mod.id} mod={mod} onDelete={del} />
        ))}
        {mods.length === 0 && (
          <p className="glass rounded-2xl py-6 text-center text-sm text-muted-foreground">
            No mods published yet.
          </p>
        )}
        {mods.length > INITIAL_VISIBLE && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="glass mt-1 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            {showAll ? "Show less" : `Show all (${mods.length})`}
          </button>
        )}
      </div>
    </div>
  );
}

const ModRow = memo(function ModRow({
  mod,
  onDelete,
}: {
  mod: Mod;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-2.5">
      <img
        src={cleanImageUrl(mod.imageUrl)}
        alt={mod.title}
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        className="h-12 w-12 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{mod.title}</p>
        <p className="text-xs text-muted-foreground">
          {mod.category} · v{mod.version}
        </p>
      </div>
      <button
        onClick={() => onDelete(mod.id)}
        aria-label="Delete mod"
        className="rounded-full p-2 text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
});

function AddBannerForm() {
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);

  const addBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrl = cleanImageUrl(image);
    const linkUrl = link.trim();

    if (!/^https?:\/\//i.test(imageUrl)) {
      toast.error("Valid banner image URL required");
      return;
    }
    if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
      toast.error("Link must start with http(s)://");
      return;
    }

    setSaving(true);
    try {
      await push(ref(db, "ads"), {
        imageUrl,
        linkUrl,
        active: true,
        createdAt: Date.now(),
      });
      toast.success("Banner added");
      setImage("");
      setLink("");
      window.dispatchEvent(new Event("aytr-admin-ads-refresh"));
    } catch {
      toast.error("Failed to add banner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={addBanner} className="glass animate-float-up mt-8 rounded-2xl p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
        <Megaphone className="h-5 w-5 text-[var(--gold-dark)]" /> Ads / Banners
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Ye banners home page aur download se pehle dikhte hain.
      </p>

      <Field label="Banner image URL">
        <Input value={image} onChange={setImage} placeholder="https://…/banner.jpg" />
      </Field>

      <Field label="Click link (optional)">
        <Input value={link} onChange={setLink} placeholder="https://… (kahan le jaye)" />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add banner
      </button>
    </form>
  );
}

function BannersList() {
  const { ads, loading, error, refresh } = useAdminAds();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ads : ads.slice(0, INITIAL_VISIBLE);

  const toggle = useCallback(async (id: string, active: boolean) => {
    try {
      await update(ref(db, `ads/${id}`), { active: !active });
      await refresh();
    } catch {
      toast.error("Failed to update banner");
    }
  }, [refresh]);

  const del = useCallback(async (id: string) => {
    try {
      await remove(ref(db, `ads/${id}`));
      await refresh();
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  }, [refresh]);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="font-display text-base font-semibold">
          Banners ({ads.length})
        </h3>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {error && (
          <p className="glass rounded-2xl px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {visible.map((ad) => (
          <AdRow key={ad.id} ad={ad} onToggle={toggle} onDelete={del} />
        ))}
        {ads.length === 0 && (
          <p className="glass rounded-2xl py-6 text-center text-sm text-muted-foreground">
            No banners yet.
          </p>
        )}
        {ads.length > INITIAL_VISIBLE && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="glass mt-1 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            {showAll ? "Show less" : `Show all (${ads.length})`}
          </button>
        )}
      </div>
    </div>
  );
}

const AdRow = memo(function AdRow({
  ad,
  onToggle,
  onDelete,
}: {
  ad: Ad;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-2.5">
      <img
        src={cleanImageUrl(ad.imageUrl)}
        alt="Banner"
        width={80}
        height={48}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-12 w-20 rounded-lg object-cover",
          !ad.active && "opacity-40",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">
          {ad.linkUrl || "No link"}
        </p>
        <p className="text-[11px] font-semibold">
          {ad.active ? "Active" : "Hidden"}
        </p>
      </div>
      <button
        onClick={() => onToggle(ad.id, ad.active)}
        aria-label="Toggle banner"
        className="rounded-full p-2 text-[var(--gold-dark)] transition-colors hover:bg-[var(--gold)]/10"
      >
        {ad.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button
        onClick={() => onDelete(ad.id)}
        aria-label="Delete banner"
        className="rounded-full p-2 text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
});

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
