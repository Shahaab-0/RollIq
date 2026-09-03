// Fallback for the @modal slot on a full page load (hard refresh, direct
// URL nav) -- ensures no leftover modal renders when nothing intercepted
// the request. See parallel-routes.md's "Modals" example.
export default function Default() {
  return null;
}
