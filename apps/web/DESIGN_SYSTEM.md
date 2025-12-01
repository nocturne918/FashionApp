# FITTED Design System

## Philosophy: "The App Feel"
FITTED is not a marketing site; it is a tool. The user interface should feel like a robust application from the moment of entry.
- **Direct Access**: Users who are logged in go straight to the utility (The Drop/Lab/Stash).
- **No Fluff**: Avoid "landing page" sections (hero banners, feature lists) inside the authenticated view.
- **Density**: Information density should be high but legible, suitable for power users.
- **Persistence**: State (stash, outfits, session) should persist to reinforce the feeling of a personal workspace.

## Visual Language

### Colors
- **Primary**: Black (`#000000`) - Used for borders, primary text, and strong accents.
- **Secondary**: White (`#FFFFFF`) - Used for backgrounds and high-contrast elements.
- **Accent**: Blue (`#2563EB` / `blue-600`) - Used for active states, primary actions, and highlights.
- **Background**: Off-White (`#F8F8F8`) - Used for the main app background to reduce eye strain and differentiate from content containers.
- **Error**: Red (`#EF4444` / `red-500`) - Used for destructive actions and errors.

### Typography
- **Display**: `Impact`, `Haettenschweiler`, `Arial Narrow Bold`, sans-serif. Used for headers and brand moments.
- **Mono**: `Courier New`, `Courier`, monospace. Used for technical details, prices, and metadata.
- **Body**: System sans-serif. Used for general UI text.

### Components

#### Buttons
- **Primary**: Black background, white text, uppercase, bold.
- **Secondary**: White background, black text, black border, uppercase, bold.
- **Interactive**: All buttons should have hover states (color change) and active states (scale/press).

#### Cards (Product/Item)
- **Structure**: White background, 2px black border, hard shadow (`4px 4px 0px 0px #000000`).
- **Behavior**: Hover effects should lift the card or reveal actions.

#### Inputs
- **Style**: 2px black border, monospace font, sharp corners.
- **Focus**: Blue border, light blue background tint.

## Layout
- **Navbar**: Sticky top, high z-index.
- **Grid**: Responsive grid for product feeds.
- **Spacing**: Consistent spacing using Tailwind's scale (4px base).
