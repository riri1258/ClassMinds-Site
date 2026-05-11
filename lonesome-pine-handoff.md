# The Lonesome Pine — Design Handoff

**Project:** Website redesign mockup
**Client:** The Lonesome Pine Restaurant & Bar — Deerwood, MN
**Deliverable:** `lonesome-pine-mockup.html` (single-file responsive HTML)
**Branch:** `claude/redesign-lonesome-pines-FguOu`

---

## 1. Concept

A modernized vintage supper-club look that keeps the brand's existing **olive green + white** color story (taken from the current site and merch — "olive green hats embroidered with a white logo") but elevates the typography, layout, and storytelling to feel like a place worth driving an hour for.

Reference touchpoints: 1970s Northwoods Minnesota supper clubs, hand-lettered cabin signage, printed dinner menus on cream cardstock.

---

## 2. Color Palette

| Token         | Hex        | Use                                          |
| ------------- | ---------- | -------------------------------------------- |
| `--pine-900`  | `#1a2e1a`  | Footer background, deepest greens            |
| `--pine-800`  | `#243f24`  | Hero, dark sections, primary brand green     |
| `--pine-700`  | `#2d4f2d`  | Card backgrounds on dark sections, "Visit"   |
| `--pine-600`  | `#3a6238`  | Eyebrow labels, script accents on cream      |
| `--pine-500`  | `#4a7846`  | Sub-labels, ornaments                        |
| `--sage`      | `#aab98a`  | Muted highlight on dark sections             |
| `--cream`     | `#fbf8ed`  | Page background (light sections)             |
| `--white`     | `#ffffff`  | Buttons, primary text on dark, photo frames  |
| `--ink`       | `#1a2e1a`  | Body text on cream                           |
| `--muted`     | `#5e6b50`  | Secondary text, captions                     |

No amber, no red, no warm browns — keeps it on-brand.

---

## 3. Typography

| Family               | Role                                       | Source       |
| -------------------- | ------------------------------------------ | ------------ |
| **Yeseva One**       | Display headlines, prices, hours days      | Google Fonts |
| **Cormorant Garamond** (italic) | Body copy, ledes, dish descriptions | Google Fonts |
| **Allura**           | Script accents ("a perfect", "drive", "kept", "pull up"), wordmark | Google Fonts |
| **DM Mono**          | Eyebrows, nav, button labels, small caps   | Google Fonts |

Already loaded via the single `<link>` at the top of the HTML — no install needed.

---

## 4. Page Structure

1. **Nav** — transparent, sits on hero. Allura wordmark + pine icon + uppercase mono nav links.
2. **Hero** — Deep pine background, layered SVG pine-tree skyline (no photo), hand-stamped circular "Est. 1972" seal rotated -12°, headline with script flourish, address/phone/hours/special meta row.
3. **Intro / Our Story** — Two-column: copy + stacked photo frames. Three stat blocks below.
4. **Signature Dishes** — Dark green section, 3-card grid with photos, tag, name, description, price.
5. **Menu Peek** — Cream section, two columns ("From the Grill", "From the Pasta Pot") with dotted-leader menu items.
6. **Visit** — Dark pine section, contact info + double-border hours card with closed days greyed.
7. **Reserve CTA** — Centered, "The fire's lit…" headline with script.
8. **Footer** — Pine-900 background with brand, visit info, sitemap, social.

---

## 5. Real Content (preserved verbatim)

| Field        | Value                                  |
| ------------ | -------------------------------------- |
| Address      | 13726 Katrine Drive, Deerwood, MN 56444 |
| Phone        | (218) 678-2874                          |
| Hours        | Mon–Wed closed · Thu 4–9p · Fri 4–10p · Sat 4–10p · Sun 4–9p |
| Signatures   | Pan-Fried Walleye · Slow-Roasted Prime Rib (Fri/Sat) · Langostino Lobster Linguini · Prime Rib Grilled Cheese · Bourbon Street Pasta · Manicotti · Shrimp Linguini · Center-Cut Ribeye · Sirloin Tip |
| Atmosphere   | Polished cedar tables, full bar, kids' playground out back |

Prices and the "Est. 1972" date are placeholder — please confirm.

---

## 6. Imagery

All photos are Unsplash placeholders. **Before launch, replace with real photography of:**

- Hero: a wide exterior shot of the restaurant at dusk OR the dining room (currently replaced with vector pine illustration — keep or swap as preferred)
- Intro stack: one plated dish, one dining room interior
- Three dish cards: walleye, prime rib, langostino linguini

Photos in the Intro section get a slight desaturation + white frame; dish photos get a mild grayscale/sepia treatment to harmonize with the green palette.

---

## 7. Logo

The pine-tree icon used in nav and footer is a **placeholder SVG**. Replace with the official Lonesome Pine logo file — drop a PNG/SVG into the repo and swap the inline `<svg>` blocks in two places (nav `.brand` and footer `.brand`).

---

## 8. Responsive

Single breakpoint at **900px**: nav collapses (hamburger TBD), grids stack, photo stack lays flat, dish grid becomes single-column.

Tested visually at:
- 1440px (desktop)
- 1024px (tablet)
- 390px (iPhone)

---

## 9. Implementation Notes

- **Single file**, no build step, no JS framework. Drop `lonesome-pine-mockup.html` on any host and it works.
- Google Fonts loaded via single CDN link.
- Paper-grain texture is an inline SVG data-URI (no external asset).
- Pine silhouettes in the hero are inline SVG (no external asset).
- Est. seal is inline SVG with `<textPath>` for the curved text.
- Total page weight (excluding photos): **~18 KB HTML + Google Fonts**.
- Photos lazy-load from Unsplash at ~700–900px wide.

---

## 10. Open Decisions / Next Steps

- [ ] Confirm "Est." year — 1972 is a guess, please verify
- [ ] Provide official logo file
- [ ] Provide real photography (hero, intro, three dishes)
- [ ] Confirm menu prices (currently placeholder ranges)
- [ ] Wire reservation button to actual system (OpenTable, Resy, phone-only?)
- [ ] Decide hamburger menu pattern for mobile
- [ ] PDF menu link — what URL does "Download Full Menu" point to?
- [ ] Decide if you want the hero photo back (lake at dusk, exterior shot, etc.) or keep the all-vector pine skyline

---

## 11. Files

| File                          | Purpose                              |
| ----------------------------- | ------------------------------------ |
| `lonesome-pine-mockup.html`   | The complete mockup, self-contained  |
| `lonesome-pine-handoff.md`    | This document                        |
