# Computer Engineering Glossary

Thai study glossary with 155 topics: mathematics, algorithms, and 11 areas of computer engineering. Includes local MathJax, sourced illustrations/GIFs, step-by-step worked examples, code/pseudocode, and self-check questions.

Read: https://nack-thanaphon.github.io/computer-engineering-glossary/

## Local use
Open `index.html` in a browser. All rendering assets are local; no build or install is required. The site opens to a 19-category learning library. A sidebar is available on large screens; a category selector appears at 900px and below. Search opens lesson results. Categories and individual lesson IDs support URL hash links.

## Publishing
GitHub Pages serves the root of the main branch. Push updated static files to main to publish. `.nojekyll` disables Jekyll processing.

## Sources and licenses
See [SOURCES.md](SOURCES.md). Images retain their original licenses and credits; MathJax is Apache-2.0 (license in glossary-assets). Examples are teaching models: some simplify hardware, timing, and system behavior.

## Interface
The light interface uses a restrained green palette, responsive course cards, and [Lucide 1.50.0](https://lucide.dev/) icons bundled locally under ISC. `design.css` contains the design system, and `app.js` handles navigation, search, course filters, and lesson controls. Visual direction references Brilliant; the identity and learning content belong to this glossary.

## PWA / offline use
Install from the browser menu or the site's Install button. On iPhone/iPad, open in Safari and use Share → Add to Home Screen. The shell, formula renderer and app icons are cached after the first online visit. Use the offline download button to save all illustrations/GIFs (about 30 MB); wait for the ready message before disconnecting. Browser storage can be cleared or evicted by the device.

The worker stays on a coherent cached version. When a newer worker is waiting, the Update button activates it and reloads. Run `python3 scripts/build-pwa.py` after editing the site and before pushing; this refreshes the worker's content version and offline asset list.

Mobile page zoom is restricted via viewport, touch-action and gesture handling. Search/select controls use 16px text to avoid iOS focus auto-zoom. Browsers may override zoom restrictions for accessibility. Pinch gestures cannot be used to zoom images; single-finger scrolling remains enabled.
