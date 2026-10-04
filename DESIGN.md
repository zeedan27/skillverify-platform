# SkillVerify Design System & UI Specification
> **Aesthetic DNA: Soft Neo-Brutalism** (Inspired by [VibeMastery.io](https://vibemastery.io/))  
> **Document Version:** 1.0.0  
> **Target Platform:** SkillVerify Web Application & Landing Page  
> **Governing Standards:** Conforms to `gemini.md` (Constitutional Data-First Architecture)

---

## 1. Executive Summary & Design DNA

The visual design system of **SkillVerify** adopts the **Soft Neo-Brutalist** aesthetic pioneered by high-energy, modern educational and developer platforms such as **VibeMastery.io**. 

Unlike sterile corporate platforms or flat SaaS designs, Soft Neo-Brutalism merges high visual energy, retro-modern tactile physics, and extreme structural clarity. It communicates confidence, transparency, and technical rigor through bold outlines, unapologetic high-contrast color blocks, physical button click states, and graph-paper blueprint backgrounds.

```
       ┌─────────────────────────────────────────────────────────┐
       │                   SOFT NEO-BRUTALISM                    │
       │                                                         │
       │   ✦ High-Contrast Outlines (2px – 4px Solid Black)      │
       │   ✦ Hard Offset Shadows (0px Blur, 100% Solid Pitch)    │
       │   ✦ Tactile Physical Micro-Interactions (Click-Down)    │
       │   ✦ Playful Geometric Geometry & Slanted Badges (-2°)   │
       │   ✦ Blueprint Graph-Paper & Subtle Grid Canvases        │
       │   ✦ Gamified Visual Feedback & Clear Status Hierarchy    │
       └─────────────────────────────────────────────────────────┘
```

---

## 2. Color Palette & Design Tokens

The color palette is built around an iconic **Warm Sunshine / Cyber Yellow** primary brand, backed by distinct functional pastels and vibrant status accents.

### 2.1 Color Swatches

| Token Name | Hex Code | Tailwind Utility | Visual Role / Usage |
|---|---|---|---|
| **Main / Cyber Yellow** | `#FFDC58` / `#FDE047` | `bg-main`, `bg-yellow-300` | Primary buttons, active highlights, key CTA badges, hero elements |
| **Canvas Background** | `#FFFDF5` / `#FFFFFF` | `bg-background` | Primary page canvas, card backgrounds |
| **Yellow Tint (Warm Grid)** | `#FEF9C3` (20-30%) | `bg-main/20` | Hero section canvas with graph pattern |
| **Pure Pitch (Borders/Text)**| `#000000` | `text-black`, `border-black` | All component borders, headers, hard drop shadows |
| **Muted Text** | `#4B5563` / `#1F2937` | `text-black/75`, `text-black/60` | Secondary descriptions, subtext, captions |
| **Success Mint** | `#B4F481` / `#22C55E` | `bg-green-400`, `bg-[#b4f481]` | Passed tests, "The Right Way" badges, positive checkpoints |
| **Success Mint Tint** | `#DCFCE7` / `#F0FDF4` | `bg-green-50`, `bg-green-100` | Success cards, passed state backgrounds |
| **Alert / Danger Red** | `#EF4444` | `bg-red-500` | Failed attempts, "Browser Builders" warning, integrity alerts |
| **Alert Red Tint** | `#FEE2E2` / `#FEF2F2` | `bg-red-50`, `bg-red-100` | Error cards, breakdown highlight, locked attempt status |
| **Warning Amber** | `#F59E0B` | `bg-amber-400` | Grooming required, attention alerts, timer urgency (< 1 min) |
| **Warning Amber Tint** | `#FEF3C7` | `bg-amber-50`, `bg-amber-100` | Diagnostic step cards, warning callouts |
| **Electric Blue** | `#60A5FA` / `#3B82F6` | `bg-blue-400` | Technical fundamentals, code modules, candidate info |
| **Electric Blue Tint** | `#DBEAFE` | `bg-blue-100` | Info pill tags, module headers |
| **Playful Purple** | `#C084FC` | `bg-purple-300` | Skill badges, grooming milestones, special tiers |
| **Urgent Pink** | `#F472B6` / `#FBCFE8` | `bg-pink-200` | Limited offers, special callout banners, exit-intent modals |

---

## 3. Structural Rules & Tactile Physics

The defining characteristic of VibeMastery’s UI is **tactile physicality**. Elements do not simply float with fuzzy Gaussian blurs; they resemble cut cardboard or physical tokens stamped onto a drafting table.

### 3.1 Borders & Corner Radii
* **Border Weight**:
  * Standard components, buttons, list items, pill tags: `border-2 border-black` (`2px solid #000000`).
  * Hero frames, comparison cards, major module containers: `border-4 border-black` (`4px solid #000000`).
  * Dividers & Internal Separation: `border-dashed border-black/20` or `border-2 border-black`.
* **Border Radius (`rounded-base`)**:
  * Cards & Containers: `rounded-xl` (`12px`) or `rounded-2xl` (`16px`).
  * Small Badges & Pill Tags: `rounded-full` or `rounded-md` (`6px`).
  * Slanted Highlighters: `rounded-sm` (`4px`) with `-rotate-1` or `-rotate-2`.

### 3.2 Hard Drop Shadows (Zero Blur)
Every elevated element casts a crisp, solid black shadow directly offset by `X` and `Y`:

```css
/* Tailwind Class Custom Syntax */
.shadow-btn-default  { box-shadow: 4px 4px 0px 0px #000000; }
.shadow-btn-small    { box-shadow: 2px 2px 0px 0px #000000; }
.shadow-card-heavy   { box-shadow: 8px 8px 0px 0px #000000; }
.shadow-card-hero    { box-shadow: 12px 12px 0px 0px #000000; }
.shadow-card-colored { box-shadow: 8px 8px 0px 0px #22C55E; } /* Red or Green branch variants */
```

### 3.3 The "Mechanical Button Press" Interaction
When a button or interactive card is hovered or clicked, it moves along the shadow vector and decreases shadow depth, simulating a physical mechanical switch:

```css
/* Button Interaction Recipe */
.neo-button {
  background-color: #FFDC58;
  color: #000000;
  font-weight: 900;
  border: 2px solid #000000;
  border-radius: 8px;
  box-shadow: 4px 4px 0px 0px #000000;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.neo-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000000;
}

.neo-button:active {
  transform: translate(4px, 4px);
  box-shadow: 0px 0px 0px 0px #000000;
}
```

### 3.4 Offset Layered Cards (Stacking Effect)
For highlighted cards (such as testimonials or callouts), duplicate the card silhouette in the background with a contrasting color offset by `8px` (`translate-x-2 translate-y-2`):

```html
<div class="relative group">
  <!-- Offset Accent Backing -->
  <div class="absolute inset-0 bg-green-200 border-2 border-black rounded-xl translate-x-2 translate-y-2 -z-10"></div>
  
  <!-- Foreground Card -->
  <div class="relative bg-white border-2 border-black rounded-xl p-6 shadow-sm">
    <h3 class="font-black text-xl">Verified Skill Score</h3>
    <p class="font-bold text-black/75">Scored 94% on TypeScript Architecture Assessment</p>
  </div>
</div>
```

---

## 4. Background Canvases & Blueprint Grid

Sections use a subtle blueprint grid pattern overlaid onto white or yellow-tinted backgrounds:

```html
<!-- Blueprint Grid SVG Pattern Background -->
<div class="relative bg-main/20 border-b-2 border-black overflow-hidden">
  <svg class="pointer-events-none absolute inset-0 h-full w-full stroke-black/10 fill-none z-0" aria-hidden="true">
    <defs>
      <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse" x="-1" y="-1">
        <path d="M.5 60V.5H60" stroke-width="1" stroke-dasharray="0" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
  </svg>
  
  <div class="relative z-10 max-w-7xl mx-auto px-4 py-16">
    <!-- Section Content Here -->
  </div>
</div>
```

---

## 5. Typography & Text Treatments

### 5.1 Font Stack
* **Primary Sans:** `Public Sans`, `Plus Jakarta Sans`, or `Inter` (`font-sans`).
* **Display / Headline Weight:** `font-black` (Weight: 900) with tight tracking (`tracking-tight`).
* **Subheading & Section Labels:** `font-bold` (Weight: 700).
* **Body Text:** `font-bold` or `font-medium` (Weight: 500/700, `text-black/80` or `text-black`).
* **Code / Verification Tokens:** `font-mono` (Weight: 700, `tracking-widest`).

### 5.2 Signature Neo-Brutalist Text Treatments

1. **Slanted Highlight Badges:**
   ```html
   <span class="inline-block bg-yellow-300 text-black font-black px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#000] -rotate-2 rounded-sm">
     Skill Verification
   </span>
   ```

2. **Inverted Punch-Out Tag:**
   ```html
   <span class="inline-block bg-black text-white font-black px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#FFDC58] -rotate-1 rounded-sm">
     Verified Pro
   </span>
   ```

3. **Status Pill with Pulsing Live Dot:**
   ```html
   <div class="inline-flex items-center gap-2 bg-white border-2 border-black px-3 py-1 rounded-full shadow-[3px_3px_0px_0px_#000] -rotate-2">
     <span class="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>
     <span class="text-xs font-black uppercase tracking-wider text-black">Live Assessment</span>
   </div>
   ```

4. **Underline / Marker Highlighter:**
   ```html
   <span class="bg-green-300 px-1 border-b-4 border-green-600 font-black text-black">
     Guaranteed 100% Verified
   </span>
   ```

---

## 6. Key Component Recipes

### 6.1 Interactive Split Before / After Slider
Used on VibeMastery hero to juxtapose broken code vs. clean UI.  
*In SkillVerify:* Use to showcase **Unverified Resume Claims** vs. **SkillVerify Authenticated Portfolio**.

* **Container:** `relative w-full h-[400px] border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000] overflow-hidden`
* **Badge Left:** Red pill `"Unverified Resume"`, top-left.
* **Badge Right:** Green pill `"SkillVerify Certified"`, top-right.
* **Center Drag Handle:** White pill `w-6 h-12 border-2 border-black rounded-md flex items-center justify-center cursor-ew-resize`.

### 6.2 Comparison Decision Flow (Branching Diagram)
Visual tree contrasting two paths:
1. **Top Node:** `"The Applicant / Candidate Submission"` (White box, 4px border, 4px shadow).
2. **Left Branch (Dashed Red Line):** `"Unverified Self-Reported CV"` → Leads to Red Card with Cons (exaggerated claims, zero code audit) → `"Result: Failed Hire / Wasted Time"`.
3. **Right Branch (Solid Green Line):** `"SkillVerify Validated"` → Leads to Green Tint Card with Pros (timed proctored quiz, integrity log, verified badge) → `"Result: High-Confidence Top Performer"`.

### 6.3 Checklist Card Rows
Clean horizontal bar items with icon circles:
```html
<div class="flex items-start gap-3 rounded-xl border-2 border-black bg-white p-3 font-bold text-black text-sm md:text-base shadow-[3px_3px_0px_0px_#000] hover:translate-x-1 transition-transform">
  <span class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-black bg-green-500 text-white mt-0.5">
    <svg class="size-3.5 stroke-[3]" ... />
  </span>
  <span>Proctored 15-minute randomized question pool</span>
</div>
```

### 6.4 Neo-Brutalist Accordion / FAQ Item
* When closed: `bg-white border-2 border-black shadow-[4px_4px_0px_#000]`
* When open: `bg-yellow-50 border-2 border-black shadow-none translate-x-[2px] translate-y-[2px]`
* Accordion trigger: Yellow bar header (`bg-main p-4 font-black`) with rotating chevron.

### 6.5 Retro 4-Point Sparkle Stars
SVG decorative accents placed in card corners:
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="size-10 text-yellow-400 rotate-12 fill-current stroke-black stroke-[4px]">
  <path d="M195 100c-87.305 4.275-90.725 7.695-95 95-4.275-87.305-7.695-90.725-95-95 87.305-4.275 90.725-7.695 95-95 4.275 87.305 7.695 90.725 95 95"></path>
</svg>
```

---

## 7. SkillVerify Specific Application Blueprint

Here is how each core feature of the SkillVerify project translates into the VibeMastery aesthetic:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SKILLVERIFY MODULE             NEO-BRUTALIST TREATMENT                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Quiz Engine & Timer         • Yellow header with bold digital countdown  │
│                                • 4 options styled as chunky white cards     │
│                                • Selected option: bg-yellow-300 + 4px shadow│
│                                • Red flashing warning if integrity flag hit │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Grooming Courses            • Step-by-step comic progression bar        │
│                                • Checkpoint micro-quiz in mint green card   │
│                                • Locked modules with hatched black lines    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Skill Badges (Certificates) • Bronze / Silver / Gold metallic cards      │
│                                • 12-char cryptographic code in bold mono    │
│                                • Inverted black sticker: "VERIFIED VALID"   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Employer Leaderboard        • Ranked rows (#1 Gold, #2 Silver, #3 Bronze)│
│                                • Integrity event pill tags (e.g. 2 tabs)    │
│                                • One-click "View Verified CV" yellow button │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. Public Portfolio            • Clean graph paper background               │
│                                • Verified quiz test score badges            │
│                                • Contact info hidden per RULE-023           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Tailwind CSS Configuration Extension

To enable this design system out-of-the-box in the SkillVerify frontend (`frontend/tailwind.config.js`):

```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        main: '#FFDC58',
        'main-foreground': '#000000',
        canvas: '#FFFDF5',
        'success-mint': '#B4F481',
        'alert-red': '#EF4444',
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
        'neo-xl': '12px 12px 0px 0px #000000',
        'neo-green': '8px 8px 0px 0px #22C55E',
        'neo-red': '8px 8px 0px 0px #EF4444',
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        'base': '10px',
      },
      fontFamily: {
        sans: ['Public Sans', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
};
```

---

## 9. Conclusion & Developer Checklist

Before pushing any frontend component in SkillVerify:
* [ ] Is the primary accent either `#FFDC58` (Main) or `#B4F481` (Success)?
* [ ] Are borders explicitly `border-2 border-black` or `border-4 border-black`?
* [ ] Does the element use zero-blur hard offset shadows (`shadow-[4px_4px_0px_#000]`) rather than fuzzy shadows?
* [ ] Does the button feature the mechanical press translation (`hover:translate-x-[2px] hover:translate-y-[2px]`)?
* [ ] Are important badges slightly slanted (`-rotate-1` or `-rotate-2`) for humanized neo-brutalist charm?
* [ ] Does the page or hero incorporate the blueprint graph-paper SVG pattern?
