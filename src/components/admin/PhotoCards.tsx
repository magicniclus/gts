"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import type { ActionResult } from "@/lib/admin/result";
import type { PhotoSettings } from "@/lib/schemas/settings";
import { ImageUploader } from "./ImageUploader";
import { PageHeader } from "./PageHeader";
import { SavedLabel } from "./SavedLabel";
import { useToast } from "./Toast";

type Slot = "portrait" | "logoLight" | "logoDark";

const CARDS: {
  slot: Slot;
  field: "portraitUrl" | "logoLightUrl" | "logoDarkUrl";
  label: string;
  where: string;
  ratio: string;
  bg: string;
  maxDim: number;
  png: boolean;
  fallback: string | null;
}[] = [
  {
    slot: "portrait",
    field: "portraitUrl",
    label: "Portrait de Guillaume",
    where: "Section « Qui suis-je » de la page d’accueil",
    ratio: "4/5",
    bg: "bg-accent-800",
    maxDim: 1400,
    png: false,
    fallback: null,
  },
  {
    slot: "logoLight",
    field: "logoLightUrl",
    label: "Logo, fond clair",
    where: "En-tête du site",
    ratio: "16/9",
    bg: "bg-surface",
    maxDim: 800,
    png: true,
    fallback: "/logo-navy.png",
  },
  {
    slot: "logoDark",
    field: "logoDarkUrl",
    label: "Logo, fond foncé",
    where: "Pied de page et espace propriétaire",
    ratio: "16/9",
    bg: "bg-accent-900",
    maxDim: 800,
    png: true,
    fallback: "/logo-white.png",
  },
];

type Props = {
  initial: PhotoSettings;
  updatedAt: string | null;
  upload: (form: FormData) => Promise<ActionResult<string>>;
  remove: (i: { slot: string }) => Promise<ActionResult>;
  saveAlt: (i: { portraitAlt: string }) => Promise<ActionResult>;
};

/** Portrait 4:5, logo fond clair, logo fond foncé : Remplacer et Retirer. */
export function PhotoCards({ initial, updatedAt, upload, remove, saveAlt }: Props) {
  const toast = useToast();
  const [photos, setPhotos] = useState(initial);
  const [savedAt, setSavedAt] = useState(updatedAt);
  const [alt, setAlt] = useState(initial.portraitAlt);
  const [pending, start] = useTransition();
  const touch = () => setSavedAt(new Date().toISOString());

  return (
    <>
      <PageHeader
        title="Photos & logos"
        sub="Remplacez le portrait et les logos du site. Le changement est immédiat."
        aside={<SavedLabel savedAt={savedAt} />}
      />
      <div className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
        {CARDS.map((c) => {
          const custom = photos[c.field];
          const src = custom ?? c.fallback;
          const logo = c.slot !== "portrait";
          return (
            <section
              key={c.slot}
              aria-label={c.label}
              className="grid content-start gap-3.5 rounded-card bg-white p-4"
            >
              <div
                className={cx(
                  "relative grid place-items-center overflow-hidden rounded-tile",
                  c.bg,
                )}
                style={{ aspectRatio: c.ratio }}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={logo ? `${c.label} (aperçu)` : photos.portraitAlt}
                    fill
                    sizes="320px"
                    className={logo ? "object-contain p-[15%]" : "object-cover"}
                  />
                ) : (
                  <span className="grid justify-items-center gap-2 text-sm text-white/70">
                    <Icon name="image" size={36} />
                    Aucune photo
                  </span>
                )}
              </div>
              <div>
                <h2 className="m-0 text-base font-bold">{c.label}</h2>
                <p className="mt-1 mb-0 text-[13px] leading-snug text-text/65">{c.where}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <ImageUploader
                  label="Remplacer"
                  maxDim={c.maxDim}
                  keepTransparency={c.png}
                  fields={{ slot: c.slot }}
                  upload={upload}
                  onUploaded={(url) => {
                    setPhotos((p) => ({ ...p, [c.field]: url }));
                    touch();
                  }}
                />
                {custom && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const r = await remove({ slot: c.slot });
                        if (r.ok) {
                          setPhotos((p) => ({ ...p, [c.field]: null }));
                          touch();
                          toast("success", logo ? "Logo d’origine rétabli." : "Photo retirée.");
                        } else toast("error", r.error);
                      })
                    }
                  >
                    {logo ? "Logo d’origine" : "Retirer"}
                  </Button>
                )}
              </div>
              {c.slot === "portrait" && (
                <form
                  className="grid gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    start(async () => {
                      const r = await saveAlt({ portraitAlt: alt });
                      if (r.ok) {
                        setPhotos((p) => ({ ...p, portraitAlt: alt }));
                        setSavedAt(r.savedAt);
                        toast("success", "Description enregistrée.");
                      } else toast("error", r.error);
                    });
                  }}
                >
                  <Field id="portrait-alt" label="Description de la photo (référencement)">
                    <Input
                      id="portrait-alt"
                      value={alt}
                      maxLength={200}
                      onChange={(e) => setAlt(e.target.value)}
                    />
                  </Field>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="justify-self-start"
                    disabled={pending || alt === photos.portraitAlt}
                  >
                    Enregistrer la description
                  </Button>
                </form>
              )}
            </section>
          );
        })}
      </div>
      <p className="mt-4 mb-0 max-w-[70ch] text-sm leading-normal text-text/70">
        Les photos sont redimensionnées automatiquement (5 Mo au maximum). Pour les logos, préférez
        un PNG à fond transparent.
      </p>
    </>
  );
}
