---
name: xrio-frontend-design
description: Detailed design specifications for the Wbot interface. This skill should be used when implementing the frontend components to ensure visual consistency with the provided mockup.
---

# Wbot Design System

## 1. Aesthetic Direction
- **Theme**: "Aurora Dark". A sophisticated dark mode dominated by deep greens, blacks, and glowing aurora effects.
- **Vibe**: Futuristic, clean, premium, ethereal.
- **Key Visual**: A vibrant green/yellow horizontal gradient blur that acts as a horizon line or backlight for the main content.

## 2. Color Palette
| Color | Hex | Usage |
| :--- | :--- | :--- |
| **Deep Forest** | `#051a14` | Main Background (top/bottom gradients) |
| **Vibrant Lime** | `#ccff00` | Accent glow, highlights |
| **Aurora Green** | `#00ff88` | Primary gradient mid-tones |
| **Glass White** | `rgba(255, 255, 255, 0.1)` | Navigation pills, inputs |
| **Pure White** | `#ffffff` | Primary text |
| **Muted White** | `#a0a0a0` | Secondary text |
| **Black** | `#000000` | Button backgrounds, heavy contrast elements |

## 3. Typography
- **Primary Font**: `Inter` or `SF Pro Display` (Clean, geometric sans-serif).
- **Weights**:
  - **Logo**: 800 (Extra Bold)
  - **Headings**: 700 (Bold)
  - **Body**: 400 (Regular)
  - **Labels**: 500 (Medium)

## 4. Key Components

### A. Navigation Bar (Floating Pill)
- **Shape**: Rounded pill container, centered at the top.
- **Style**: Glassmorphic (blurred background, subtle white border).
- **Content**:
  - Left: "Wbot" (Logo text)
  - Center Links: "AI Models", "API", "Autonomy", "Labs", "Careers"
  - Interactive: Hover effects on links (subtle glow or color shift).

### B. Contact Button (Top Right)
- **Shape**: Rounded pill.
- **Style**: Solid Black background with White text.
- **Icon**: Right-pointing arrow circle icon.
- **Structure**: `[Icon] Contact`

### C. Hero Section
- **Background**: Massive, soft horizontal gradient mesh blending Deep Forest and Vibrant Lime.
- **Central Text**: Large "Wbot" title (or logo) centered.
  - *Effect*: Could be partially obscured by the foreground element (Glassmorphism overlap).

### D. Search/Chat Interface (The Core)
- **Container**: Large, rounded rectangular container with a glassmorphic dark green tint.
- **Position**: Centered, floating above the aurora gradient.
- **Placeholder**: "What do you want to know?" (Simple, elegant type).
- **Action**: Small arrow circle button on the right side of the input.
- **Interaction**:
  - **Default**: Minimal input field.
  - **Active**: Expands to show streaming response tokens.

### E. Footer Indicator
- **Element**: A simple down-arrow button in a circle at the bottom center.
- **Purpose**: Scroll hint or "More" indicator.

## 5. Effects & specific details
- **Glassmorphism**: Heavy use of `backdrop-filter: blur(20px)` on the nav bar and chat container.
- **Glows**: Soft `box-shadow` or radial gradients behind key elements to make them "pop" against the dark background.
- **Borders**: Extremely subtle `1px solid rgba(255,255,255,0.05)` to define edges without harsh lines.

## 6. Implementation Notes
- Use **React** + **Vite**.
- Use **CSS Modules** or **Styled Components** for scoped styling.
- **Animation**: Use `framer-motion` for smooth entry (fade-in up) and the "aurora" breathing effect.
