// Client-side navigation to any route the @modal slot doesn't have a match
// for (e.g. clicking a different sidebar link while a slide-over is open)
// would otherwise leave the last-intercepted modal stuck on screen -- see
// parallel-routes.md's "Closing the modal" section. This catch-all makes
// every unmatched route close it.
export default function ModalCatchAll() {
  return null;
}
