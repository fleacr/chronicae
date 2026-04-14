# Design System Strategy: The Radiant Pulse

## 1. Overview & Creative North Star
**Creative North Star: The Radiant Pulse**

This design system moves away from the sterile, clinical nature of traditional health tracking. Instead, it positions itself as "The Radiant Pulse"—a living, breathing digital companion that mirrors the resilience of the human spirit. 

We reject the "boxed-in" template look. Our signature style relies on **intentional asymmetry** and **high-contrast editorial typography**. By using overlapping elements and organic tonal shifts, we create a sense of renewal and movement. The UI should feel less like a database and more like a premium lifestyle journal—one that celebrates progress through warmth, light, and breathable space.

---

## 2. Colors: Tonal Depth & Warmth
The palette is rooted in the energy of a rising sun, transitioning from deep, resilient reds to vibrant, renewing oranges.

### The Palette (Material Design Tokens)
- **Primary:** `#ac2d00` (The heart of the system; used for critical actions)
- **Primary Container:** `#d63c05` (Used for vibrant hero states and gradients)
- **Background:** `#fef8f6` (A warm, off-white neutral that avoids clinical coldness)
- **Surface Tiers:** 
    - `surface_container_lowest`: `#ffffff` (Purest white for elevated cards)
    - `surface_container_low`: `#f8f2f0` (Subtle depth)
    - `surface_container_high`: `#ede7e5` (Stronger definition)
- **Accents (Tertiary):** `#9c3f20` (Earth tones for supportive data visualization)

### Creative Directives
- **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to create a soft "zone" rather than a hard box.
- **Signature Textures:** For main CTAs and progress rings, utilize a linear gradient from `primary` (#ac2d00) to `primary_container` (#d63c05). This adds a "soul" to the interface that flat colors cannot replicate.
- **The Glass & Gradient Rule:** For floating navigation bars or top-level alerts, use Glassmorphism. Set the background to 80% opacity of `surface_container_lowest` with a `backdrop-filter: blur(20px)`. This allows the warmth of the background to bleed through, softening the overall aesthetic.

---

## 3. Typography: Editorial Authority
We use **Manrope** across all scales. It is a modern, geometric sans-serif that balances technical precision with a friendly, open curve.

- **Display (lg/md/sm):** Used for "Big Wins"—daily step totals, mood summaries, or welcoming headers. These should be set with tight tracking (-2%) to feel like a premium magazine.
- **Headline (lg/md/sm):** Reserved for section titles. Ensure generous top margin to let the content breathe.
- **Body (lg/md):** Primary reading font. We prioritize readability over density. Set line height to 1.6 for an airy, supportive feel.
- **Labels (md/sm):** Use `on_surface_variant` (#5b4039) with increased letter spacing (+5%) to give metadata a sophisticated, organized look.

---

## 4. Elevation & Depth: The Layering Principle
We convey hierarchy through **Tonal Layering** rather than heavy shadows or structural lines.

- **Stacking Surfaces:** Instead of a flat grid, treat the UI as stacked sheets of fine paper. Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft, natural lift.
- **Ambient Shadows:** When a "floating" effect is required (e.g., a FAB or a critical insight card), use extra-diffused shadows:
  - **X/Y:** 0, 8px
  - **Blur:** 24px
  - **Color:** `#1d1b1a` at 6% opacity.
  - This mimics natural light, preventing the UI from looking "heavy."
- **The "Ghost Border" Fallback:** If a container requires definition against a complex background, use a **Ghost Border**: `outline_variant` (#e4beb4) at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Human-Centric Elements

### Buttons
- **Primary:** Pill-shaped (`rounded-full`). Uses the signature gradient (`primary` to `primary_container`). Text is `on_primary` (#ffffff) in `title-sm` weight.
- **Secondary:** Surface-colored with a subtle `outline_variant` ghost border. 
- **Tertiary:** Text-only, using `primary` (#ac2d00) for a clean, minimalist prompt.

### Cards & Insights
- **Rule:** Forbid the use of divider lines. 
- **Structure:** Use vertical whitespace (1.5rem to 2rem) and `surface_container` shifts to separate content. Insight cards should utilize `xl` (1.5rem) corner radius to feel approachable and soft.

### Data Visualization (The Progress Halo)
- Health tracking rings should not use thin lines. They should have a 12px weight with rounded caps, using the primary gradient. Background tracks for charts should use `surface_container_highest` at 40% opacity.

### Selection Chips
- **Active State:** `primary_fixed` (#ffdbd1) background with `on_primary_fixed` (#3b0900) text.
- **Inactive State:** `surface_container_high` (#ede7e5).

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical margins. For example, a header might have a 32px left margin while a sub-description has a 48px margin to create an editorial flow.
- **Do** prioritize thumb-friendly interaction. Keep primary touch targets (Buttons, Chips) at a minimum height of 48px.
- **Do** use `body-lg` for emotional supportive text—make the app's voice feel large and present.

### Don't
- **Don't** use pure black (#000000) for text. Always use `on_surface` (#1d1b1a) to maintain a soft, premium contrast.
- **Don't** use standard "Material Design" blue or green for success states. Leverage the warm tones of the system to indicate health and vitality.
- **Don't** crowd the screen. If a tracking metric isn't essential for the current view, hide it. Whitespace is a feature, not a void.