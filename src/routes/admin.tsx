import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { memo, useCallback, useState, type FormEvent, type ReactNode } from "react";
import { push, ref, remove, update } from "firebase/database";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Megaphone,
  PackagePlus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { ImageUploadField } from "@/components/store/ImageUploadField";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAdminMods } from "@/hooks/use-mods";
import { useAdminAds } from "@/hooks/use-ads";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/lib/types";
import type { Ad, Mod } from "@/lib/types";
import { cn, cleanImageUrl } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type AdminTab = "mods" | "banners";

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

  const submit = async (e: FormEvent<HTMLFormElement>) => {
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
        className="mb-4 inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <form
        onSubmit={submit}
        className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-5 shadow-none"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-3 font-display text-xl font-bold">Admin Login</h1>
          <p className="text-xs text-muted-foreground">Secure upload access</p>
        </div>

        <Field label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
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
  const [activeTab, setActiveTab] = useState<AdminTab>("mods");

  return (
    <StoreShell title="Lite admin" hideBottomNav performanceMode>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate({ to: "/settings" })}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={logout}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold active:scale-95"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1">
        <AdminTabButton
          active={activeTab === "mods"}
          icon={<PackagePlus className="h-4 w-4" />}
          label="Mods"
          onClick={() => setActiveTab("mods")}
        />
        <AdminTabButton
          active={activeTab === "banners"}
          icon={<Megaphone className="h-4 w-4" />}
          label="Banners"
          onClick={() => setActiveTab("banners")}
        />
      </div>

      {activeTab === "mods" ? <ModsPanel /> : <BannersPanel />}
    </StoreShell>
  );
}

function AdminTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground active:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionToolbar({
  title,
  count,
  addLabel,
  loading,
  formOpen,
  onAddToggle,
  onRefresh,
}: {
  title: string;
  count: number;
  addLabel: string;
  loading: boolean;
  formOpen: boolean;
  onAddToggle: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{count} total</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-bold disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>
      <button
        type="button"
        onClick={onAddToggle}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground active:scale-95"
      >
        <Plus className="h-4 w-4" />
        {formOpen ? "Close form" : addLabel}
      </button>
    </div>
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

const INITIAL_VISIBLE = 8;

function ModsPanel() {
  const { mods, loading, error, refresh } = useAdminMods();
  const [formOpen, setFormOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const visible = showAll ? mods : mods.slice(0, INITIAL_VISIBLE);

  const del = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await remove(ref(db, `mods/${id}`));
        await refresh();
        toast.success("Mod deleted");
      } catch {
        toast.error("Failed to delete");
      } finally {
        setDeletingId(null);
      }
    },
    [refresh],
  );

  return (
    <section className="space-y-3">
      <SectionToolbar
        title="Published mods"
        count={mods.length}
        addLabel="Add mod"
        loading={loading}
        formOpen={formOpen}
        onAddToggle={() => setFormOpen((s) => !s)}
        onRefresh={refresh}
      />

      {formOpen && <AddModForm onSaved={() => setFormOpen(false)} />}

      <ListState loading={loading} error={error} empty={mods.length === 0} emptyText="No mods published yet." />

      <div className="flex flex-col gap-2">
        {visible.map((mod) => (
          <ModRow
            key={mod.id}
            mod={mod}
            deleting={deletingId === mod.id}
            onDelete={del}
          />
        ))}
      </div>

      {mods.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold"
        >
          {showAll ? "Show less" : `Load more (${mods.length - INITIAL_VISIBLE})`}
        </button>
      )}
    </section>
  );
}

function AddModForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const set = useCallback(
    (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v })),
    [],
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
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
      onSaved();
      window.dispatchEvent(new Event("aytr-admin-mods-refresh"));
    } catch {
      toast.error("Failed to publish. Check database permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
        <PackagePlus className="h-5 w-5 text-[var(--gold-dark)]" /> Add new mod
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
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>

      <Field label="Category">
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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

      <Field label="Thumbnail image (URL or upload)">
        <ImageUploadField value={form.imageUrl} onChange={(v) => set("imageUrl", v)} folder="mods" />
      </Field>

      <Field label="Download link">
        <Input value={form.downloadLink} onChange={(v) => set("downloadLink", v)} placeholder="https://…/download" />
      </Field>

      <button
        type="button"
        onClick={() => setShowExtras((s) => !s)}
        className="mb-3 flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-xs font-bold"
      >
        <span>Screenshots & YouTube</span>
        {showExtras ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showExtras && (
        <>
          <Field label="Screenshot 1 (URL or upload)">
            <ImageUploadField value={form.screenshot1} onChange={(v) => set("screenshot1", v)} folder="screenshots" />
          </Field>

          <Field label="Screenshot 2 (URL or upload)">
            <ImageUploadField value={form.screenshot2} onChange={(v) => set("screenshot2", v)} folder="screenshots" />
          </Field>

          <Field label="YouTube video link">
            <Input value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} placeholder="https://youtube.com/watch?v=…" />
          </Field>
        </>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Publish mod
      </button>
    </form>
  );
}

const ModRow = memo(function ModRow({
  mod,
  deleting,
  onDelete,
}: {
  mod: Mod;
  deleting: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-16 items-center gap-3 rounded-2xl border border-border bg-card p-2.5">
      <img
        src={cleanImageUrl(mod.imageUrl)}
        alt={mod.title}
        width={44}
        height={44}
        loading="lazy"
        decoding="async"
        className="h-11 w-11 shrink-0 rounded-lg bg-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{mod.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {mod.category} · v{mod.version}
        </p>
      </div>
      <button
        onClick={() => onDelete(mod.id)}
        disabled={deleting}
        aria-label="Delete mod"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-destructive disabled:opacity-60"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
});

function BannersPanel() {
  const { ads, loading, error, refresh } = useAdminAds();
  const [formOpen, setFormOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const visible = showAll ? ads : ads.slice(0, INITIAL_VISIBLE);

  const toggle = useCallback(
    async (id: string, active: boolean) => {
      setBusyId(`toggle-${id}`);
      try {
        await update(ref(db, `ads/${id}`), { active: !active });
        await refresh();
      } catch {
        toast.error("Failed to update banner");
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  const del = useCallback(
    async (id: string) => {
      setBusyId(`delete-${id}`);
      try {
        await remove(ref(db, `ads/${id}`));
        await refresh();
        toast.success("Banner deleted");
      } catch {
        toast.error("Failed to delete banner");
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  return (
    <section className="space-y-3">
      <SectionToolbar
        title="Ad banners"
        count={ads.length}
        addLabel="Add banner"
        loading={loading}
        formOpen={formOpen}
        onAddToggle={() => setFormOpen((s) => !s)}
        onRefresh={refresh}
      />

      {formOpen && <AddBannerForm onSaved={() => setFormOpen(false)} />}

      <ListState loading={loading} error={error} empty={ads.length === 0} emptyText="No banners yet." />

      <div className="flex flex-col gap-2">
        {visible.map((ad) => (
          <AdRow
            key={ad.id}
            ad={ad}
            toggleLoading={busyId === `toggle-${ad.id}`}
            deleteLoading={busyId === `delete-${ad.id}`}
            onToggle={toggle}
            onDelete={del}
          />
        ))}
      </div>

      {ads.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold"
        >
          {showAll ? "Show less" : `Load more (${ads.length - INITIAL_VISIBLE})`}
        </button>
      )}
    </section>
  );
}

function AddBannerForm({ onSaved }: { onSaved: () => void }) {
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);

  const addBanner = async (e: FormEvent<HTMLFormElement>) => {
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
      onSaved();
      window.dispatchEvent(new Event("aytr-admin-ads-refresh"));
    } catch {
      toast.error("Failed to add banner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={addBanner} className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold">
        <Megaphone className="h-5 w-5 text-[var(--gold-dark)]" /> Ads / Banners
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Ye banners home page aur download se pehle dikhte hain.
      </p>

      <Field label="Banner image (URL or upload)">
        <ImageUploadField value={image} onChange={setImage} folder="banners" />
      </Field>

      <Field label="Click link (optional)">
        <Input value={link} onChange={setLink} placeholder="https://…" />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add banner
      </button>
    </form>
  );
}

const AdRow = memo(function AdRow({
  ad,
  toggleLoading,
  deleteLoading,
  onToggle,
  onDelete,
}: {
  ad: Ad;
  toggleLoading: boolean;
  deleteLoading: boolean;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-16 items-center gap-3 rounded-2xl border border-border bg-card p-2.5">
      <img
        src={cleanImageUrl(ad.imageUrl)}
        alt="Banner"
        width={64}
        height={44}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-11 w-16 shrink-0 rounded-lg bg-muted object-cover",
          !ad.active && "opacity-40",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">
          {ad.linkUrl || "No link"}
        </p>
        <p className="text-[11px] font-bold">{ad.active ? "Active" : "Hidden"}</p>
      </div>
      <button
        onClick={() => onToggle(ad.id, ad.active)}
        disabled={toggleLoading || deleteLoading}
        aria-label="Toggle banner"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--gold-dark)] disabled:opacity-60"
      >
        {toggleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : ad.active ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => onDelete(ad.id)}
        disabled={toggleLoading || deleteLoading}
        aria-label="Delete banner"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-destructive disabled:opacity-60"
      >
        {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
});

function ListState({
  loading,
  error,
  empty,
  emptyText,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
}) {
  if (error) {
    return (
      <p className="rounded-2xl border border-destructive/30 bg-card px-3 py-2 text-xs text-destructive">
        {error}
      </p>
    );
  }

  if (loading) {
    return (
      <p className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (empty) {
    return (
      <p className="rounded-2xl border border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return null;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block px-1 text-xs font-semibold text-muted-foreground">
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
      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
