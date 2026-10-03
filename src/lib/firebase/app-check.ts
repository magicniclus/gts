"use client";

/**
 * Jeton App Check (reCAPTCHA Enterprise) pour le formulaire public.
 * Sans clé de site (développement, émulateurs), renvoie undefined.
 * Chargé à la demande : n’alourdit pas le premier rendu.
 */
export async function getAppCheckToken(): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return undefined;
  try {
    const [{ getApp, getApps, initializeApp }, ac] = await Promise.all([
      import("firebase/app"),
      import("firebase/app-check"),
    ]);
    const { PROJECT_ID, STORAGE_BUCKET } = await import("./config");
    const app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: PROJECT_ID,
          storageBucket: STORAGE_BUCKET,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
    const appCheck = ac.initializeAppCheck(app, {
      provider: new ac.ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: false,
    });
    return (await ac.getToken(appCheck, false)).token;
  } catch {
    return undefined;
  }
}
