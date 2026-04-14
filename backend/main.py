from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
from routers import auth, social, reviews, progress, content, stats, imports
from google_auth import router as google_router

Base.metadata.create_all(bind=engine)

# ── Runtime migration: add new columns if they don't exist ────────────────────
def _run_migrations():
    stmts = [
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS book_title VARCHAR(300)",
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS cover_url  VARCHAR(500)",
    ]
    try:
        with engine.connect() as conn:
            for stmt in stmts:
                conn.execute(text(stmt))
            conn.commit()
    except Exception as e:
        print(f"[migration] {e}")

_run_migrations()

app = FastAPI(title="PaperBoxd API v3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(social.router)
app.include_router(reviews.router)
app.include_router(progress.router)
app.include_router(content.router)
app.include_router(stats.router)
app.include_router(imports.router)
app.include_router(google_router)


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}