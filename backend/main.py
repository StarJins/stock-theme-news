from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# .env 파일 로드 (나중에 네이버 API 키 등을 관리)
load_dotenv()

# 스케줄러 설정
scheduler = BackgroundScheduler()

def fetch_naver_news_job():
    print("▶ 네이버 뉴스 크롤링 및 카테고리 분류 작업 실행 중... (10분 주기)")
    # TODO: 여기에 crawler.py 와 processor.py 를 호출하여 뉴스를 캐싱하는 로직이 들어갈 예정입니다.

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 실행될 로직
    print("서버가 시작되었습니다. 뉴스 수집 스케줄러를 등록합니다.")
    scheduler.add_job(
        fetch_naver_news_job,
        trigger=IntervalTrigger(minutes=10),
        id='fetch_news_job',
        name='Fetch Naver News every 10 minutes',
        replace_existing=True
    )
    scheduler.start()
    
    # 서버가 시작될 때 즉시 1회 데이터를 가져오도록 실행
    fetch_naver_news_job()
    
    yield
    
    # 서버 종료 시 실행될 로직
    print("서버가 종료됩니다. 스케줄러를 정지합니다.")
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# CORS 설정 (프론트엔드와의 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 모든 도메인 허용. 실제 배포 시 프론트엔드 도메인으로 제한하는 것이 좋습니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Stock Theme News API is running!"}

@app.get("/api/themes/{theme}/news")
def get_theme_news(
    theme: str,
    category: str = Query("전체", description="뉴스 카테고리"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=20, description="페이지당 기사 수")
):
    # TODO: fetch_naver_news_job() 이 메모리(또는 DB)에 캐싱해 둔 데이터를 읽어서 반환하도록 수정 예정
    return {
        "theme": theme,
        "category": category,
        "summary": f"{theme} 테마의 {category} 카테고리에 대한 임시 데이터입니다.",
        "articles": [],
        "page": page,
        "page_size": page_size,
        "has_more": False,
        "total_articles": 0,
    }