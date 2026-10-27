# CLAUDE.md — Instructions for Claude / Agentic AI

## Project Context & Overview
Application: **Gaskara Coffee** — Full-stack web system for coffee shop operations.
Repository Rules: Strictly adhere to `PRD.md`, `DESIGN.md`, and memory rules in `.claude/projects/`.

---

## Strict Rules & Invariants (DO NOT VIOLATE)

### 1. Business Logic Rules (PRD)
- **Self-pickup counter only:** NO table numbers (`table_number`). Use `daily_queue_number` and `customer_name`.
- **Order types:** Exactly 2 values: `'dine_in'` or `'takeaway'`.
- **No stock management:** NO inventory subtraction or stock limits. Availability is boolean `is_available`.
- **Dummy payments:** Verification is manual by cashier (`'cash'` or static `'qris'`).
- **POS Catalog:** Strictly text-only with ZERO `<img>` elements (PRD Rule 5).

### 2. Design System & Layout Invariants (DESIGN.md)
- **Customer Menu Card Alignment:**
  - Photo container: Preserved at `w-24 h-24 aspect-square` (96x96px), `rounded-xl`, `object-cover`.
  - Text info container: `flex-1 min-w-0 h-24 flex flex-col justify-between py-0` with parent `flex gap-3 items-start`.
  - Title: `truncate leading-snug` (y = 0 aligned with top edge of photo).
  - Description: `line-clamp-2 leading-relaxed mt-0.5`.
  - Bottom action bar: Fixed height `h-7` (28px) for Price, Add Button, Stepper, and Sold-out badge. Anchored to `y = 96px` (aligned horizontally with bottom edge of photo).
- **Price Font Styling:**
  - Standard font Montserrat (`font-bold text-slate-900`). DO NOT use `font-mono` on prices in ANY view (Customer Web, POS Kasir, Admin Dashboard, Reports). All price figures strictly use standard font.
- **Zero Blank Gap:**
  - Dynamic bottom padding: `cart.length > 0 ? 'pb-24' : 'pb-4'`.
- **Zero-Jitter & Consistent Sizing:**
  - Active and inactive button states MUST keep consistent 1px borders (e.g. `border-red-600` vs `border-slate-200`) to prevent 2px layout jitter.
  - POS menu cards locked to `h-[92px]` with `line-clamp-2` to prevent box resizing across categories (Snack/Coffee).
  - Scrollable grids must use `[scrollbar-gutter:stable]` to prevent horizontal width expansion when filtering categories with fewer items.
  - Queue TV header letter G badge (`h-8`) must align with text container (`h-8 flex flex-col justify-between py-0.5`).
- **Queue Display Viewport:**
  - Locked to `fixed inset-0 overflow-hidden` without scrollbars.
- **Category Sorting Order:**
  - Always sort menus by: `1. Coffee` -> `2. Non-Coffee` -> `3. Snack`, then by `created_at`.

### 3. Architecture & Code Conventions
- **Database Architecture:** Dual-mode service in `lib/db-service.ts` supporting Supabase PostgreSQL + Realtime and LocalStorage fallback.
- **UUID Requirements:** Primary and foreign keys MUST be valid hex UUIDs (`[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`).
- **Event Bus:** Event dispatches `gaskara_order_updated` and `gaskara_menu_updated` trigger instant cross-component updates.

---

## Agent Onboarding Checklist for Next Session
When starting a new conversation session:
1. Read `PRD.md` and `DESIGN.md`.
2. Inspect `lib/db-service.ts` for database calls and local fallback logic.
3. Check memory file `design-system-invariants.md`.
4. Run `npm run build` to ensure no Turbopack / Next.js segment errors before committing changes.
