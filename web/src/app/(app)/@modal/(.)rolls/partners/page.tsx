// /rolls/partners is a real static page, but it's also a sibling of the
// dynamic (.)rolls/[id] interceptor -- without this literal match, Next's
// client-side router falls back to matching /rolls/partners against
// [id] (id="partners"), silently rendering the roll-edit modal with a
// "Roll not found" state instead of the real Partner History page. A
// literal sibling always wins over a dynamic one in Next's route
// resolution, same as the top-level [...catchAll] closes the modal for
// routes with no more specific match at all.
export default function RollsPartnersModalGuard() {
  return null;
}
