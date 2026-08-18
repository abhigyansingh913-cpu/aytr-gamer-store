import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Boxes,
  CheckCircle2,
  Database,
  FileText,
  Flame,
  FolderOpen,
  LayoutGrid,
  Loader2,
  Lock,
  LogOut,
  Megaphone,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { ImageUploadField } from "@/components/store/ImageUploadField";
import { FileUploadField } from "@/components/store/FileUploadField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAdminMods, useAdminCategories } from "@/hooks/use-mods";
import { useAdminAds } from "@/hooks/use-ads";
import {
  createAd,
  createCategory,
  createMod,
  deleteAd,
  deleteCategory,
  deleteMod,
  setModFlag,
  toggleAd,
  updateCategory,
  updateMod,
} from "@/lib/store-data";
import { STORAGE, APP_VERSION } from "@/lib/constants";
import { ADMIN_EMAILS, hasAdminConfigured } from "@/lib/admin-config";
import { storage } from "@/lib/firebase";
import type { Ad, Category, Mod } from "@/lib/types";
import { FALLBACK_CATEGORIES } from "@/lib/types";
import { cn, cleanImageUrl, onImageError } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type AdminTab = "overview" | "items" | "categories" | "ads";

function AdminPage() {
  const { ready, isAuthenticated } = useAdminAuth();

  if (!ready) {
    return (
      <StoreShell hideBottomNav perfFlat>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-accent-red" />
        </div>
      </StoreShell>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

/* ---------------- Login ---------------- */

function LoginForm() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success("Welcome back, admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(
        msg === "Firebase: Error (auth/invalid-credential)." ? "Incorrect email or password." : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreShell title="Admin access" hideBottomNav perfFlat>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="icon-glass inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-transform active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <form onSubmit={submit} className="surface mx-auto max-w-sm rounded-2xl p-5">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-xl">
            <Lock className="h-6 w-6 text-accent-red" />
          </span>
          <h1 className="mt-3 font-display text-xl font-bold text-white">Admin Login</h1>
          <p className="text-xs text-muted-foreground">Sign in with your Firebase admin account</p>
        </div>

        <Field label="Email">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </Field>

        {error && (
          <p className="mb-2 rounded-xl border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-red px-4 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Sign in
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Passwords are verified by Firebase Authentication — never stored in the app.
        </p>
      </form>
    </StoreShell>
  );
}

/* ---------------- Dashboard shell ---------------- */

function Dashboard() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("overview");

  const tabs: { id: AdminTab; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Boxes className="h-4 w-4" /> },
    { id: "items", label: "Items", icon: <PackagePlus className="h-4 w-4" /> },
    { id: "categories", label: "Categories", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "ads", label: "Ads", icon: <Megaphone className="h-4 w-4" /> },
  ];

  return (
    <StoreShell title="Admin panel" hideBottomNav perfFlat>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="icon-glass inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-transform active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="icon-glass inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-transform active:scale-95"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-card p-1 sm:grid-cols-4">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors",
              tab === id
                ? "bg-accent-red text-white"
                : "text-muted-foreground hover:bg-white/5 hover:text-white",
            )}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "items" && <ItemsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "ads" && <AdsTab />}
    </StoreShell>
  );
}

/* ---------------- Overview ---------------- */

function OverviewTab() {
  const { mods, loading: modsLoading, error: modsError, refresh: refreshMods } = useAdminMods();
  const { categories, loading: catsLoading, refresh: refreshCats } = useAdminCategories();
  const { ads, loading: adsLoading, refresh: refreshAds } = useAdminAds();
  const [refreshing, setRefreshing] = useState(false);

  const totalDownloads = useMemo(
    () => mods.reduce((sum, m) => sum + (m.downloads || 0), 0),
    [mods],
  );
  const featuredCount = useMemo(() => mods.filter((m) => m.featured).length, [mods]);
  const recent = useMemo(
    () => [...mods].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [mods],
  );
  const popular = useMemo(
    () => [...mods].sort((a, b) => b.downloads - a.downloads).slice(0, 5),
    [mods],
  );

  const busy = modsLoading || catsLoading || adsLoading;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshMods(), refreshCats(), refreshAds()]);
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  }, [refreshMods, refreshCats, refreshAds]);

  const stats = [
    {
      label: "Total items",
      value: mods.length.toLocaleString(),
      icon: <PackagePlus className="h-5 w-5" />,
    },
    { label: "Total downloads", value: totalDownloads.toLocaleString(), icon: <DownloadIcon /> },
    {
      label: "Categories",
      value: categories.length.toLocaleString(),
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      label: "Featured",
      value: featuredCount.toLocaleString(),
      icon: <Star className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="surface flex items-center justify-between rounded-2xl p-3">
        <div>
          <h2 className="font-display text-base font-bold text-white">Dashboard</h2>
          <p className="text-xs text-muted-foreground">Store performance at a glance</p>
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={refreshing}
          className="icon-glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-transform active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {modsError && (
        <p className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
          {modsError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface rounded-2xl p-3.5">
            <span className="icon-glass inline-flex h-9 w-9 items-center justify-center rounded-xl">
              {s.icon}
            </span>
            <p className="mt-2.5 font-display text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface rounded-2xl p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-white">
            <Upload className="h-4 w-4 text-accent-red" /> Recent uploads
          </h3>
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((m) => (
                <MiniItem key={m.id} mod={m} />
              ))}
            </ul>
          )}
        </div>

        <div className="surface rounded-2xl p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-white">
            <Flame className="h-4 w-4 text-accent-red" /> Popular items
          </h3>
          {popular.length === 0 ? (
            <p className="text-xs text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="space-y-2">
              {popular.map((m) => (
                <MiniItem key={m.id} mod={m} showDownloads />
              ))}
            </ul>
          )}
        </div>
      </div>

      <SystemStatus adsCount={ads.length} dbOk={!modsError} adsLoading={adsLoading} />
    </div>
  );
}

function DownloadIcon() {
  return <FileText className="h-5 w-5" />;
}

function MiniItem({ mod, showDownloads }: { mod: Mod; showDownloads?: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      <img
        src={cleanImageUrl(mod.imageUrl)}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        onError={onImageError}
        className="h-9 w-9 shrink-0 rounded-lg bg-black/40 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{mod.title}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {mod.category} · v{mod.version}
          {showDownloads ? ` · ${mod.downloads.toLocaleString()} downloads` : ""}
        </p>
      </div>
    </li>
  );
}

function SystemStatus({
  adsCount,
  dbOk,
  adsLoading,
}: {
  adsCount: number;
  dbOk: boolean;
  adsLoading: boolean;
}) {
  const bucket = storage.app.options.storageBucket ?? "—";
  return (
    <div className="surface rounded-2xl p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-white">
        <Database className="h-4 w-4 text-accent-red" /> System status
      </h3>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <StatusRow label="App version" value={APP_VERSION} />
        <StatusRow label="Database" value={dbOk ? "Connected" : "Unavailable"} ok={dbOk} />
        <StatusRow label="Active banners" value={adsLoading ? "…" : String(adsCount)} />
        <StatusRow label="Storage bucket" value={bucket} />
        <StatusRow
          label="Admin auth"
          value={
            hasAdminConfigured() ? `Email allowlist (${ADMIN_EMAILS.length})` : "RTDB UID + env"
          }
        />
      </dl>
    </div>
  );
}

function StatusRow({ label, value, ok = true }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 font-semibold text-white">
        {ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <span className="h-3.5 w-3.5 rounded-full bg-accent-red" />
        )}
        {value}
      </dd>
    </div>
  );
}

/* ---------------- Items ---------------- */

const INITIAL_VISIBLE = 8;

function ItemsTab() {
  const { mods, loading, error, refresh } = useAdminMods();
  const { categories } = useAdminCategories();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Mod | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [confirming, setConfirming] = useState<Mod | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mods;
    return mods.filter((m) =>
      `${m.title} ${m.category} ${m.version} ${m.tags.join(" ")}`.toLowerCase().includes(q),
    );
  }, [mods, query]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  const del = useCallback(async () => {
    if (!confirming) return;
    setDeleting(true);
    try {
      await deleteMod(confirming.id);
      toast.success("Item deleted");
      setConfirming(null);
      await refresh();
    } catch {
      toast.error("Failed to delete item. Check database rules.");
    } finally {
      setDeleting(false);
    }
  }, [confirming, refresh]);

  const toggleFlag = useCallback(
    async (mod: Mod, flag: "published" | "featured", value: boolean) => {
      try {
        await setModFlag(mod.id, flag, value);
        toast.success(flag === "published" ? "Publish state updated" : "Featured state updated");
        await refresh();
      } catch {
        toast.error("Failed to update item. Check database rules.");
      }
    },
    [refresh],
  );

  return (
    <section className="space-y-3">
      <div className="surface rounded-2xl p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-white">Items</h2>
            <p className="text-xs text-muted-foreground">{filtered.length} total</p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="icon-glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen((s) => !s);
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-red px-4 text-sm font-bold text-white transition-transform active:scale-95"
        >
          {formOpen || editing ? <ArrowUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {formOpen || editing ? "Close form" : "Add item"}
        </button>
      </div>

      {(formOpen || editing) && (
        <ItemForm
          key={editing?.id ?? "new"}
          initial={editing}
          categories={categories}
          onSaved={() => {
            setEditing(null);
            setFormOpen(false);
          }}
        />
      )}

      {error ? (
        <p className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
          {error}
        </p>
      ) : loading && mods.length === 0 ? (
        <p className="surface rounded-2xl px-3 py-8 text-center text-sm text-muted-foreground">
          Loading items…
        </p>
      ) : filtered.length === 0 ? (
        <p className="surface rounded-2xl px-3 py-8 text-center text-sm text-muted-foreground">
          No items match. Add your first item above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((mod) => (
            <ItemRow
              key={mod.id}
              mod={mod}
              onEdit={(m) => {
                setFormOpen(false);
                setEditing(m);
              }}
              onDelete={(m) => setConfirming(m)}
              onToggle={(flag, value) => void toggleFlag(mod, flag, value)}
            />
          ))}
        </div>
      )}

      {filtered.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-sm font-bold text-white transition-transform active:scale-95"
        >
          {showAll ? "Show less" : `Load more (${filtered.length - INITIAL_VISIBLE})`}
        </button>
      )}

      <ConfirmDialog
        open={!!confirming}
        title="Delete item?"
        description={`"${confirming?.title ?? ""}" will be permanently removed. This cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        busy={deleting}
        onConfirm={() => void del()}
        onCancel={() => !deleting && setConfirming(null)}
      />
    </section>
  );
}

function ItemRow({
  mod,
  onEdit,
  onDelete,
  onToggle,
}: {
  mod: Mod;
  onEdit: (m: Mod) => void;
  onDelete: (m: Mod) => void;
  onToggle: (flag: "published" | "featured", value: boolean) => void;
}) {
  return (
    <div className="surface flex items-center gap-3 rounded-2xl p-2.5">
      <img
        src={cleanImageUrl(mod.imageUrl)}
        alt={mod.title}
        width={44}
        height={44}
        loading="lazy"
        decoding="async"
        onError={onImageError}
        className={cn(
          "h-11 w-11 shrink-0 rounded-lg bg-black/40 object-cover",
          !mod.published && "opacity-40",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-bold text-white">
          {mod.title}
          {mod.featured && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-accent-red text-accent-red" />
          )}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {mod.category} · v{mod.version} · {mod.downloads.toLocaleString()} downloads
        </p>
        <div className="mt-1 flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Switch
              checked={mod.published}
              onCheckedChange={(v) => onToggle("published", v)}
              aria-label="Published"
            />
            {mod.published ? "Published" : "Hidden"}
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Switch
              checked={mod.featured}
              onCheckedChange={(v) => onToggle("featured", v)}
              aria-label="Featured"
            />
            Featured
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(mod)}
        aria-label="Edit item"
        className="icon-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
      >
        <Pencil className="h-4 w-4 text-accent-red" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(mod)}
        aria-label="Delete item"
        className="icon-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
      >
        <Trash2 className="h-4 w-4 text-accent-red" />
      </button>
    </div>
  );
}

/* ---------------- Item form ---------------- */

const modSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(80),
  description: z.string().trim().min(1, "Description required").max(4000),
  category: z.string().trim().min(1, "Category required").max(60),
  imageUrl: z.string().trim().url("Valid image URL required").max(800),
  downloadLink: z.string().trim().url("Valid file URL required").max(800),
  version: z.string().trim().min(1, "Version required").max(30),
  size: z.string().trim().min(1, "Size required").max(30),
  tags: z.array(z.string().trim().max(24)).max(6),
  youtubeUrl: z
    .string()
    .trim()
    .url("Valid YouTube URL required")
    .max(800)
    .optional()
    .or(z.literal("")),
});

interface ItemFormProps {
  initial: Mod | null;
  categories: Category[];
  onSaved: () => void;
}

function ItemForm({ initial, categories, onSaved }: ItemFormProps) {
  const [form, setForm] = useState(() => {
    const catOptions = categoryOptions(categories, initial);
    const initialCatValue =
      initial && initial.categoryId
        ? initial.categoryId
        : initial && initial.category
          ? initial.category
          : (catOptions[0]?.value ?? "Other");
    return {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      catValue: initialCatValue,
      version: initial?.version ?? "",
      size: initial?.size ?? "",
      imageUrl: initial?.imageUrl ?? "",
      downloadLink: initial?.downloadLink ?? "",
      youtubeUrl: initial?.youtubeUrl ?? "",
      tagsInput: (initial?.tags ?? []).join(", "),
      screenshots: initial?.screenshots?.length ? [...initial.screenshots] : [""],
      published: initial?.published !== false,
      featured: Boolean(initial?.featured),
    };
  });

  const [saving, setSaving] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const set = useCallback(<K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  const catOptions = useMemo(() => categoryOptions(categories, initial), [categories, initial]);

  const setScreenshot = (i: number, v: string) => {
    setForm((f) => {
      const next = [...f.screenshots];
      next[i] = v;
      return { ...f, screenshots: next };
    });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const screenshots = form.screenshots.map((s) => cleanImageUrl(s)).filter(Boolean);

    // Resolve category: managed id → name + id; otherwise free text.
    const managed = catOptions.find((o) => o.value === form.catValue && o.isManaged);
    const categoryName = managed ? managed.label : form.catValue;
    const categoryId = managed ? (managed.value as string) : undefined;

    const parsed = modSchema.safeParse({
      title: form.title,
      description: form.description,
      category: categoryName,
      imageUrl: cleanImageUrl(form.imageUrl),
      downloadLink: form.downloadLink.trim(),
      version: form.version,
      size: form.size,
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6),
      youtubeUrl: form.youtubeUrl.trim(),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const payload = {
      ...parsed.data,
      categoryId,
      screenshots,
      published: form.published,
      featured: form.featured,
    };

    setSaving(true);
    try {
      if (initial) {
        await updateMod(initial.id, payload);
        toast.success("Item updated");
      } else {
        await createMod(payload);
        toast.success("Item published");
      }
      window.dispatchEvent(new Event("aytr-admin-mods-refresh"));
      onSaved();
    } catch {
      toast.error("Failed to save. Check database rules and retry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface rounded-2xl p-4">
      <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-white">
        <PackagePlus className="h-5 w-5 text-accent-red" />
        {initial ? "Edit item" : "Add new item"}
      </h2>

      <Field label="Title">
        <AdminInput
          value={form.title}
          onChange={(v) => set("title", v)}
          placeholder="Ultra HD Textures"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Describe the item…"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={form.catValue}
            onChange={(e) => set("catValue", e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-white outline-none focus:ring-2 focus:ring-ring"
          >
            {catOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Version">
            <AdminInput
              value={form.version}
              onChange={(v) => set("version", v)}
              placeholder="1.20.4"
            />
          </Field>
          <Field label="Size">
            <AdminInput value={form.size} onChange={(v) => set("size", v)} placeholder="24 MB" />
          </Field>
        </div>
      </div>

      <Field label="Tags (comma separated)">
        <AdminInput
          value={form.tagsInput}
          onChange={(v) => set("tagsInput", v)}
          placeholder="hd, realistic, 1.20"
        />
      </Field>

      <Field label="Thumbnail">
        <ImageUploadField
          value={form.imageUrl}
          onChange={(v) => set("imageUrl", v)}
          folder={STORAGE.thumbnails}
        />
      </Field>

      <Field label="Download file">
        <FileUploadField
          value={form.downloadLink}
          onChange={(v) => set("downloadLink", v)}
          folder={STORAGE.files}
          accept=".zip,.mcpack,.mcaddon,.rar,.7z,.apk,.xapk,.jar,.txt"
        />
      </Field>

      <div className="mb-3 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
          Featured
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowExtras((s) => !s)}
        className="mb-3 flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-background px-3 text-xs font-bold text-white"
      >
        <span>Screenshots & YouTube</span>
        {showExtras ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </button>

      {showExtras && (
        <>
          <div className="space-y-3">
            {form.screenshots.map((s, i) => (
              <Field key={i} label={`Screenshot ${i + 1}`}>
                <div className="space-y-2">
                  <ImageUploadField
                    value={s}
                    onChange={(v) => setScreenshot(i, v)}
                    folder={STORAGE.screenshots}
                  />
                  {form.screenshots.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          screenshots: f.screenshots.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-xs font-semibold text-accent-red"
                    >
                      Remove screenshot
                    </button>
                  )}
                </div>
              </Field>
            ))}
          </div>
          {form.screenshots.length < 8 && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, screenshots: [...f.screenshots, ""] }))}
              className="mb-3 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 text-xs font-semibold text-muted-foreground hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add screenshot
            </button>
          )}

          <Field label="YouTube video link">
            <AdminInput
              value={form.youtubeUrl}
              onChange={(v) => set("youtubeUrl", v)}
              placeholder="https://youtube.com/watch?v=…"
            />
          </Field>
        </>
      )}

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent-red px-4 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {initial ? "Save changes" : "Publish item"}
        </button>
        {initial && (
          <button
            type="button"
            onClick={onSaved}
            disabled={saving}
            className="icon-glass flex h-12 items-center justify-center rounded-xl px-4 text-sm font-bold transition-transform active:scale-95 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function categoryOptions(categories: Category[], initial: Mod | null) {
  const managed = categories.map((c) => ({ value: c.id, label: c.name, isManaged: true }));
  const managedNames = new Set(categories.map((c) => c.name));
  const fallback = FALLBACK_CATEGORIES.filter((name) => !managedNames.has(name)).map((name) => ({
    value: name,
    label: name,
    isManaged: false,
  }));
  const legacyExtra =
    initial && initial.category && !managedNames.has(initial.category)
      ? [{ value: initial.category, label: initial.category, isManaged: false }]
      : [];
  return [...managed, ...fallback, ...legacyExtra];
}

/* ---------------- Categories ---------------- */

function CategoriesTab() {
  const { categories, loading, error, refresh } = useAdminCategories();
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirming, setConfirming] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    try {
      await createCategory(newName);
      toast.success("Category created");
      setNewName("");
      await refresh();
    } catch {
      toast.error("Failed to create category. Check database rules.");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      await updateCategory(id, { name: editName.trim() });
      toast.success("Category renamed");
      setEditingId(null);
      await refresh();
    } catch {
      toast.error("Failed to rename category.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: Category) => {
    try {
      await updateCategory(c.id, { enabled: !c.enabled });
      await refresh();
    } catch {
      toast.error("Failed to update category.");
    }
  };

  const reorder = async (c: Category, dir: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    try {
      await Promise.all([
        updateCategory(c.id, { order: swap.order }),
        updateCategory(swap.id, { order: c.order }),
      ]);
      await refresh();
    } catch {
      toast.error("Failed to reorder categories.");
    }
  };

  const del = async () => {
    if (!confirming) return;
    setDeleting(true);
    try {
      await deleteCategory(confirming.id);
      toast.success("Category deleted. Items keep their category label.");
      setConfirming(null);
      await refresh();
    } catch {
      toast.error("Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={add} className="surface rounded-2xl p-3">
        <h2 className="mb-2 font-display text-base font-bold text-white">Categories</h2>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name…"
            className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-accent-red px-3 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
      </form>

      {error ? (
        <p className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
          {error}
        </p>
      ) : loading ? (
        <p className="surface rounded-2xl px-3 py-8 text-center text-sm text-muted-foreground">
          Loading categories…
        </p>
      ) : categories.length === 0 ? (
        <p className="surface rounded-2xl px-3 py-8 text-center text-sm text-muted-foreground">
          No categories yet. Create one above. Items keep working with their default categories.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <div key={c.id} className="surface flex items-center gap-2 rounded-2xl p-2.5">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => void reorder(c, -1)}
                  disabled={c === categories[0]}
                  aria-label="Move up"
                  className="icon-glass flex h-5 w-7 items-center justify-center rounded text-muted-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void reorder(c, 1)}
                  disabled={c === categories[categories.length - 1]}
                  aria-label="Move down"
                  className="icon-glass mt-0.5 flex h-5 w-7 items-center justify-center rounded text-muted-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {editingId === c.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void saveEdit(c.id)}
                  autoFocus
                  className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm text-white outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-bold text-white",
                      !c.enabled && "opacity-40",
                    )}
                  >
                    {c.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {c.enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              )}

              <label className="flex items-center">
                <Switch
                  checked={c.enabled}
                  onCheckedChange={() => void toggle(c)}
                  aria-label="Toggle category"
                />
              </label>

              {editingId === c.id ? (
                <button
                  type="button"
                  onClick={() => void saveEdit(c.id)}
                  className="icon-glass flex h-9 w-9 items-center justify-center rounded-lg transition-transform active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent-red" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(c.id);
                    setEditName(c.name);
                  }}
                  aria-label="Rename category"
                  className="icon-glass flex h-9 w-9 items-center justify-center rounded-lg transition-transform active:scale-95"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setConfirming(c)}
                aria-label="Delete category"
                className="icon-glass flex h-9 w-9 items-center justify-center rounded-lg transition-transform active:scale-95"
              >
                <Trash2 className="h-4 w-4 text-accent-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirming}
        title="Delete category?"
        description={`"${confirming?.name ?? ""}" will be removed from the list. Existing items keep their category label.`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        busy={deleting}
        onConfirm={() => void del()}
        onCancel={() => !deleting && setConfirming(null)}
      />
    </section>
  );
}

/* ---------------- Ads ---------------- */

function AdsTab() {
  const { ads, loading, error, refresh } = useAdminAds();
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<Ad | null>(null);
  const [deleting, setDeleting] = useState(false);

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const imageUrl = cleanImageUrl(image);
    if (!/^https?:\/\//i.test(imageUrl)) {
      toast.error("Valid banner image URL required");
      return;
    }
    const linkUrl = link.trim();
    if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
      toast.error("Link must start with http(s)://");
      return;
    }
    setSaving(true);
    try {
      await createAd({ imageUrl, linkUrl });
      toast.success("Banner added");
      setImage("");
      setLink("");
      await refresh();
      window.dispatchEvent(new Event("aytr-admin-ads-refresh"));
    } catch {
      toast.error("Failed to add banner. Check database rules.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (ad: Ad) => {
    try {
      await toggleAd(ad.id, ad.active);
      await refresh();
    } catch {
      toast.error("Failed to update banner.");
    }
  };

  const del = async () => {
    if (!confirming) return;
    setDeleting(true);
    try {
      await deleteAd(confirming.id);
      toast.success("Banner deleted");
      setConfirming(null);
      await refresh();
    } catch {
      toast.error("Failed to delete banner.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={add} className="surface rounded-2xl p-3">
        <h2 className="mb-1 font-display text-base font-bold text-white">Ads / Banners</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Banners appear on the home page and before downloads.
        </p>
        <Field label="Banner image">
          <ImageUploadField value={image} onChange={setImage} folder={STORAGE.banners} />
        </Field>
        <Field label="Click link (optional)">
          <AdminInput value={link} onChange={setLink} placeholder="https://…" />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-red px-4 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add banner
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
          {error}
        </p>
      ) : loading ? (
        <p className="surface rounded-2xl px-3 py-8 text-center text-sm text-muted-foreground">
          Loading banners…
        </p>
      ) : ads.length === 0 ? (
        <p className="surface rounded-2xl px-3 py-8 text-center text-sm text-muted-foreground">
          No banners yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {ads.map((ad) => (
            <div key={ad.id} className="surface flex h-16 items-center gap-3 rounded-2xl p-2.5">
              <img
                src={cleanImageUrl(ad.imageUrl)}
                alt="Banner"
                width={64}
                height={44}
                loading="lazy"
                decoding="async"
                onError={onImageError}
                className={cn(
                  "h-11 w-16 shrink-0 rounded-lg bg-black/40 object-cover",
                  !ad.active && "opacity-40",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-muted-foreground">
                  {ad.linkUrl || "No link"}
                </p>
                <p className="text-[11px] font-bold text-white">
                  {ad.active ? "Active" : "Hidden"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void toggle(ad)}
                aria-label="Toggle banner"
                className="icon-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform active:scale-95"
              >
                {ad.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(ad)}
                aria-label="Delete banner"
                className="icon-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform active:scale-95"
              >
                <Trash2 className="h-4 w-4 text-accent-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirming}
        title="Delete banner?"
        description="This banner will be permanently removed."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        busy={deleting}
        onConfirm={() => void del()}
        onCancel={() => !deleting && setConfirming(null)}
      />
    </section>
  );
}

/* ---------------- Shared ---------------- */

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="max-w-sm border-white/10 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={busy}
            className="border-white/10 bg-background text-white hover:bg-white/5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!busy) onConfirm();
            }}
            className="bg-accent-red text-white hover:bg-accent-red/90"
          >
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block px-1 text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function AdminInput({
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
      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
    />
  );
}
