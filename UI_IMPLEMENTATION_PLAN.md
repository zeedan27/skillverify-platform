# UI Implementation Plan: Soft Neo-Brutalism
> **Project:** SkillVerify
> **Reference:** `DESIGN.md` (Soft Neo-Brutalist Design System)
> **Goal:** Step-by-step technical implementation roadmap for the frontend.

---

## Phase 1: Foundation & Global Setup
**Objective:** Establish the design tokens, fonts, and global CSS required for the Neo-Brutalist aesthetic.

### 1.1 Tailwind Configuration
Update `frontend/tailwind.config.js` or `frontend/tailwind.config.ts` to include the specific design tokens.
* **Colors:** Extend theme with `main` (#FFDC58), `canvas` (#FFFDF5), `success-mint` (#B4F481), `alert-red` (#EF4444).
* **Box Shadows:** Define zero-blur solid shadows:
  * `neo-sm`: `2px 2px 0px 0px #000000`
  * `neo`: `4px 4px 0px 0px #000000`
  * `neo-lg`: `8px 8px 0px 0px #000000`
* **Border Radii & Widths:** Add `base: 10px` and `border-3: 3px`.
* **Fonts:** Set up `Public Sans`, `Space Grotesk`, or `Inter` as the primary sans font.

### 1.2 Global CSS & Canvas
Update `frontend/src/app/globals.css` (or equivalent global stylesheet).
* Set the base `body` background to the `canvas` color.
* Define the `grid-pattern` SVG background class using `stroke-black/10` and `60x60` sizing.
* Add base typography rules to ensure high contrast and legibility (e.g., standardizing `font-black` for headers).
* Implement custom utility classes for the "mechanical button press" transitions if they are too complex for inline Tailwind (though inline is preferred).

---

## Phase 2: Core Reusable Components (Design System Library)
**Objective:** Build the foundational UI components that will be used across all features.

### 2.1 `NeoButton`
* **Props:** `variant` (primary, secondary, danger, ghost), `size`, `isFullWidth`.
* **Styling:** `border-2 border-black rounded-base font-bold shadow-neo transition-all duration-150`.
* **Interaction:** `hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`.

### 2.2 `NeoCard`
* **Props:** `variant` (default, layered, stacked-green, stacked-red), `padding`.
* **Styling:** Basic `border-2 border-black rounded-base shadow-neo bg-white`.
* **Layered Effect:** For the stacked variant, use an absolute positioned pseudo-element or a wrapper div with `translate-x-2 translate-y-2` and a distinct background color (e.g., `bg-green-200`) pushed behind the main card (`-z-10`).

### 2.3 `NeoBadge` / `NeoPill`
* **Props:** `color`, `slanted` (boolean), `pulsingDot` (boolean).
* **Styling:** `border-2 border-black rounded-full px-3 py-1 font-black uppercase text-xs`.
* **Slant:** Apply `-rotate-1` or `-rotate-2` conditionally based on the `slanted` prop.

### 2.4 `NeoAccordion` (For FAQs & Course Modules)
* **Styling:** Header row with `bg-main border-2 border-black`. 
* **Interaction:** When opened, the content panel slides down, and the entire accordion container shifts slightly (`translate-x-[2px] translate-y-[2px]`) to mimic a pressed physical folder.

---

## Phase 3: Complex Interactive Widgets
**Objective:** Build the standout marketing and educational widgets.

### 3.1 `BeforeAfterSlider` (Landing Page)
* **Structure:** A container with `overflow-hidden border-4 border-black rounded-2xl`.
* **Logic:** Use a controlled range input (opacity 0) overlaid on the container to dictate the `clip-path: inset(0 X% 0 0)` of the "Before" overlay image.
* **UI:** Add a vertical divider bar with a chunky grip handle (`cursor-ew-resize`) and absolute positioned `NeoBadges` for "Before" (Red) and "After" (Green).

### 3.2 `BranchingDiagram` (Flow Visualizer)
* **Structure:** Flex/Grid layout positioning `NeoCards` as nodes.
* **SVG Connectors:** Use absolute positioned SVG paths to draw the connecting lines.
  * Dashed red line (`stroke-dasharray="8 8" stroke="#EF4444" stroke-width="4"`).
  * Solid green line (`stroke="#22C55E" stroke-width="4"`).

### 3.3 `DecorativeSparkle`
* **Structure:** Simple SVG React component for the 4-point star used in card corners.
* **Styling:** Accepts `className` to allow positioning (e.g., `absolute -top-4 -right-4 rotate-12 text-main`).

---

## Phase 4: SkillVerify Feature Integration
**Objective:** Apply the Design System to the actual application routes based on `gemini.md` business rules.

### 4.1 Landing Page & Auth
* **Hero Section:** Graph paper background, slanted highlight tags (`<span class="bg-black text-white px-2 -rotate-1...">`), and the `BeforeAfterSlider`.
* **Auth Forms:** Chunky inputs with `border-2 border-black focus:ring-4 focus:ring-main focus:outline-none`.

### 4.2 Quiz Engine UI (`QuizAttempt`)
* **Timer Bar:** Fixed top bar with a countdown. Changes to `bg-amber-400` when < 1 minute.
* **Question Cards:** Large, readable typography.
* **Options:** Rendered as `NeoCards`. When selected, change background to `bg-main`, increase shadow depth, and add a black checkmark icon.
* **Integrity Alerts (RULE-018):** If a blur/tab switch occurs, flash a transient red `NeoBadge` at the top right: `"⚠️ Focus Lost"`.

### 4.3 Grooming Courses & Checkpoints (`CourseProgress`)
* **Module Layout:** Vertical timeline with a left-hand border path connecting modules.
* **Video/Text Nodes:** `NeoCard` displaying content.
* **Checkpoint Quizzes:** Special mint-green `NeoCard` representing the micro-quiz required to unlock the next state (`RULE-019`).

### 4.4 Leaderboard & Pipelines
* **Leaderboard Rows:** 
  * Rank 1: Gold accented card with sparkle SVGs.
  * Rank 2-3: Silver/Bronze accents.
  * Badges for integrity flags (`RULE-018`): E.g., `NeoPill` with `"2 Tab Switches"` in `alert-red`.
* **Kanban / Pipeline:** Employer view uses columns of `NeoCards` for candidates. Drag-and-drop applies a slanted tilt (`rotate-2`) while dragging.

### 4.5 Public Portfolio (`PublicPortfolio`)
* **Profile Header:** Clean blueprint background, large typography for the candidate's name.
* **Verified Credentials:** Showcase `SkillBadge` objects as actual digital cards (like Pokémon cards) with holographic/metallic CSS gradients enclosed in thick black borders, displaying the cryptographic `verifyCode`.

---

## Phase 5: Polish & Accessibility
* **Responsive Adjustments:** Reduce shadow depths on mobile (e.g., `shadow-[4px_4px_0px]` becomes `shadow-[2px_2px_0px]`) to save screen real estate.
* **Focus Management:** Ensure all interactive elements have a high-contrast focus state (e.g., `focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2`).
* **Animations:** Keep animations snappy and hardware-accelerated (`transform`, `opacity`). Avoid animating box-shadow directly if it causes layout thrashing; animate a pseudo-element instead, or rely on instant state snaps which fit the Brutalist theme well.
