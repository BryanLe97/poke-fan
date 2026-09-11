# E2E tests

This suite is a **small, illustrative demonstration** of E2E testing for
CI/CD — a handful of representative flows, not full coverage. A real
production app would have many more cases: every page, every form
validation path, every error/retry combination, cross-browser runs,
accessibility checks, visual regression, etc. This is deliberately kept
minimal so it runs quickly on every push without turning the deploy
pipeline into a long-running test farm.

What's covered, and why these specific cases:

- `browse.spec.ts` — search finds the expected Pokemon and navigating
  into its detail page shows the right data. The "happy path" that
  proves the app's core loop actually works end-to-end, not just in
  isolated unit tests.
- `errors.spec.ts` — the name-index fetch failing (Browse's outer
  ErrorBoundary) and a single card's fetch failing (its own isolated
  ErrorBoundary, per the "why Browse fetches each card independently"
  README section) — the two error paths this project's architecture is
  built around, verified against a real running build rather than
  reasoned about from code alone.
- `favourites.spec.ts` — favouriting/un-favouriting from Browse shows up
  (and disappears) on the Favourites page, and grouping a favourite then
  deleting the group leaves the favourite itself untouched — the other
  core data-feature loop the exercise asks for, alongside search.
