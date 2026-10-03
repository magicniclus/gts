/** N’autorise qu’une redirection interne à l’espace propriétaire (pas de redirection ouverte). */
export function safeNext(next: string | null): string {
  return next &&
    /^\/espace-proprietaire(\/|$|\?)/.test(next) &&
    !next.includes("//") &&
    !next.includes("\\")
    ? next
    : "/espace-proprietaire/demandes";
}
