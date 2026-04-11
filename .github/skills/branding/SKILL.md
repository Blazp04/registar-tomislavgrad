---
name: branding
description: '**WORKFLOW SKILL** — Define brand identity with colors, typography, spacing, and design tokens. USE FOR: creating brand guidelines from scratch; reverse-engineering brand identity from inspiration images; generating brand config JSON for AI consumption; defining design system foundations. Outputs MD guidelines + JSON config to project-planning/branding/. Use when starting branding, updating visual identity, or extracting style from reference images.'
argument-hint: 'Describe your brand vision, or say "analyze images" to reverse-engineer from inspiration'
---

# Branding Workflow

Define and document brand identity — colors, typography, spacing, and design tokens. Outputs both human-readable guidelines (MD) and machine-readable config (JSON) for AI tools.

## When to Use

- Starting brand identity from scratch
- Reverse-engineering style from uploaded inspiration images
- Creating design tokens for a design system
- Generating brand config JSON for AI-assisted development
- Updating or refining existing brand guidelines

## Output Location

All output goes to `project-planning/branding/` in the workspace root.

```
project-planning/branding/
├── brand-guidelines.md       # Human-readable brand guide
├── brand-config.json         # Machine-readable design tokens
├── color-palette.md          # Detailed color documentation
├── typography.md             # Font system documentation
└── inspiration/              # Saved reference images & analysis
    └── analysis.md           # Image analysis results
```

## Procedure

### Mode A: Brand from Scratch

Interview the user to define brand identity. Ask about:

1. **Brand Personality**: Modern/Classic? Playful/Serious? Minimal/Bold?
2. **Industry/Domain**: What space is the product in?
3. **Target Audience**: Who are we designing for?
4. **Mood/Feeling**: What emotion should the brand evoke?
5. **Reference Brands**: Any brands they admire (not copy)?
6. **Constraints**: Any existing colors, logos, or guidelines to respect?

Then generate the brand system using the templates below.

### Mode B: Reverse-Engineer from Images

When the user uploads inspiration images:

1. Analyze each image using Gemini Vision API — run [analyze-image.py](./scripts/analyze-image.py)
2. Extract: dominant colors (hex), typography style, spacing patterns, visual weight, mood
3. Synthesize findings across all images into a unified brand direction
4. Generate the brand system based on extracted patterns

#### Running the Analysis Script

```bash
# Requires GEMINI_API_KEY environment variable
python3 ~/.copilot/skills/branding/scripts/analyze-image.py <image_path> [<image_path2> ...]
```

The script outputs a JSON analysis for each image. Combine the results to inform the brand system.

### Brand System Templates

#### brand-guidelines.md

```markdown
# Brand Guidelines: [Product Name]

## Brand Essence
- **Mission**: [One sentence]
- **Vision**: [One sentence]
- **Personality**: [3-5 adjectives]
- **Voice & Tone**: [Description of how the brand communicates]

## Color System

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary | #XXXXXX | rgb(X,X,X) | Main actions, links, key UI elements |
| Primary Light | #XXXXXX | rgb(X,X,X) | Hover states, backgrounds |
| Primary Dark | #XXXXXX | rgb(X,X,X) | Active states, emphasis |

### Secondary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Secondary | #XXXXXX | rgb(X,X,X) | Supporting elements |

### Neutral Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background | #XXXXXX | rgb(X,X,X) | Page background |
| Surface | #XXXXXX | rgb(X,X,X) | Card/component backgrounds |
| Border | #XXXXXX | rgb(X,X,X) | Borders, dividers |
| Text Primary | #XXXXXX | rgb(X,X,X) | Headings, body text |
| Text Secondary | #XXXXXX | rgb(X,X,X) | Labels, captions |
| Text Muted | #XXXXXX | rgb(X,X,X) | Placeholders, disabled |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | #XXXXXX | Positive actions, confirmations |
| Warning | #XXXXXX | Caution states |
| Error | #XXXXXX | Errors, destructive actions |
| Info | #XXXXXX | Informational messages |

## Typography

### Font Families
| Role | Font | Fallback | Weight Range |
|------|------|----------|--------------|
| Headings | [Font] | sans-serif | 600-700 |
| Body | [Font] | sans-serif | 400-500 |
| Mono | [Font] | monospace | 400 |

### Type Scale
| Level | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display | 48px / 3rem | 1.1 | 700 | Hero sections |
| H1 | 36px / 2.25rem | 1.2 | 700 | Page titles |
| H2 | 30px / 1.875rem | 1.3 | 600 | Section headings |
| H3 | 24px / 1.5rem | 1.3 | 600 | Subsections |
| H4 | 20px / 1.25rem | 1.4 | 600 | Card titles |
| Body Large | 18px / 1.125rem | 1.6 | 400 | Lead paragraphs |
| Body | 16px / 1rem | 1.6 | 400 | Default body text |
| Body Small | 14px / 0.875rem | 1.5 | 400 | Secondary text |
| Caption | 12px / 0.75rem | 1.4 | 400 | Labels, captions |

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px / 0.25rem | Tight gaps |
| sm | 8px / 0.5rem | Icon gaps, compact padding |
| md | 16px / 1rem | Default padding |
| lg | 24px / 1.5rem | Section gaps |
| xl | 32px / 2rem | Large section spacing |
| 2xl | 48px / 3rem | Page sections |
| 3xl | 64px / 4rem | Hero/major sections |

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Small elements (badges, chips) |
| md | 8px | Buttons, inputs |
| lg | 12px | Cards, panels |
| xl | 16px | Modals, large cards |
| full | 9999px | Avatars, pills |

## Shadows
| Token | Value | Usage |
|-------|-------|-------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle lift |
| md | 0 4px 6px rgba(0,0,0,0.07) | Cards |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Dropdowns, modals |
```

#### brand-config.json

Generate a machine-readable JSON version with this structure:

```json
{
  "brand": {
    "name": "",
    "personality": [],
    "voice": ""
  },
  "colors": {
    "primary": { "DEFAULT": "", "light": "", "dark": "", "foreground": "" },
    "secondary": { "DEFAULT": "", "light": "", "dark": "", "foreground": "" },
    "neutral": {
      "background": "",
      "surface": "",
      "border": "",
      "text": { "primary": "", "secondary": "", "muted": "" }
    },
    "semantic": {
      "success": "",
      "warning": "",
      "error": "",
      "info": ""
    }
  },
  "typography": {
    "fonts": {
      "heading": { "family": "", "fallback": "sans-serif" },
      "body": { "family": "", "fallback": "sans-serif" },
      "mono": { "family": "", "fallback": "monospace" }
    },
    "scale": {
      "display": { "size": "3rem", "lineHeight": "1.1", "weight": "700" },
      "h1": { "size": "2.25rem", "lineHeight": "1.2", "weight": "700" },
      "h2": { "size": "1.875rem", "lineHeight": "1.3", "weight": "600" },
      "h3": { "size": "1.5rem", "lineHeight": "1.3", "weight": "600" },
      "h4": { "size": "1.25rem", "lineHeight": "1.4", "weight": "600" },
      "bodyLarge": { "size": "1.125rem", "lineHeight": "1.6", "weight": "400" },
      "body": { "size": "1rem", "lineHeight": "1.6", "weight": "400" },
      "bodySmall": { "size": "0.875rem", "lineHeight": "1.5", "weight": "400" },
      "caption": { "size": "0.75rem", "lineHeight": "1.4", "weight": "400" }
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  }
}
```

This JSON can be used directly by AI agents when generating UI code, Tailwind configs, or CSS variables.

## Key Principles

- **Consistency**: Every color and size comes from the defined system — no magic numbers
- **Accessibility**: Color contrast must meet WCAG AA (4.5:1 for text, 3:1 for large text)
- **Dual output**: Always generate both MD (for humans) and JSON (for AI/tools)
- **Iterative**: Brand evolves — update the files, don't start from scratch
