"use client";

import { ChangeEvent, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";

type ImageFieldProps = {
  label: string;
  value: string;
  token: string;
  onChange: (url: string) => void;
  required?: boolean;
};

export function ImageField({ label, value, token, onChange, required }: ImageFieldProps) {
  console.log('value', value)
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "No se pudo subir la imagen");
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="field-label">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {value ? (
            <img className="h-full w-full object-cover" src={value} alt="" />
          ) : (
            <ImagePlus className="h-8 w-8 text-slate-400" />
          )}
        </div>
        <div className="space-y-3">
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleFile}
            required={required && !value}
          />
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {loading ? "Subiendo..." : "Subir imagen"}
          </button>
          <input
            className="field-input"
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://..."
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
