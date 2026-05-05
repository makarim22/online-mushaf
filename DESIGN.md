---
name: Hifdzi - Online Mushaf
colors:
  # Base Color Palette
  primary: "#D97706" # amber-600
  secondary: "#059669" # emerald-600
  accent: "#B45309" # amber-700
  
  # Light Theme
  light:
    background-start: "#FFFBEB" # amber-50
    background-end: "#ECFDF5" # emerald-50
    surface: "#FFFFFF"
    surface-variant: "#FFFBEB" # amber-50
    header: "#78350F" # amber-900
    text-primary: "#1C1917" # stone-900
    text-secondary: "#44403C" # stone-700
    border: "#FDE68A" # amber-200

  # Dark Theme
  dark:
    background-start: "#030712" # gray-950
    background-end: "#0C0A09" # stone-950
    surface: "#111827" # gray-900
    surface-variant: "#1F2937" # gray-800
    header: "#111827" # gray-900
    text-primary: "#FFFBEB" # amber-50
    text-secondary: "#D1D5DB" # gray-300
    border: "#451A03" # amber-900/30 (approx)

typography:
  arabic:
    fontFamily: "Amiri Quran, Lateef, Scheherazade New, serif"
    sizes:
      sm: 24px
      md: 30px
      lg: 36px
      xl: 48px
  body:
    fontFamily: "serif"
    fontSize: 16px
    lineHeight: 1.6
  heading:
    fontFamily: "serif"
    fontWeight: "700"

rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px

spacing:
  unit: 4px
  container-padding: 24px
  card-gap: 16px

components:
  verse-card:
    backgroundColor: "{colors.light.surface}"
    borderColor: "{colors.light.border}"
    borderRadius: "{rounded.lg}"
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  
  header-panel:
    background: "linear-gradient(to right, #78350F, #92400E, #713F12)"
    textColor: "#FFFFFF"
    padding: "32px"

  modal-glass:
    backdropBlur: "8px"
    backgroundColor: "rgba(0, 0, 0, 0.7)"
---

# Design Intent

Hifdzi is designed as a premium, modern digital Mushaf (Quran reader). The visual identity seeks to bridge the gap between traditional Islamic manuscript art and contemporary digital interface design. The goal is to create a reading environment that feels both sacred and highly functional.

## Brand & Style
The brand personality is **Sacred, Serene, and Scholarly**. The UI avoids the clinical look of modern "SaaS" apps in favor of a "Digital Parchment" aesthetic. It utilizes rich, warm colors (Amber and Gold) representing illumination, and deep greens (Emerald) representing life and Islamic heritage.

## Visual Identity: The Modern Mushaf
The application's design is inspired by the *tazhib* (illumination) found in traditional Quranic manuscripts:
- **Headers & Accents**: Use gold-toned gradients and deep amber borders to mimic gold-leaf illumination.
- **Color Harmony**: The "Light Mode" uses a parchment-like background (`amber-50`), while "Dark Mode" provides a deep, meditative night-reading environment.
- **Typography as Art**: Since the central focus is the Quranic text, the design system prioritizes five specific Arabic fonts (Amiri, Lateef, etc.) that honor classical calligraphy styles.

## Colors
The color palette is dual-natured to support day and night reading:
- **The Amber Spectrum**: Used for primary navigation, highlights, and structural elements. It evokes the warmth of old books and candlelit study.
- **The Emerald Spectrum**: Reserved for secondary information and translations. It provides a cooling contrast to the amber and symbolizes the "gardens" mentioned in the text.
- **Contrast**: High legibility is maintained by using `stone-900` on light backgrounds and `amber-50` on dark backgrounds, ensuring that the sacred text is always the most prominent element.

## Typography
Typography is the cornerstone of this system.
- **Arabic Text**: Scalable and interchangeable. The user can choose from various Naskh styles depending on their reading preference.
- **Serif Primacy**: To maintain the "literary" feel, the entire application uses serif fonts for Latin text, creating a cohesive scholarly atmosphere.

## Layout & Spacing
The layout follows a "Focused Reading" model:
- **Symmetry**: The central column holds the verses, providing a stable vertical rhythm.
- **Responsive Navigation**: Side panels and headers are designed to get out of the way, using glassmorphism (backdrop-blur) when they overlap content to maintain a sense of depth and focus.
- **Breathing Room**: Generous margins and card gaps prevent the text-heavy interface from feeling cramped.

## Elevation & Depth
Depth is used subtly to distinguish between "Content" and "Interface":
- **Level 0 (Base)**: Subtle linear gradients that provide a non-flat, textured surface.
- **Level 1 (Cards)**: Verse cards use slight borders and soft shadows to appear as if resting on the parchment.
- **Level 2 (Modals/Sidebars)**: Use heavy blur and high-contrast backgrounds to "float" above the content, creating a distinct functional layer.

## Interaction Design
Micro-animations are used to enhance the spiritual experience:
- **Hover States**: Verse cards expand or show subtle border stripes when hovered, acknowledging the user's focus.
- **Transitions**: Theme switching and panel toggles use smooth 500ms and 300ms transitions to avoid jarring the reader.
