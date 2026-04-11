#!/usr/bin/env python3
"""
Generate images using Nano Banana API.
Optionally reads brand-config.json for style consistency.

Usage:
    python3 generate-image.py --prompt "description" --output ./output/ [--width 1024] [--height 1024] [--brand-config path/to/brand-config.json]

Requires:
    NANOBANANA_API_KEY environment variable
    pip install requests Pillow
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def load_brand_context(brand_config_path: str | None) -> str:
    """Load brand config and extract style keywords for prompt enhancement."""
    if not brand_config_path:
        candidates = [
            "project-planning/branding/brand-config.json",
            "../project-planning/branding/brand-config.json",
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                brand_config_path = candidate
                break

    if not brand_config_path or not os.path.exists(brand_config_path):
        return ""

    with open(brand_config_path) as f:
        config = json.load(f)

    parts = []

    brand = config.get("brand", {})
    if brand.get("personality"):
        parts.append(f"style: {', '.join(brand['personality'])}")

    colors = config.get("colors", {})
    primary = colors.get("primary", {}).get("DEFAULT")
    if primary:
        parts.append(f"primary color: {primary}")

    secondary = colors.get("secondary", {}).get("DEFAULT")
    if secondary:
        parts.append(f"secondary color: {secondary}")

    bg = colors.get("neutral", {}).get("background")
    if bg:
        parts.append(f"background: {bg}")

    return ", ".join(parts)


def generate_image(prompt: str, api_key: str, width: int = 1024, height: int = 1024) -> bytes:
    """Call Nano Banana API to generate an image."""
    import requests

    url = "https://api.nanobanana.com/v1/images/generations"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": prompt,
        "width": width,
        "height": height,
        "response_format": "b64_json",
    }

    response = requests.post(url, headers=headers, json=payload, timeout=120)
    response.raise_for_status()

    data = response.json()

    import base64
    image_b64 = data["data"][0]["b64_json"]
    return base64.b64decode(image_b64)


def save_image(image_bytes: bytes, output_dir: str, description: str) -> str:
    """Save image and return the file path."""
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    safe_desc = description[:50].replace(" ", "-").replace("/", "-").lower()
    safe_desc = "".join(c for c in safe_desc if c.isalnum() or c == "-")
    filename = f"{timestamp}-{safe_desc}.png"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "wb") as f:
        f.write(image_bytes)

    return filepath


def log_generation(output_dir: str, prompt: str, filepath: str, width: int, height: int):
    """Append generation details to log file."""
    log_path = os.path.join(output_dir, "generation-log.json")

    entries = []
    if os.path.exists(log_path):
        with open(log_path) as f:
            entries = json.load(f)

    entries.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "prompt": prompt,
        "output": os.path.basename(filepath),
        "width": width,
        "height": height,
    })

    with open(log_path, "w") as f:
        json.dump(entries, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Generate images using Nano Banana API")
    parser.add_argument("--prompt", required=True, help="Image description prompt")
    parser.add_argument("--output", default="project-planning/generated-images/", help="Output directory")
    parser.add_argument("--width", type=int, default=1024, help="Image width")
    parser.add_argument("--height", type=int, default=1024, help="Image height")
    parser.add_argument("--brand-config", help="Path to brand-config.json for style consistency")
    args = parser.parse_args()

    api_key = os.environ.get("NANOBANANA_API_KEY")
    if not api_key:
        print("Error: NANOBANANA_API_KEY environment variable not set")
        sys.exit(1)

    # Enhance prompt with brand context
    brand_context = load_brand_context(args.brand_config)
    final_prompt = args.prompt
    if brand_context:
        final_prompt = f"{args.prompt}, {brand_context}"
        print(f"Enhanced prompt with brand context", file=sys.stderr)

    print(f"Generating image: {final_prompt[:100]}...", file=sys.stderr)

    try:
        image_bytes = generate_image(final_prompt, api_key, args.width, args.height)
        filepath = save_image(image_bytes, args.output, args.prompt)
        log_generation(args.output, final_prompt, filepath, args.width, args.height)
        print(json.dumps({"status": "success", "path": filepath, "prompt": final_prompt}))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
