from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from routers import pattern_parser, projects

Base.metadata.create_all(bind=engine)

app = FastAPI(title='Stitch Counter API', version='0.1.0')

origins = [origin.strip() for origin in settings.cors_origins.split(',') if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(projects.router)
app.include_router(pattern_parser.router)


@app.get('/health')
def health_check():
    return {'status': 'ok'}
