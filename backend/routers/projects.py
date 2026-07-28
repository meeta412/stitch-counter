from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

import models
from auth import AuthUser, get_current_user
from database import get_db
from schemas import (
    CounterCreate,
    CounterRead,
    CounterUpdate,
    MigrateRequest,
    PatternItemBulkCreate,
    PatternItemCreate,
    PatternItemRead,
    PatternItemUpdate,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)

router = APIRouter(prefix='/projects', tags=['projects'])


def get_project_or_404(project_id: str, user_id: str, db: Session) -> models.Project:
    project = (
        db.query(models.Project)
        .options(
            joinedload(models.Project.counters),
            joinedload(models.Project.pattern_items),
        )
        .filter(models.Project.id == project_id, models.Project.user_id == user_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project


@router.get('', response_model=list[ProjectRead])
def list_projects(
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = (
        db.query(models.Project)
        .options(
            joinedload(models.Project.counters),
            joinedload(models.Project.pattern_items),
        )
        .filter(models.Project.user_id == user.id)
        .order_by(models.Project.created_at.desc())
        .all()
    )
    return projects


@router.post('', response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = models.Project(
        user_id=user.id,
        name=payload.name,
        craft_type=payload.craft_type,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.post('/migrate', response_model=list[ProjectRead])
def migrate_projects(
    payload: MigrateRequest,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    created_projects: list[models.Project] = []

    for incoming in payload.projects:
        project = models.Project(
            user_id=user.id,
            name=incoming.name,
            craft_type=incoming.craft_type,
        )
        db.add(project)
        db.flush()

        for counter in incoming.counters:
            db.add(
                models.Counter(
                    project_id=project.id,
                    label=counter.label,
                    value=counter.value,
                    type=counter.type,
                )
            )

        for item in incoming.pattern_items:
            db.add(
                models.PatternItem(
                    project_id=project.id,
                    row_number=item.row_number,
                    instruction=item.instruction,
                    completed=item.completed,
                    notes=item.notes,
                    stitch_count=item.stitch_count,
                )
            )

        created_projects.append(project)

    db.commit()

    project_ids = [project.id for project in created_projects]
    return (
        db.query(models.Project)
        .options(
            joinedload(models.Project.counters),
            joinedload(models.Project.pattern_items),
        )
        .filter(models.Project.id.in_(project_ids))
        .all()
    )


@router.get('/{project_id}', response_model=ProjectRead)
def get_project(
    project_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_project_or_404(project_id, user.id, db)


@router.patch('/{project_id}', response_model=ProjectRead)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_project_or_404(project_id, user.id, db)
    project.name = payload.name
    db.commit()
    db.refresh(project)
    return project


@router.delete('/{project_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_project_or_404(project_id, user.id, db)
    db.delete(project)
    db.commit()


@router.post('/{project_id}/counters', response_model=CounterRead, status_code=status.HTTP_201_CREATED)
def create_counter(
    project_id: str,
    payload: CounterCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)
    counter = models.Counter(
        project_id=project_id,
        label=payload.label,
        type=payload.type,
    )
    db.add(counter)
    db.commit()
    db.refresh(counter)
    return counter


@router.patch('/{project_id}/counters/{counter_id}', response_model=CounterRead)
def update_counter(
    project_id: str,
    counter_id: str,
    payload: CounterUpdate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)
    counter = (
        db.query(models.Counter)
        .filter(models.Counter.id == counter_id, models.Counter.project_id == project_id)
        .first()
    )
    if not counter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Counter not found')

    counter.value = payload.value
    db.commit()
    db.refresh(counter)
    return counter


@router.delete('/{project_id}/counters/{counter_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_counter(
    project_id: str,
    counter_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)
    counter = (
        db.query(models.Counter)
        .filter(models.Counter.id == counter_id, models.Counter.project_id == project_id)
        .first()
    )
    if not counter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Counter not found')
    db.delete(counter)
    db.commit()


@router.post(
    '/{project_id}/pattern-items',
    response_model=PatternItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_pattern_item(
    project_id: str,
    payload: PatternItemCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)
    item = models.PatternItem(
        project_id=project_id,
        row_number=payload.row_number,
        instruction=payload.instruction,
        stitch_count=payload.stitch_count,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post('/{project_id}/pattern-items/bulk', response_model=list[PatternItemRead])
def bulk_create_pattern_items(
    project_id: str,
    payload: PatternItemBulkCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)

    db.query(models.PatternItem).filter(models.PatternItem.project_id == project_id).delete()

    created_items: list[models.PatternItem] = []
    for item in payload.items:
        pattern_item = models.PatternItem(
            project_id=project_id,
            row_number=item.row_number,
            instruction=item.instruction,
            stitch_count=item.stitch_count,
        )
        db.add(pattern_item)
        created_items.append(pattern_item)

    db.commit()
    for item in created_items:
        db.refresh(item)
    return created_items


@router.patch('/{project_id}/pattern-items/{item_id}', response_model=PatternItemRead)
def update_pattern_item(
    project_id: str,
    item_id: str,
    payload: PatternItemUpdate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)
    item = (
        db.query(models.PatternItem)
        .filter(models.PatternItem.id == item_id, models.PatternItem.project_id == project_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Pattern item not found')

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete('/{project_id}/pattern-items/{item_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_pattern_item(
    project_id: str,
    item_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_project_or_404(project_id, user.id, db)
    item = (
        db.query(models.PatternItem)
        .filter(models.PatternItem.id == item_id, models.PatternItem.project_id == project_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Pattern item not found')
    db.delete(item)
    db.commit()
