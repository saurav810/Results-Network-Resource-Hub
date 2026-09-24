<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1v2crC998fiEuJ2plWFjiMBTIB_eF1Ir1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Resource Hub tour

Use **Quick tour of the Resource Hub** near the Resource Hub title to start or restart the six-step tour.
Add `?tour=true` to the app URL to start the tour automatically on every page load,
even if the visitor previously completed or dismissed it.
If the URL already has a query string, append `&tour=true`. In Hivebrite, this
parameter belongs on the iframe `src`, not the surrounding page URL.

Completion, **Skip tour**, and Escape still save a preference under
`resource-hub:tour:v1` in local storage. The explicit URL parameter overrides that
preference for each visit. Dismissing or completing the tour keeps it closed for
the rest of that page load; reloading `?tour=true` starts it again. URLs without
`?tour=true` do not start the tour automatically. Manual restart always remains
available, and the tour works even when browser storage is blocked.

The tour loads on demand. It waits for resource loading to finish and uses fallback
targets when filters or cards are missing. It does not change search/filter values,
open resource dialogs, or access the surrounding Hivebrite document. Escape and
**Skip tour** end it immediately and return focus to the quick tour link.

Before publishing, check the actual Hivebrite embed at desktop and mobile widths:

- Tab through Back, Next, Skip, and Finish; try Escape and manual restart.
- Confirm each step and its progress are announced with a screen reader.
- Check short iframe heights, browser zoom, orientation changes, and reduced motion.
- Complete the tour, reload `?tour=true`, and confirm it starts again at step 1.
- Dismiss the tour and interact with the Hub: it should stay closed until a reload or manual restart.
- Load a URL without `?tour=true` and confirm the tour only starts when requested manually.
- Check a slow connection, failed resource loading, and a search with no results.

Tour popovers are constrained to the iframe viewport. The app cannot correct an
iframe clipped by the host page or automatically scroll the surrounding Hivebrite
page. Keep the iframe itself visible during the tour and verify its real dimensions.

Validation commands: `npm run build` and `npx tsc --noEmit`.
