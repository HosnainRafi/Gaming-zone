import { ImageIcon, Upload, X } from "lucide-react";
import { useRef } from "react";

interface Props {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

/**
 * Resizes an image file to max 500px wide and returns a JPEG data URL.
 * Falls back to original if canvas is unavailable.
 */
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const MAX_WIDTH = 500;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  placeholder = "https://...",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeToDataUrl(file);
    onChange(dataUrl);
    // reset so same file can be picked again
    e.target.value = "";
  }

  const hasImage = value && value.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* URL input row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Upload image from device"
          className="flex items-center gap-1.5 rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm text-slate-300 transition hover:border-violet-500/50 hover:text-white whitespace-nowrap"
        >
          <Upload size={14} />
          Upload
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Thumbnail preview */}
      {hasImage ? (
        <div className="relative mt-1 inline-flex">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-auto max-w-[200px] rounded-lg border border-gz-border object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            title="Remove image"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-400"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-1 flex h-20 w-36 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-gz-border text-slate-500 transition hover:border-violet-500/50 hover:text-slate-300"
        >
          <ImageIcon size={20} />
          <span className="text-xs">Click to upload</span>
        </button>
      )}
    </div>
  );
}
