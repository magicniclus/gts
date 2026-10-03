"use client";

import { useState, useTransition } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ActionResult } from "@/lib/admin/result";
import { useToast } from "./Toast";

/** Envoi d’un formulaire admin : Server Action, erreurs par champ, toast, « Enregistré à hh:mm ». */
export function useSaveForm<T extends FieldValues, R>(
  form: UseFormReturn<T>,
  action: (values: T) => Promise<ActionResult<R>>,
  initialSavedAt: string | null,
  onSaved?: (data: R, values: T) => void,
) {
  const toast = useToast();
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [pending, start] = useTransition();
  const submit = form.handleSubmit(
    (values) =>
      new Promise<void>((resolve) =>
        start(async () => {
          const r = await action(values);
          if (r.ok) {
            setSavedAt(r.savedAt);
            form.reset(values);
            onSaved?.(r.data, values);
            toast("success", "Modifications enregistrées.");
          } else {
            for (const [name, message] of Object.entries(r.fieldErrors ?? {})) {
              form.setError(name as Path<T>, { message });
            }
            toast("error", r.error);
          }
          resolve();
        }),
      ),
    () => toast("error", "Vérifiez les champs signalés."),
  );
  return { submit, savedAt, pending, dirty: form.formState.isDirty };
}
