---
name: Image asset editing
description: ImageMagick is available for precise raster text edits when Python imaging libraries are absent.
---

For small, exact text changes to existing raster artwork, use the installed ImageMagick binary and preserve the original as a separate source asset.

**Why:** The workspace may not have Python imaging libraries installed, while ImageMagick is available and can preserve the original composition for targeted edits.

**How to apply:** Prefer a programmatic ImageMagick overlay for localized text-panel changes; visually inspect the resulting asset before wiring it into the app.