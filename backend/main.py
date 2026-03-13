from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.debug import router as debug_router
from routers.themes import router as themes_router

app = FastAPI(
    title="Stock Theme News API",
    description="주식 테마별 뉴스 요약 API",
    version="0.1.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(debug_router)
app.include_router(themes_router)


@app.get("/")
def read_root():
    return {"message": "백엔드 서버가 정상 동작 중입니다."}


@app.get("/health")
def health_check():
    return {"status": "ok"}