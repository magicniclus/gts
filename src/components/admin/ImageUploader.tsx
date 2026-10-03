"use client";

import { useId, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import type { ActionResult } from "@/lib/admin/result";
import { useToast } from "./Toast";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Refuse ce qui n’est pas une image ou dépasse la taille maximale. */
export function checkImage(file: File, maxSize = MAX_UPLOAD_BYTES): string | null {
  if (!file.type.startsWith("image/")) return "Ce fichier n’est pas une image.";
  if (file.size > maxSize)
    return `Image trop lourde : ${Math.round(maxSize / 1024 / 1024)} Mo au maximum.`;
  return null;
}

/** Réduit l’image dans le navigateur (côté le plus long ≤ maxDim) ; garde le PNG si transparence. */
async function resize(file: File, maxDim: number, keepTransparency: boolean): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = keepTransparency ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
    if (!blob) return file;
    return new File([blob], keepTransparency ? "image.png" : "image.jpg", { type });
  } catch {
    return file;
  }
}

type Props = {
  label: string;
  maxDim: number;
  keepTransparency?: boolean;
  maxSize?: number;
  /** Champs ajoutés au FormData (ex. slot, id d’article). */
  fields: Record<string, string>;
  upload: (form: FormData) => Promise<ActionResult<string>>;
  onUploaded: (url: string) => void;
};

/** Bouton « Remplacer » : contrôle, redimensionnement, envoi vers Storage par Server Action. */
export function ImageUploader({
  label,
  maxDim,
  keepTransparency = false,
  maxSize,
  fields,
  upload,
  onUploaded,
}: Props) {
  const id = useId();
  const toast = useToast();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const problem = checkImage(file, maxSize);
    setError(problem ?? "");
    if (problem) return;
    start(async () => {
      const resized = await resize(file, maxDim, keepTransparency);
      const form = new FormData();
      for (const [k, v] of Object.entries(fields)) form.set(k, v);
      form.set("file", resized);
      const r = await upload(form);
      if (r.ok) {
        onUploaded(r.data);
        toast("success", "Image enregistrée.");
      } else {
        setError(r.error);
        toast("error", r.error);
      }
    });
  };

  return (
    <div className="grid justify-items-start gap-2">
      <input
        id={id}
        type="file"
        accept="image/*"
        className="peer sr-only"
        disabled={pending}
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={buttonClasses({
          size: "sm",
          className: `peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${pending ? "pointer-events-none opacity-45" : ""}`,
        })}
      >
        <Icon name="upload-simple" size={18} />
        {pending ? "Envoi…" : label}
      </label>
      {error && (
        <p role="alert" className="m-0 text-[13px] font-semibold text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}
