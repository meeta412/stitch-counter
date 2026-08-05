import re


def normalize_extracted_text(text: str) -> str:
    """Collapse PDF line-break artifacts so rounds stay on single lines."""
    lines: list[str] = []
    for line in text.splitlines():
        collapsed = re.sub(r'\s+', ' ', line).strip()
        if collapsed:
            lines.append(collapsed)

    section_start = re.compile(
        r'^(Round|Rounds|Magic|Row|Materials|Gauge|Instructions|Notes|Finish|http)',
        re.IGNORECASE,
    )

    merged: list[str] = []
    for line in lines:
        if merged and not section_start.match(line) and not line.startswith('●'):
            merged[-1] = f'{merged[-1]} {line}'
        else:
            merged.append(line)

    return '\n'.join(merged)
