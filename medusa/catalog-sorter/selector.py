import json
import re


def build_dept_summary(scored: list[dict]) -> dict:
    summary = {}
    for item in scored:
        dept = item["department"]
        if dept not in summary:
            summary[dept] = {"count": 0, "total_score": 0.0}
        summary[dept]["count"] += 1
        summary[dept]["total_score"] += item["score"]
    for dept, data in summary.items():
        data["avg_score"] = round(data["total_score"] / data["count"], 1)
        del data["total_score"]
    return summary


def build_mix_prompt(dept_summary: dict, count: int) -> str:
    lines = [
        f"  {dept}: {info['count']} items, avg score {info['avg_score']:.0f}"
        for dept, info in sorted(dept_summary.items(), key=lambda x: -x[1]["count"])
    ]
    return f"""You are curating a well-rounded online liquor store catalog with exactly {count} products.

Available departments:
{chr(10).join(lines)}

Decide how many items to select from each department to create the ideal liquor store catalog.
Prioritize variety, customer demand, and product quality (avg score).
You may exclude very small or niche departments if needed.

Respond with ONLY a JSON object. Counts MUST sum to exactly {count}.
Example: {{"Whiskey": 50, "Beer": 40, "Wine": 35, ...}}

JSON object only, no explanation."""


def parse_dept_mix(response: str) -> dict[str, int]:
    text = response.strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    cleaned = m.group(1) if m else text
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"parse_dept_mix: invalid JSON from LLM response: {exc}\nRaw: {text!r}") from exc
    return {k: int(v) for k, v in data.items()}


def select_items(scored: list[dict], mix: dict[str, int]) -> list[dict]:
    by_dept: dict[str, list[dict]] = {}
    for item in scored:
        dept = item["department"]
        by_dept.setdefault(dept, []).append(item)

    for dept in by_dept:
        by_dept[dept].sort(key=lambda x: x["score"], reverse=True)

    selected = []
    for dept, count in mix.items():
        candidates = by_dept.get(dept, [])
        selected.extend(candidates[:count])
    return selected
