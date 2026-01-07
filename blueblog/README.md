Short, direct answer first — then the plan.

**Skeletons:** manage both **route-level** and **component-level**:

* Use **route-level `loading.tsx`** for page skeletons (one per route folder) so Next shows them automatically while data loads.
* Use **component skeletons** (in `components/skeletons/`) for reusable pieces (PostCardSkeleton, SidebarSkeleton, TableSkeleton, PageHeaderSkeleton, AdminLayoutSkeleton). Page `loading.tsx` should compose these component skeletons.
* Admin: one shared admin skeleton (header + sidebar + content skeleton) used across all admin route `loading.tsx`.

---

# Plan (brief + detailed) — hard-coded light UI with rich blue → purple gradient system, Tailwind-based

Goal: ditch theme toggles for now, ship a beautiful, consistent, animated light UI (soft off-white background) with blue→purple gradient accents, persistent elevation (black shadows) for light mode, strong animated buttons, smooth hover/transform behavior, and a single source of truth for styles and skeletons. No logic changes.

## 1 — Color & visual system (Tailwind + CSS vars)

We’ll hard-code a single visual theme (light-first) with a friendly gradient accent.

Design tokens (hexs — add to `tailwind.config.ts` under `extend.colors`):

* Background (page): `--bg: #F7FAFC` (very light)
* Foreground (text): `--fg: #0f172a` (near-black)
* Card surface: `--card: #ffffff`
* Muted (panels): `--muted: #F1F5F9`
* Border (soft): `--border: #E6EEF8`
* Accent gradient: `#6366F1` → `#8B5CF6` → `#EC4899`
  (Tailwind entries: `accent-start: #6366F1`, `accent-mid: #8B5CF6`, `accent-end: #EC4899`)

Add colors in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      bg: '#F7FAFC',
      fg: '#0f172a',
      card: '#ffffff',
      muted: '#F1F5F9',
      border: '#E6EEF8',
      accentStart: '#6366F1',
      accentMid: '#8B5CF6',
      accentEnd: '#EC4899',
    }
  }
}
```

## 2 — Animations & motion tokens

Global CSS (or Tailwind `@keyframes`) for consistent animation:

* `--ease` = `cubic-bezier(0.16, 1, 0.3, 1)`
* Button hover scale: `transform: scale(1.04)` with 180–220ms
* Gradient animation: 6s linear infinite (slow, dreamy)
* Shadow transitions: 180–260ms

Keyframes we’ll use:

* `gradientMove` — background-position shifting
* `skeleton-shimmer` — for skeletons

## 3 — Shadows / Elevation (light mode: black toned)

Standard elevation utilities (all in global CSS / utilities so you reuse):

* `elev-sm` → `box-shadow: 0 6px 18px rgba(0,0,0,0.12)`
* `elev-md` → `box-shadow: 0 12px 30px rgba(0,0,0,0.18)`
* `elev-lg` → `box-shadow: 0 18px 44px rgba(0,0,0,0.24)`
* Header bottom shadow: `shadow-header: 0 12px 36px -12px rgba(0,0,0,0.22)` (use on header/body top)

**Rule:** use these classes instead of inline rgba everywhere.

## 4 — Button behavior (single source: `components/ui/Button.tsx`)

Required behaviors (you insisted):

* **Default state:** subtle glow (shadow) visible by default
* **Hover state:** glow *reduces* or changes, and size increases slightly (scale up)
* **Active:** small scale down `.active:scale-[0.98]` (already typical)
* Use CVA variant props for `variant: default | secondary | outline | ghost | link` and `size: sm | default | lg | icon`

Example classes for default variant:

* Default base: `bg-gradient-to-r from-accentStart via-accentMid to-accentEnd text-white`
* Box-shadow(default): `elev-sm`
* On hover: `hover:elev-lg hover:scale-105 transition-[transform,box-shadow] duration-220 ease-[var(--ease)]`
* To get glow-present-by-default: add `shadow-glow` (a softer blurred spread)

**Important:** For nav active button and login button, use Button component or use `buttonVariants` classes applied to `<Link>` anchors (wrap Link with `className={cn(buttonVariants({...}))}`).

## 5 — Header & Nav rules

* Header is a `bg-card` container, use `shadow-header` (always) — this ensures visible separation.
* Nav links should be rendered as `<Link className={cn(buttonVariants({ variant: active ? 'default' : 'ghost', size: 'sm' }))}>` — this makes nav visually consistent.
* Keep mobile menu (framer-motion) but use `elev-md` for the mobile panel.

## 6 — Skeleton strategy (where + what)

* Folder: `components/skeletons/`

  * `PostCardSkeleton.tsx`
  * `SidebarSkeleton.tsx`
  * `PageHeaderSkeleton.tsx`
  * `TableSkeleton.tsx`
  * `AdminLayoutSkeleton.tsx` (header + sidebar + content skeleton)
* Route-level: add `loading.tsx` to these route folders:

  * `/app/page` (homepage) → use `PageHeaderSkeleton` + multiple `PostCardSkeleton`
  * `/app/blog/loading.tsx` → show `SidebarSkeleton` + `PostCardSkeleton` grid
  * `/app/category/loading.tsx`
  * `/app/(public)/about/loading.tsx` etc.
  * `/app/admin/(protected)/loading.tsx` → use `AdminLayoutSkeleton`
* Component-level skeletons are imported into route `loading.tsx` — **I may add those imports when I edit page files.**

## 7 — Files / repo structure (recommended)

```
components/
  ui/
    Button.tsx
    Input.tsx
    Modal.tsx
  skeletons/
    PostCardSkeleton.tsx
    PageHeaderSkeleton.tsx
    SidebarSkeleton.tsx
    AdminLayoutSkeleton.tsx
app/
  (public)/
    layout.tsx
    page.tsx
    blog/
      loading.tsx
      page.tsx
  admin/
    (protected)/
      loading.tsx
      layout.tsx
      dashboard/page.tsx
```

## 8 — Coding rules (your “locked” rules)

* **No logic changes.** I will not change fetch, auth, prisma logic.
* **Only visual edits** (CSS classes, imports for skeletons, Button styles).
* **If a component doesn’t import a skeleton and it makes sense, I will add the import.**
* **Add clear comments** in modified files (small header comment block) describing visual changes.
* **Prefer Button component** everywhere; if the file uses raw `<button>` I’ll keep logic and decorate visually.
* **I will not change API routes or Prisma queries** unless they clearly break build (I’ll mention instead of changing).
* **If a page needs a `loading.tsx` I will add it.**

## 9 — Concrete Tailwind utility plan (what you will use in JSX)

* Background: `bg-bg` (or `bg-[var(--bg)]` if using CSS vars)
* Card surfaces: `bg-card`
* Elevation: `elev-sm elev-md elev-lg` (predefined in global CSS)
* Button: `btn btn-lg btn-sm` (Button component maps to these)
* Nav active: `btn btn-sm btn-active` (applies primary gradient + elev-sm)
* Gradient classes: `bg-gradient-to-r from-accentStart via-accentMid to-accentEnd gradient-animate`
* Animation helper: `ui-transition ui-lift`

## 10 — Example tiny code snippets (how to use)

Nav link:

```tsx
<Link href="/blog" className={cn(buttonVariants({variant: active?'default':'ghost', size:'sm'}))}>
  Blog
</Link>
```

Hero gradient CTA:

```tsx
<Button size="lg" className="gradient-animate">
  Read Blog <ArrowRight className="ml-2 h-4 w-4"/>
</Button>
```

Route-level loading (example):

```tsx
// app/blog/loading.tsx
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton'
export default function Loading() {
  return <div className="grid md:grid-cols-2 gap-6">
    {Array.from({length:6}).map((_,i)=> <PostCardSkeleton key={i}/>)}
  </div>
}
```

---

# Short rollout plan (what I will do when you paste files)

1. I’ll give you a **single final `globals.css`** that includes tokens, elevation classes, gradient keyframes, skeleton animation.
2. I’ll provide an updated **Button component** that implements the required default-glow + hover-reduce + scale-up behavior.
3. I’ll update **Header** to use the Button component and elevation utilities, plus a top shadow. I will not touch logic or API calls.
4. I’ll add skeleton components and example `loading.tsx` files for routes you ask for.
5. You confirm visuals, then I apply same style patterns to other pages.

---

# Final notes (no sugar)

* If light-mode appearance still looks “unchanged” you almost certainly have one of these problems:

  1. Browser caching (hard refresh).
  2. Tailwind purge/content misconfiguration — styles removed at build (ensure `content` in tailwind config includes `/app/**/*` and `/components/**/*`).
  3. Conflicting inline styles or hard-coded colors (I’ll replace these gradually).
* We will **not** reintroduce theme toggle now — we agreed to hard-code. That removes 90% of the pain.

---

If you say **“GO”**, I’ll:

1. Post the **final `globals.css`** (clean and small).
2. Post the **Button component** (fully working).
3. Post the **Header component** (uses Button, prewired).
4. Add one example `loading.tsx` and `PostCardSkeleton`.

Say **GO** and paste any file you want fixed first (I recommend `components/ui/Button.tsx` or `components/Header.tsx`).
