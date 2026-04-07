#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path

from filter import load_and_filter
from scorer import score_items
from selector import build_dept_summary, build_mix_prompt, parse_dept_mix, select_items
from describer import generate_descriptions
from exporter import write_reference_csv, write_upload_csv
from openrouter import OpenRouterClient


def main():
    parser = argparse.ArgumentParser(description="Curate a liquor store catalog using AI scoring.")
    parser.add_argument("--input", default="pricebook.csv", help="Path to pricebook CSV")
    parser.add_argument("--count", type=int, default=300, help="Number of items to select (100-500)")
    parser.add_argument("--model", default="xiaomi/mimo-v2-pro", help="OpenRouter model ID")
    parser.add_argument("--skip-scoring", action="store_true", help="Reuse existing scored.json")
    parser.add_argument("--output-dir", default=".", help="Directory for output files")
    args = parser.parse_args()

    if not 100 <= args.count <= 500:
        print("Error: --count must be between 100 and 500")
        sys.exit(1)

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY environment variable not set")
        sys.exit(1)

    output_dir = Path(args.output_dir)
    scored_path = output_dir / "scored.json"
    reference_path = output_dir / "catalog_reference.csv"
    upload_path = output_dir / "catalog_upload.csv"

    # Shared client so token usage accumulates across all LLM calls
    client = OpenRouterClient(api_key=api_key, model=args.model)

    # --- Stage 1: Score ---
    if args.skip_scoring and scored_path.exists():
        print(f"Loading cached scores from {scored_path}")
        with open(scored_path) as f:
            scored = json.load(f)
    else:
        print(f"Loading and filtering {args.input}...")
        items = load_and_filter(args.input)
        print(f"  {len(items)} items after filtering")

        print(f"\nStage 1: Scoring {len(items)} items via {args.model}...")
        scored = score_items(items, api_key=api_key, model=args.model, client=client, output_dir=str(output_dir))

        with open(scored_path, "w") as f:
            json.dump(scored, f, indent=2)
        print(f"  Scores saved to {scored_path}")

        print(f"\nWriting reference CSV...")
        write_reference_csv(scored, str(reference_path))

    # --- Stage 2: Select + Describe ---
    print(f"\nStage 2: Selecting {args.count} items...")
    dept_summary = build_dept_summary(scored)
    mix_prompt = build_mix_prompt(dept_summary, args.count)
    mix_response = client.complete(mix_prompt)
    mix = parse_dept_mix(mix_response)

    # Validate mix sums to count, adjust if needed
    total = sum(mix.values())
    if total != args.count:
        diff = args.count - total
        largest_dept = max(mix, key=mix.get)
        mix[largest_dept] += diff
        print(f"  Adjusted {largest_dept} by {diff} to hit target count")

    selected = select_items(scored, mix)
    print(f"  Selected {len(selected)} items")

    print(f"\nGenerating descriptions for {len(selected)} items...")
    selected_with_desc = generate_descriptions(selected, api_key=api_key, model=args.model, client=client)

    print(f"\nWriting upload CSV...")
    write_upload_csv(selected_with_desc, str(upload_path))

    # --- Summary ---
    print("\n" + "=" * 50)
    print("DONE")
    print(f"Items scored:    {len(scored)}")
    print(f"Items selected:  {len(selected)}")
    print("\nDepartment breakdown:")
    for dept, count in sorted(mix.items(), key=lambda x: -x[1]):
        print(f"  {dept:<25} {count}")
    print(f"\nToken usage:     {client.total_input_tokens:,} in / {client.total_output_tokens:,} out")
    print(f"Estimated cost:  ~${client.estimated_cost_usd():.4f} USD")
    print(f"\nOutputs:")
    print(f"  {reference_path}")
    print(f"  {upload_path}")
    failed_path = output_dir / "failed.txt"
    if failed_path.exists():
        print(f"  {failed_path} (some items could not be scored)")
    print("=" * 50)


if __name__ == "__main__":
    main()
