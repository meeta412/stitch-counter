#!/usr/bin/env python3
"""Test PDF text extraction without calling the LLM.

Usage:
  python scripts/test_pdf_extract.py path/to/pattern.pdf
"""

import sys
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.text_cleanup import normalize_extracted_text


def extract_raw(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    return '\n'.join(page.extract_text() or '' for page in reader.pages)


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: python scripts/test_pdf_extract.py <path-to.pdf>')
        sys.exit(1)

    path = Path(sys.argv[1])
    if not path.exists():
        print(f'File not found: {path}')
        sys.exit(1)

    file_bytes = path.read_bytes()
    raw = extract_raw(file_bytes)
    cleaned = normalize_extracted_text(raw)

    print(f'File: {path.name}')
    print(f'Raw length: {len(raw)} chars')
    print(f'Cleaned length: {len(cleaned)} chars')
    print('\n=== RAW (first 1500 chars) ===')
    print(raw[:1500])
    print('\n=== CLEANED ===')
    print(cleaned)


if __name__ == '__main__':
    main()
