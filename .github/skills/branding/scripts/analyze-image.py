#!/usr/bin/env python3
"""
Analyze inspiration images using Gemini Vision API.
Extracts colors, typography style, spacing patterns, mood, and visual weight.

Usage:
    python3 analyze-image.py <image_path> [<image_path2> ...]

Requires:
    GEMINI_API_KEY environment variable
    pip install google-genai Pillow
"""

import sys
import os
import json
import base64
from pathlib import Path

def check_dependencies():
    try:
        from google import genai
        return True
    except ImportError:
        print("Missing dependency. Install with:")
        print("  pip install google-genai Pillow")
        sys.exit(1)

def analyze_image(image_path: str, api_key: str) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    image_data = Path(image_path).read_bytes()
    image_b64 = base64.b64encode(image_data).decode("utf-8")

    ext = Path(image_path).suffix.lower()
    mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}
    mime_type = mime_map.get(ext, "image/png")

    prompt = """Analyze this image as a design/branding reference. Extract and return a JSON object with:

{
  "dominant_colors": [
    {"hex": "#XXXXXX", "name": "descriptive name", "percentage": 30, "role": "primary/secondary/accent/background/text"}
  ],
  "typography": {
    "style": "serif/sans-serif/display/handwritten/monospace",
    "weight": "light/regular/medium/bold/heavy",
    "characteristics": ["rounded", "geometric", "humanist", etc],
    "suggested_fonts": ["Font Name 1", "Font Name 2"]
  },
  "spacing": {
    "density": "tight/balanced/spacious",
    "pattern": "description of spacing approach"
  },
  "visual_weight": "light/medium/heavy",
  "mood": ["adjective1", "adjective2", "adjective3"],
  "design_patterns": ["pattern1", "pattern2"],
  "border_radius": "sharp/slightly-rounded/rounded/very-rounded/pill",
  "overall_style": "One sentence describing the overall design style"
}

Return ONLY valid JSON, no markdown formatting."""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Content(parts=[
                types.Part(text=prompt),
                types.Part(inline_data=types.Blob(mime_type=mime_type, data=image_data))
            ])
        ]
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()

    result = json.loads(text)
    result["source_image"] = os.path.basename(image_path)
    return result


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze-image.py <image_path> [<image_path2> ...]")
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        sys.exit(1)

    check_dependencies()

    results = []
    for image_path in sys.argv[1:]:
        if not os.path.exists(image_path):
            print(f"Warning: {image_path} not found, skipping", file=sys.stderr)
            continue

        print(f"Analyzing: {image_path}...", file=sys.stderr)
        try:
            result = analyze_image(image_path, api_key)
            results.append(result)
        except Exception as e:
            print(f"Error analyzing {image_path}: {e}", file=sys.stderr)
            continue

    output = {"analyses": results, "count": len(results)}
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
