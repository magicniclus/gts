"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { clientAuth } from "@/lib/firebase/client";
import { safeNext } from "@/lib/safe-next";

const GENERIC = "E-mail ou mot de passe incorrect.";

/** Message lisible pour une erreur Firebase Auth (les codes de mauvais identifiants restent génériques). */
function authMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : "";
  switch (code) {
    case "auth/too-many-requests":
      return "Trop de tentatives. Patientez quelques minutes ou réinitialisez le mot de passe.";
    case "auth/network-request-failed":
      return "Connexion à Firebase impossible. Vérifiez votre réseau.";
    case "auth/user-disabled":
      return "Ce compte est désactivé.";
    case "auth/operation-not-allowed":
      return "La connexion par e-mail n’est pas activée dans Firebase Authentication.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Configuration Firebase invalide (clé d’API).";
    default:
      return GENERIC;
  }
}

class SessionError extends Error {}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setPending(true);
    try {
      const auth = clientAuth();
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken(true);
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      // Le cookie de session suffit : on ne garde pas de session Firebase côté navigateur.
      await signOut(auth);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new SessionError(typeof body.error === "string" ? body.error : GENERIC);
      }
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
      router.refresh();
    } catch (err) {
      if (!(err instanceof SessionError)) console.error("Connexion Firebase :", err);
      setError(err instanceof SessionError ? err.message : authMessage(err));
      setPending(false);
    }
  };

  const reset = async () => {
    setError("");
    if (!email.trim()) {
      setInfo("Saisissez votre e-mail, puis cliquez à nouveau sur « Mot de passe oublié ? ».");
      return;
    }
    try {
      await sendPasswordResetEmail(clientAuth(), email.trim());
    } catch {
      // Même message dans tous les cas (protection contre l’énumération des comptes).
    }
    setInfo(
      "Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.",
    );
  };

  return (
    <form onSubmit={login} noValidate className="mt-7 grid gap-4">
      <Field id="login-email" label="E-mail">
        <Input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field id="login-password" label="Mot de passe">
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <button
        type="button"
        onClick={reset}
        className="-mt-1 min-h-11 cursor-pointer justify-self-start text-sm font-semibold text-accent hover:text-accent-600"
      >
        Mot de passe oublié ?
      </button>
      <Button
        type="submit"
        size="xl"
        block
        disabled={pending || !email || !password}
        className="min-h-[54px]"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      {error && (
        <p
          role="alert"
          className="m-0 rounded-field bg-danger-bg px-4 py-3 text-sm font-semibold text-danger-fg"
        >
          {error}
        </p>
      )}
      {info && (
        <p
          role="status"
          className="m-0 rounded-field bg-accent-100 px-4 py-3 text-sm text-accent-800"
        >
          {info}
        </p>
      )}
    </form>
  );
}
