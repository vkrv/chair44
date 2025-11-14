# Chair44 Style Guide

## Overview
This style guide documents the design system, UI patterns, and coding conventions for the Chair44 game website.

---

## 🎨 Design System

### Color Palette

#### Light Mode
- **Background**: `#ffffff` (White)
- **Surface**: `#ffffff` (White)
- **Text Primary**: `#000000` (Black)
- **Text Secondary**: `#6b7280` (Gray-600)
- **Border**: `#e5e7eb` (Gray-200)
- **Border Hover**: `#9ca3af` (Gray-400)
- **Accent**: `#2563eb` (Blue-600)

#### Dark Mode
- **Background**: `#0a0a0a` (Near Black)
- **Surface**: `#0a0a0a` (Near Black)
- **Text Primary**: `#ededed` (Off White)
- **Text Secondary**: `#9ca3af` (Gray-400)
- **Border**: `#1f2937` (Gray-800)
- **Border Hover**: `#4b5563` (Gray-600)
- **Accent**: `#60a5fa` (Blue-400)

### Typography

#### Font Families
- **Primary**: Geist Sans (via next/font/google)
- **Monospace**: Geist Mono (for code/technical content)

#### Type Scale
```
text-4xl  → 36px (2.25rem) - Main page title
text-2xl  → 24px (1.5rem)  - Game card titles
text-lg   → 18px (1.125rem) - Descriptions
text-base → 16px (1rem)    - Body text
```

#### Font Weights
- **Regular**: 400 (default body text)
- **Semibold**: 600 (card titles)
- **Bold**: 700 (page headings)

#### Line Heights
- **Headings**: Default Tailwind line heights
- **Body Text**: `leading-relaxed` (1.625)

### Spacing

Follow Tailwind's default spacing scale (4px base unit):

```
gap-4  → 1rem (16px)   - Grid gaps
px-6   → 1.5rem (24px) - Horizontal padding
py-8   → 2rem (32px)   - Vertical padding
p-8    → 2rem (32px)   - Card padding
py-12  → 3rem (48px)   - Section padding
mt-20  → 5rem (80px)   - Large vertical spacing
```

### Borders & Radius

- **Border Width**: 1px (default)
- **Border Radius**: `rounded-lg` (8px) for cards
- **Border Color**: See color palette above

### Shadows

- **Hover Shadow**: `shadow-lg` - Used on card hover states
- **Default**: No shadow on static elements

---

## 🧩 UI Components

### Layout Container

```tsx
<div className="max-w-6xl mx-auto px-6">
  {/* Content */}
</div>
```

**Specifications:**
- Max width: 1152px (max-w-6xl)
- Centered: mx-auto
- Horizontal padding: 24px (px-6)

### Header

```tsx
<header className="border-b border-gray-200 dark:border-gray-800">
  <div className="max-w-6xl mx-auto px-6 py-8">
    <h1 className="text-4xl font-bold text-black dark:text-white">
      Chair44
    </h1>
  </div>
</header>
```

**Specifications:**
- Border bottom only
- Padding: 32px vertical, 24px horizontal
- Title: 36px, bold

### Game Card

```tsx
<Link
  href={`/games/${game.id}`}
  className="group block p-8 border border-gray-200 dark:border-gray-800 rounded-lg transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg"
>
  <div className="flex items-start gap-4">
    <div className="text-4xl flex-shrink-0 transition-transform group-hover:scale-110">
      {game.emoji}
    </div>
    <div className="flex-1 min-w-0">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {game.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {game.description}
      </p>
    </div>
  </div>
</Link>
```

**Specifications:**
- Padding: 32px all sides
- Border: 1px, rounded-lg
- Emoji: 36px, scales to 110% on hover
- Title: 24px, semibold, changes to blue on hover
- Description: Gray text, relaxed line height
- Hover: Border darkens, shadow appears
- Transition: All properties animated

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Cards */}
</div>
```

**Specifications:**
- Mobile: 1 column
- Desktop (768px+): 2 columns
- Gap: 16px between items

### Footer

```tsx
<footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
  <div className="max-w-6xl mx-auto px-6 py-8">
    <p className="text-center text-gray-600 dark:text-gray-400">
      Made with ❤️ for game lovers
    </p>
  </div>
</footer>
```

**Specifications:**
- Border top only
- Margin top: 80px
- Text: Centered, gray, 16px

---

## 🎯 Interaction Patterns

### Hover States

**Game Cards:**
1. Border color darkens
2. Box shadow appears (shadow-lg)
3. Emoji scales up (110%)
4. Title changes to blue

**Implementation:**
```tsx
className="transition-all hover:border-gray-400 hover:shadow-lg"
```

### Focus States

Ensure all interactive elements have visible focus states for keyboard navigation. Tailwind applies default focus rings.

### Transitions

Use `transition-all` or specific transition utilities:
- `transition-colors` - For color changes
- `transition-transform` - For scale/position changes
- `transition-all` - For multiple properties

---

## 📱 Responsive Design

### Breakpoints

Follow Tailwind's default breakpoints:
- **Mobile**: Default (< 768px)
- **Tablet/Desktop**: `md:` (≥ 768px)

### Mobile-First Approach

Write styles for mobile first, then add `md:` prefixes for desktop:

```tsx
className="grid grid-cols-1 md:grid-cols-2"
```

### Testing Viewports

Test at minimum:
- 375px (Mobile)
- 768px (Tablet)
- 1440px (Desktop)

---

## ♿ Accessibility

### Semantic HTML

Use proper semantic elements:
- `<header>` for page headers
- `<main>` for main content
- `<footer>` for footers
- `<nav>` for navigation
- Heading hierarchy (h1 → h2 → h3)

### Links vs Buttons

- Use `<Link>` (Next.js) for navigation
- Use `<button>` for actions/interactions

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Maintain logical tab order
- Ensure focus states are visible

### Color Contrast

Maintain WCAG AA standards:
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum

---

## 💻 Code Conventions

### Component Structure

```tsx
import Link from "next/link";

interface Game {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const games: Game[] = [
  // Data...
];

export default function Home() {
  return (
    // JSX...
  );
}
```

**Order:**
1. Imports (Next/React, third-party, local)
2. Type definitions
3. Constants/data
4. Component function
5. Export

### Naming Conventions

- **Components**: PascalCase (`GameCard.tsx`)
- **Variables**: camelCase (`gameData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SCORE`)
- **Files**: kebab-case (`game-utils.ts`)

### TypeScript Usage

Always define types for:
- Component props
- Data structures
- Function parameters and returns
- API responses

```tsx
interface GameProps {
  id: string;
  title: string;
  description: string;
  emoji: string;
}
```

---

## 🎮 Game-Specific Guidelines

### Game Data Structure

```tsx
interface Game {
  id: string;        // URL-friendly identifier
  title: string;     // Display name
  description: string; // Brief explanation
  emoji: string;     // Visual icon
}
```

### Adding New Games

1. Add entry to `games` array in `app/page.tsx`
2. Create page at `app/games/[id]/page.tsx`
3. Follow the same design patterns
4. Include back button to home
5. Add game instructions
6. Implement responsive design

### Game Page Template

```tsx
export default function GamePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
        {/* Title and back button */}
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Game content */}
      </main>
    </div>
  );
}
```

---

## 🌙 Dark Mode

### Implementation

Always include dark mode variants using the `dark:` prefix:

```tsx
className="bg-white dark:bg-black text-black dark:text-white"
```

### Testing

Always test both light and dark modes:
- macOS: System Preferences → Appearance
- Browser DevTools: Toggle preferred color scheme

### Common Patterns

```tsx
// Text
text-black dark:text-white
text-gray-600 dark:text-gray-400

// Backgrounds
bg-white dark:bg-black

// Borders
border-gray-200 dark:border-gray-800

// Hover states
hover:border-gray-400 dark:hover:border-gray-600
```

---

## 📋 Checklist for New Features

### Before Committing

- [ ] TypeScript types defined
- [ ] Dark mode implemented
- [ ] Responsive on mobile and desktop
- [ ] Hover states added
- [ ] Keyboard accessible
- [ ] No linter errors
- [ ] Follows naming conventions
- [ ] Consistent with design system

### Code Review

- [ ] Matches style guide
- [ ] Type safety
- [ ] Accessibility considerations
- [ ] Performance optimized
- [ ] Code is readable and documented

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🔄 Version History

- **v1.0** (Current) - Initial style guide with minimalist design inspired by neal.fun

