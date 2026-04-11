---
name: image-generation
description: '**WORKFLOW SKILL** — Generate images using Nano Banana API based on brand guidelines. USE FOR: creating product mockups; generating UI illustrations; producing marketing visuals; creating brand-consistent imagery. Reads brand config from project-planning/branding/brand-config.json for style consistency. Use when you need to generate images that match the project brand.'
argument-hint: 'Describe the image you want to generate, e.g. "hero image for landing page with abstract shapes"'
---

# Image Generation Workflow

Generate brand-consistent images using the Nano Banana API. Reads brand guidelines from `project-planning/branding/brand-config.json` to maintain visual consistency.

## When to Use

- Generating product mockups or illustrations
- Creating marketing visuals
- Producing brand-consistent imagery for UI
- Generating placeholder images during development

## Prerequisites

- `NANOBANANA_API_KEY` environment variable set
- Python 3.10+
- `pip install requests Pillow`
- Brand config at `project-planning/branding/brand-config.json` (optional but recommended)

## Output Location

Generated images go to `project-planning/generated-images/` in the workspace root.

```
project-planning/generated-images/
├── [timestamp]-[description].png
└── generation-log.json
```

## Procedure

### Step 1: Build the Prompt

Combine the user's description with brand context:

1. Read `project-planning/branding/brand-config.json` if it exists
2. Extract brand personality, colors, and style keywords
3. Enhance the user's prompt with brand-consistent style cues

Example prompt enhancement:
- User says: "hero image for landing page"
- Enhanced: "hero image for landing page, modern minimal design, color palette: #3B82F6 primary blue and #F8FAFC light background, clean geometric shapes, professional, slight gradient"

### Step 2: Generate Image

Run the generation script:

```bash
# Requires NANOBANANA_API_KEY environment variable
python3 ~/.copilot/skills/image-generation/scripts/generate-image.py \
  --prompt "your enhanced prompt" \
  --output project-planning/generated-images/ \
  --width 1024 \
  --height 1024
```

### Step 3: Review & Iterate

After generation:
1. Show the generated image to the user
2. Ask for feedback
3. Adjust prompt and regenerate if needed
4. Log the final prompt and parameters to `generation-log.json`

## Script Reference

- [generate-image.py](./scripts/generate-image.py) — Main generation script using Nano Banana API

## Prompt Engineering Tips

When building prompts for brand-consistent images:

- Include dominant brand colors as hex codes
- Reference the brand personality adjectives (e.g., "modern, professional, minimal")
- Specify the intended use (hero, card illustration, icon, etc.)
- Add negative prompts to avoid off-brand elements
- Use consistent style modifiers across all generated images

## Key Principles

- **Brand consistency**: Every generated image should feel like it belongs to the same brand
- **Prompt logging**: Always log the final prompt so results can be reproduced
- **Iterate**: Image generation is iterative — expect 2-3 rounds of refinement
