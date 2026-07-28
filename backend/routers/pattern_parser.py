import json
import re
from io import BytesIO

import google.generativeai as genai
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pypdf import PdfReader
from sqlalchemy.orm import Session

import models
from auth import AuthUser, get_current_user
from config import settings
from database import get_db
from routers.projects import get_project_or_404
from schemas import PatternItemRead

router = APIRouter(prefix='/projects', tags=['pattern-parser'])


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages = [page.extract_text() or '' for page in reader.pages]
    return '\n'.join(pages).strip()


def extract_text_from_image(file_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='OCR dependencies are not installed',
        ) from exc

    image = Image.open(BytesIO(file_bytes))
    return pytesseract.image_to_string(image).strip()


def extract_text(file_name: str, file_bytes: bytes) -> str:
    lower_name = file_name.lower()
    if lower_name.endswith('.pdf'):
        return extract_text_from_pdf(file_bytes)
    if lower_name.endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff')):
        return extract_text_from_image(file_bytes)
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='Unsupported file type. Upload a PDF or image.',
    )


def parse_rows_with_gemini(pattern_text: str) -> list[dict]:
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='GEMINI_API_KEY is not configured',
        )

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = f"""
You are helping knitters and crocheters turn pattern text into a row-by-row checklist.

Return ONLY valid JSON as an array of objects with this shape:
[
  {{"row": 1, "instruction": "Cast on 80 stitches", "stitch_count": 80}}
]

Rules:
- Keep one object per row or round when possible.
- Use short, actionable instructions.
- stitch_count is optional and should be omitted when unknown.
- Do not include markdown or commentary.

Pattern text:
{pattern_text}
"""

    response = model.generate_content(prompt)
    raw_text = (response.text or '').strip()

    json_match = re.search(r'\[.*\]', raw_text, re.DOTALL)
    if not json_match:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='Could not parse AI response into checklist rows',
        )

    try:
        rows = json.loads(json_match.group(0))
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='AI returned invalid JSON',
        ) from exc

    if not isinstance(rows, list):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='AI response was not a list of rows',
        )

    return rows


@router.post('/{project_id}/parse-pattern', response_model=list[PatternItemRead])
async def parse_pattern(
    project_id: str,
    file: UploadFile = File(...),
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Empty file uploaded')

    pattern_text = extract_text(file.filename or 'pattern.txt', file_bytes)
    if not pattern_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='No text could be extracted from the uploaded file',
        )

    rows = parse_rows_with_gemini(pattern_text)

    preview_items: list[models.PatternItem] = []
    for index, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            continue
        preview_items.append(
            models.PatternItem(
                id=f'preview-{index}',
                project_id=project_id,
                row_number=int(row.get('row', index)),
                instruction=str(row.get('instruction', '')).strip(),
                completed=False,
                notes='',
                stitch_count=row.get('stitch_count'),
            )
        )

    valid_items = [item for item in preview_items if item.instruction]
    if not valid_items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='No checklist rows were generated from this pattern',
        )

    return valid_items
