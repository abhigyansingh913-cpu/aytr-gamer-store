import { useRef, useState } from "react";
import { ref as sref, getDownloadURL } from "firebase/storage";
import { File, FileUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearStorageObject, uploadToStorageResumable } from "@/lib/store-data";
import { storage } from "@/lib/firebase";
import { MAX_FILE_MB } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
}

/** Storage path without the protocol/domain, used to delete the object. */
function toStoragePath(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/o\/([^?]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function FileUploadField({
  value,
  onChange,
  folder = "files",
  accept,
  maxSizeMB = MAX_FILE_MB,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (accept && !file.name.toLowerCase().endsWith(accept.split(",")[0])) {
      toast.error(`File type not allowed (expected ${accept})`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMB} MB`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const task = uploadToStorageResumable(path, file, setProgress);
      await task;
      const url = await getDownloadURL(sref(storage, path));
      onChange(url);
      toast.success("File uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Check Storage rules and retry.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = async () => {
    const path = toStoragePath(value);
    setDeleting(true);
    try {
      if (path) await clearStorageObject(path);
    } catch {
      /* non-fatal — the URL reference is cleared regardless */
    } finally {
      onChange("");
      setDeleting(false);
      toast.success("File removed");
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
          <span className="icon-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <File className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">File attached</p>
            <p className="truncate text-[10px] text-muted-foreground">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || deleting}
            className="flex h-9 items-center gap-1 rounded-lg bg-accent-red px-2.5 text-[11px] font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileUp className="h-3.5 w-3.5" />
            )}
            Replace
          </button>
          <button
            type="button"
            onClick={() => void removeFile()}
            disabled={uploading || deleting}
            aria-label="Delete file"
            className="icon-glass flex h-9 w-9 items-center justify-center rounded-lg text-accent-red transition-transform active:scale-95 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent-red/50 hover:text-white disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading… {progress}%
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" /> Upload file (max {maxSizeMB} MB)
            </>
          )}
        </button>
      )}
      {uploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent-red transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
    </div>
  );
}
