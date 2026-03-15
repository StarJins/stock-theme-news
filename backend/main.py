# uvicorn main:app --reload --host 0.0.0.0 --port 8000

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.debug import router as debug_router
from routers.themes import router as themes_router

app = FastAPI(
    title="Stock Theme News API",
    description="주식 테마별 뉴스 요약 API",
    version="0.1.0",
)


def parse_origins(value: str | None) -> list[str]:
    if not value:
        return []
    return [origin.strip() for origin in value.split(",") if origin.strip()]


APP_ENV = os.getenv("APP_ENV", "development").lower()
CORS_ALLOW_ORIGINS = parse_origins(os.getenv("CORS_ALLOW_ORIGINS"))
CORS_ALLOW_ORIGIN_REGEX = os.getenv("CORS_ALLOW_ORIGIN_REGEX")

# 개발 환경에서는 localhost/127.0.0.1 및 사설망 IP 대역을 허용해
# 같은 공유기의 다른 기기에서도 쉽게 확인할 수 있게 한다.
if APP_ENV == "development" and not CORS_ALLOW_ORIGIN_REGEX:
    CORS_ALLOW_ORIGIN_REGEX = (
        r"^https?://("
        r"localhost|"
        r"127\.0\.0\.1|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}"
        r")(:\d+)?$"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_origin_regex=CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(debug_router)
app.include_router(themes_router)


@app.get("/")
def read_root():
    return {
        "message": "백엔드 서버가 정상 동작 중입니다.",
        "app_env": APP_ENV,
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "app_env": APP_ENV}
