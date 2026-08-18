import { useRef, useState } from "react";
import { ref as sref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { CheckCircle2, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { storage } from "@/lib/firebase";
import { MAX_IMAGE_MB } from "@/lib/constants";
import { onImageError } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
}

export function ImageUploadField({ value, onChange, placeholder, folder = "uploads" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_MB} MB`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const fileRef = sref(storage, path);
      const task = uploadBytesResumable(fileRef, file);
      task.on(
        "state_changed",
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        () => {},
      );
      await task;
      const url = await getDownloadURL(fileRef);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Check Storage rules.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Paste image URL or upload"}
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-accent-red px-3 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? `${progress}%` : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>
      {uploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent-red transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="preview"
            onError={onImageError}
            className="h-16 w-16 rounded-lg border border-white/10 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear image"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-red text-white transition-transform active:scale-90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {!uploading && value && <FileOk />}
    </div>
  );
}

function FileOk() {
  return (
    <p className="flex items-center gap-1 text-[11px] text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" /> Image URL set <ImageIcon className="ml-1 h-3 w-3" />
    </p>
  );
}
