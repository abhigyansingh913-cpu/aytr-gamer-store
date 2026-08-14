import { useRef, useState } from "react";
import { ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { storage } from "@/lib/firebase";
import { onImageError } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
}

export function ImageUploadField({ value, onChange, placeholder, folder = "uploads" }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const ref = sref(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Check Storage rules.");
    } finally {
      setUploading(false);
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
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="preview"
            onError={onImageError}
            className="h-16 w-16 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
