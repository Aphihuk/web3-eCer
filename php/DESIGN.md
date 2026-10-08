---
name: NFT LAO ຈຳກັດ
description: Blockchain certificate platform for Lao institutions and individuals — built in Laos, for Laos
colors:
  # Primary — Brand signal; landing page identity; network/chain state indicators
  chain-cyan: "#00aaff"

  # Secondary — App accent; primary actions in product screens (mint, connect, submit)
  deep-violet: "#7c3aed"

  # Tertiary — Verification confirmation; on-chain success state
  verify-teal: "#06d6a0"

  # Neutral — Background ramp, dark to elevated
  bg-base: "#0a0a0f"
  bg-surface: "#111118"
  bg-card: "#16161f"
  border-default: "#2a2a3a"

  # Text
  text-primary: "#e8e8f0"
  text-muted: "#7b7b96"

  # Semantic states (consistent across all pages)
  state-success: "#10b981"
  state-danger: "#f43f5e"
  state-warning: "#f59e0b"
  state-info: "#38bdf8"

typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Noto Sans Lao', sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Noto Sans Lao', sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "'Noto Sans Lao', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Space Mono', monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.04em"

rounded:
  pill: "999px"
  xl: "20px"
  lg: "16px"
  md: "12px"
  sm: "10px"
  xs: "8px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

components:
  button-brand-cta:
    backgroundColor: "{colors.chain-cyan}"
    textColor: "#000000"
    rounded: "{rounded.xs}"
    padding: "12px 28px"
  button-brand-cta-hover:
    backgroundColor: "#33bbff"
    textColor: "#000000"
    rounded: "{rounded.xs}"
    padding: "12px 28px"
  button-app-primary:
    backgroundColor: "{colors.deep-violet}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xs}"
    padding: "12px 24px"
  button-app-primary-hover:
    backgroundColor: "#6d28d9"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xs}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chain-cyan}"
    rounded: "{rounded.xs}"
    padding: "11px 24px"
  input-field:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  badge-verified:
    backgroundColor: "rgba(16,185,129,0.12)"
    textColor: "{colors.state-success}"
    rounded: "{rounded.pill}"
    padding: "3px 8px"
  badge-chain:
    backgroundColor: "rgba(0,170,255,0.08)"
    textColor: "{colors.chain-cyan}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: NFT LAO ຈຳກັດ

## 1. Overview

**Creative North Star: "The Lao Signal Tower"**

NFT LAO is the first blockchain certificate platform built in Laos, for Laos. The design system carries that origin as a visual statement, not a localization afterthought. Noto Sans Lao is not a fallback font; it is the primary visual anchor of the interface. The dark backdrop is not "because blockchain tools are dark" but because institutional credential systems are used at desks, in offices, under controlled ambient light, and the dark canvas makes chain data and certificate details legible at a glance.

The system rejects two aesthetics by name: the generic NFT marketplace look (neon gradients, speculative energy, trading-floor density) and Western SaaS minimalism (neutral cream, Notion-style white space, culturally neutral typography). NFT LAO is neither a trading platform nor a productivity tool. It issues certificates that institutions and employers will stake their credibility on. That specificity must be visible in every component.

Color strategy: **Restrained**. Chain Cyan carries the brand identity on the landing page and in network-state indicators. Deep Violet carries primary actions inside the product app (minting, connecting, submitting). Both appear sparingly against the 3-step dark neutral ramp. Their rarity is the point. When Chain Cyan appears, it means "live, connected, active on-chain." When Deep Violet appears, it means "the action that writes to the blockchain." Space Mono is the third visual layer: the language of data (wallet addresses, chain IDs, transaction hashes) speaks in monospace throughout.

**Key Characteristics:**
- Lao script as first-class visual identity; Noto Sans Lao at correct optical sizing (1.7 line-height at body sizes)
- Strict two-accent semantic system: cyan for chain state, violet for user actions
- Three-step tonal depth through background layering, never through box-shadows
- Space Mono as the "data language" wherever chain metadata appears
- Motion conveys state change and feedback; zero decorative animation at rest
- Institutional credibility over crypto spectacle at every decision point

## 2. Colors: The Signal Palette

Two signals against a near-black ground. Chain Cyan broadcasts presence and chain connectivity. Deep Violet confirms decisive action. Both are used at trace density; the dark neutral ramp does all the structural work.

### Primary
- **Chain Cyan** (`#00aaff`): The brand's broadcast frequency. Used for: network status dots, the "active" state on the landing nav CTA, chain ID badges, wallet-connected indicators, and border highlights on active form fields. Never used for body text; always communicates "live network state."

### Secondary
- **Deep Violet** (`#7c3aed`): The action color. Used for: mint NFT buttons, connect wallet button, primary CTA in product screens, progress indicators, and the focus ring on interactive elements. If Chain Cyan says "you are connected," Deep Violet says "take action."

### Tertiary
- **Verification Teal** (`#06d6a0`): The confirmation color. Appears only in on-chain verification states: verified badge, on-chain metadata indicator, success transaction hash labels. Never used decoratively. Its appearance means a certificate has been confirmed on the blockchain.

### Neutral
- **Void Base** (`#0a0a0f`): The lowest layer. Page background for product screens.
- **Elevated Surface** (`#111118`): Cards, panels, modals — the first level above base.
- **Raised Card** (`#16161f`): Nested content within surfaces (NFT info panels, attribute groups).
- **Boundary Line** (`#2a2a3a`): All borders and dividers. Never decorative; always structural.
- **Primary Text** (`#e8e8f0`): Headings, labels, data values. The only reading-weight text color.
- **Supporting Text** (`#7b7b96`): Descriptions, secondary metadata, placeholder hints. Must maintain ≥4.5:1 contrast against Void Base.

### Semantic States
- **Live Green** (`#10b981`): On-chain confirmed, transaction success, verified.
- **Alert Red** (`#f43f5e`): Transaction failed, unauthorized wallet, validation error.
- **Caution Amber** (`#f59e0b`): Pending transaction, IPFS-hosted (not fully on-chain), optional warning.
- **Info Sky** (`#38bdf8`): HTTP metadata, informational notices, non-critical flags.

### Named Rules
**The Two Signals Rule.** Chain Cyan and Deep Violet are never used on the same element or in the same interaction. Cyan announces state; Violet requests action. If a button needs to show "connected AND primary action," express connection through a status badge (cyan) and the button separately (violet).

**The Rarity Rule.** Neither accent appears on more than 10% of any screen surface. Accent color on a dark background carries weight by contrast; overuse collapses that contrast relationship into noise.

## 3. Typography

**Display Font:** Syne (800 weight, landing/marketing headings only)
**Body Font:** Noto Sans Lao (300–800 weight range, all content)
**Data/Label Font:** Space Mono (400/700, all blockchain data and status labels)

**Character:** Noto Sans Lao is the workhorse and the identity. It handles the primary content language and all product UI labels, with weight variation (300→800) providing the full hierarchy without introducing a second sans. Syne appears only at display scale on marketing surfaces — its geometric confidence contrasts with Noto Sans Lao's humanist curves, signaling "headline moment" distinctly. Space Mono is the third voice: cool, precise, technical, reserved for data that comes directly from the chain.

### Hierarchy

- **Display** (Syne 800, `clamp(2.5rem, 6vw, 5rem)`, line-height 1, tracking -0.04em): Landing page hero headings only. Never in the product app. Max 6rem enforced.
- **Headline** (Noto Sans Lao 700, `clamp(1.5rem, 3vw, 2rem)`, line-height 1.2, tracking -0.02em): Page-level headings (NFT gallery title, admin section headers, mint form title). Use `text-wrap: balance`.
- **Title** (Noto Sans Lao 700, `1.1rem`, line-height 1.4): Card titles, modal headings, pricing plan names.
- **Body** (Noto Sans Lao 400, `1rem`, line-height 1.7): All descriptive content. Noto Sans Lao requires 1.7 line-height at body sizes for Lao script readability — do not reduce to 1.5. Max line length 65–75ch in prose contexts.
- **Label** (Space Mono 700, `0.75rem`, tracking 0.04em, normal case): Chain IDs, wallet address prefixes, token IDs, status badge text, transaction hash displays. Normal case only — never uppercase on Space Mono labels; the monospace already signals "data."
- **Caption** (Noto Sans Lao 400, `0.85rem`, line-height 1.6): NFT descriptions, secondary metadata, auth helper text.

### Named Rules
**The Mono Is Data Rule.** Space Mono appears only where the content originates from the blockchain: addresses, hashes, chain IDs, token IDs, contract names. Never use it for marketing copy, UI labels, or headings. If text is in Space Mono, the user knows it came from the chain.

**The Lao Script Line-Height Rule.** Noto Sans Lao at body size requires `line-height: 1.7`. Below 1.65, Lao characters with ascenders and descenders collide. This applies in all languages displayed in Noto Sans Lao, including mixed Lao/English paragraphs.

## 4. Elevation

This system uses **tonal layering exclusively**. There are no box-shadows at rest. Depth is expressed through three background levels: Void Base (`#0a0a0f`) → Elevated Surface (`#111118`) → Raised Card (`#16161f`). Each step is a distinct visual layer; nesting goes no deeper than three levels.

Shadows appear in exactly one context: as a **state response** to interaction. A card on hover or a modal on open gains a diffuse shadow (`0 20px 40px rgba(0,0,0,0.4)`) not to express elevation hierarchy, but to signal that the element is in an active state. The shadow is feedback, not decoration.

No backdrop-filter blur on primary content cards. Glassmorphism is reserved for the navigation bar (positioned over page content, where the blur is functional — it prevents content from distracting from nav links) and the modal backdrop overlay. Every other surface uses a solid opaque background from the tonal ramp.

### Shadow Vocabulary
- **Hover lift** (`0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(124,58,237,0.15)`): NFT gallery cards on hover. The violet micro-glow connects the hover state to the app accent.
- **Modal entrance** (`0 32px 64px rgba(0,0,0,0.5)`): Modals only; reinforces the modal's position above the page.

### Named Rules
**The Flat-By-Default Rule.** Every surface is flat at rest. Shadows are interactive feedback, not structural hierarchy. If you're adding a shadow to a resting element, question whether the tonal level is doing enough work first.

## 5. Components

### Buttons

**Direct and decisive.** A button looks like a button: solid fill, clear label, confident 8px corner radius. No ambiguity about interactivity.

- **Shape:** Gently squared corners (8px / `{rounded.xs}`). The 8px radius says "functional tool," not "playful app" and not "clinical right-angle."
- **Brand CTA (landing):** Chain Cyan (`#00aaff`) background, black text (`#000`), weight 700. Used only on the landing page for primary visitor actions ("Mint FNT", "ເລີ່ມໃຊ້ງານດຽວນີ້"). The only button with black text — cyan is bright enough to support it.
- **App Primary (product):** Deep Violet (`#7c3aed`) background, primary text (`#e8e8f0`), weight 700. Used for: connect wallet, submit mint form, confirm actions. Hover: `#6d28d9` (10% darker), translateY(-2px). Active: translateY(0). Glow: `0 0 30px rgba(124,58,237,0.3)` on hover only.
- **Ghost:** Transparent background, Chain Cyan border (1.5px), Chain Cyan text. Used for secondary actions alongside a primary button. Hover: `rgba(0,170,255,0.08)` fill.
- **Danger:** Alert Red (`#f43f5e`) background, white text. Used only for destructive actions (revoke certificate, remove from blacklist).
- **Focus ring:** `outline: 2px solid var(--chain-cyan); outline-offset: 3px` on all buttons via `:focus-visible`. Applies to all button variants.
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, no transform or shadow.

### Inputs / Fields

- **Style:** Raised Card background (`#16161f`), boundary border (1px `#2a2a3a`), 10px radius (`{rounded.sm}`), body-size text.
- **Placeholder:** Supporting Text color (`#7b7b96`). Must maintain ≥4.5:1 contrast against the input background.
- **Focus:** Border shifts to Deep Violet (`#7c3aed`), `box-shadow: 0 0 0 3px rgba(124,58,237,0.15)`. No color change to background.
- **Error:** Border shifts to Alert Red (`#f43f5e`), `box-shadow: 0 0 0 3px rgba(244,63,94,0.12)`.
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`.
- **Labels:** Noto Sans Lao 500, 0.8rem, normal case. No uppercase tracking on form labels.

### Status Badges / Chips

The primary micro-component of this system. Appears in the NFT gallery verify strip, wallet info, and chain status indicators.

- **Shape:** Pill (`999px` radius). Short labels (2–4 words).
- **Verified:** Teal-tinted background (`rgba(16,185,129,0.12)`), Verification Teal text (`#10b981`), teal border (`rgba(16,185,129,0.35)`). Space Mono 700, 0.65rem.
- **Chain/Network:** Cyan-tinted background (`rgba(0,170,255,0.08)`), Chain Cyan text, cyan border. Space Mono 700, 0.7rem. A pulsing dot (`animation: pulse 2s infinite`) precedes the chain ID.
- **Warning/HTTP:** Amber-tinted (`rgba(245,158,11,0.1)`), Caution Amber text.
- **Error/Unverified:** Red-tinted (`rgba(244,63,94,0.1)`), Alert Red text.

**Rule:** Status badges use text labels, never color alone. A colorblind user must be able to read "VERIFIED" or "UNVERIFIED" from the label, not infer it from the color.

### Cards / Containers

- **Corner Style:** 16px (`{rounded.lg}`) for gallery cards and surface panels; 20px (`{rounded.xl}`) for modals and featured pricing cards.
- **Background:** Elevated Surface (`#111118`) for primary cards; Raised Card (`#16161f`) for nested content within cards.
- **Border:** 1px Boundary Line (`#2a2a3a`) at rest.
- **Hover:** Border shifts to Deep Violet on interactive cards. Hover lift shadow applies. `translateY(-6px)` vertical lift.
- **Internal Padding:** `1.2rem 1.5rem` standard; `1.5rem 2rem` for modals and prominent surfaces.
- **Nested cards are prohibited.** A card within a card is always wrong. Use the three-level tonal ramp instead: base → surface → card.

### Navigation

- **Style:** `position: fixed`, full-width, `background: rgba(13,17,23,0.88)`, `backdrop-filter: blur(14px)`. The backdrop-filter is purposeful here: the nav sits above scrolling page content and must stay legible.
- **Height:** 68px.
- **Logo:** Noto Sans Lao 700, `#e2e8f0`. The "NFT LAO" part in Chain Cyan.
- **Links:** Noto Sans Lao 500, `#7b7b96` at rest; `#e2e8f0` on hover; bottom border 2px Chain Cyan on active. No uppercase.
- **Mobile:** Collapses to hamburger at ≤768px. Links become full-width in a drawer.

### NFT Certificate Card

The signature component. Appears in the gallery, mint confirmation, and certificate sharing views.

- **Image area:** 1:1 aspect ratio, `object-fit: cover`. Scale 1.05 on parent hover (the card zoom, not a card lift). Rounded top corners match the card.
- **Overlay badges:** Token ID (top-left, pill, glass-tinted backdrop) and suspicious flag (top-right, Alert Red). These use `backdrop-filter: blur(8px)` purposefully because they sit directly on image content.
- **Info strip:** Title in Title weight (Noto Sans Lao 700, 1rem). Collection in Deep Violet (`#7c3aed`, 0.75rem). Address in Supporting Text. Description in Caption with 2-line clamp.
- **Verify strip:** The bottom band containing all chain-state badges. Separated by a 1px Boundary Line from the info strip. Uses the status badge vocabulary above.

## 6. Do's and Don'ts

### Do:
- **Do** use Noto Sans Lao at `line-height: 1.7` for all body text in Lao script. Line heights below 1.65 cause Lao characters to visually collide.
- **Do** use Chain Cyan exclusively for network/chain state: active dots, network badges, wallet-connected indicators, focus borders. This semantic precision is the whole point of having two accents.
- **Do** use Space Mono for any text that originates from the blockchain: wallet addresses, transaction hashes, chain IDs, token IDs, contract addresses. No exceptions.
- **Do** show blockchain data prominently. Wallet addresses, chain IDs, verification status, and transaction hashes should be surfaced at the top of the information hierarchy. Transparency is the product's core value.
- **Do** use `focus-visible` outlines on all interactive elements: `2px solid #00aaff, offset 3px`. Keyboard users must be able to follow focus on every page.
- **Do** label status badges with text. "VERIFIED" and "UNVERIFIED" must be readable as words, not inferred from color alone.
- **Do** set `lang="lo"` on all HTML documents containing Lao-language content.
- **Do** add `@media (prefers-reduced-motion: reduce)` to all CSS files. Every animation must have a motion-reduced alternative (typically instant transition or no transition).

### Don't:
- **Don't** use `background-clip: text` with a gradient for any heading or label. This is the single most recognizable AI design tell. Use a solid brand color for emphasis; use weight and size for hierarchy. Prohibited on every surface.
- **Don't** use glassmorphism (`backdrop-filter: blur`) on primary content cards or form cards. Blur is reserved for the nav bar (functional) and modal backdrop overlay (functional). Every other card uses a solid opaque surface from the tonal ramp.
- **Don't** use bounce or elastic easing (`cubic-bezier` with overshoot, `bounceIn` keyframes). All transitions use ease-out exponential curves: `cubic-bezier(0.16, 1, 0.3, 1)` or `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Don't** make the interface look like a generic NFT marketplace. No floor prices, no speculative language, no OpenSea-style card grids with rarity stats. This platform issues certificates, not collectibles.
- **Don't** use Western SaaS design language: no cream/sand backgrounds, no culturally neutral Inter-body-text layouts, no Notion-like white space. The Lao identity should be unmistakable.
- **Don't** use uppercase tracking on form labels or UI labels. Reserve uppercase for status badge text (short, 1–3 words, Space Mono only) and nowhere else in the product interface.
- **Don't** use arbitrary z-index values (999, 9999). The semantic scale is: `--z-sticky: 10; --z-dropdown: 20; --z-modal-backdrop: 30; --z-modal: 40; --z-toast: 50; --z-tooltip: 60`.
- **Don't** nest cards inside cards. Use the three-level tonal background ramp (base → surface → card). A fourth nesting level is always a structural mistake.
- **Don't** use the same CSS token name with different values across files. `--muted` in `serve.css` is `#7ea3c4`; in `index.css` it is `#6b6b80`. This is a cross-file collision that makes the brand incoherent. All token definitions belong in a single shared `css/tokens.css`.
- **Don't** animate backgrounds, gradients, or layout properties decoratively. The rotating `bgShift` animation in `auth.css` (scaled, rotated `::before`) adds GPU cost with zero communicative value and no reduced-motion alternative.
