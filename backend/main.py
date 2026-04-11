from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import imports
from database import engine, Base
from routers import auth, social, reviews, progress, content, stats
from verification import router as verification_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PaperBoxd API v3")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(social.router)
app.include_router(reviews.router)
app.include_router(progress.router)
app.include_router(content.router)
app.include_router(stats.router)
app.include_router(imports.router)
app.include_router(verification_router)   


# ── HEALTH ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}