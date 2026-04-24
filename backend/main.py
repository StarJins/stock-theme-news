from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import math

from crawler import fetch_naver_news, get_cached_theme_news

# .env 파일 로드 (나중에 네이버 API 키 등을 관리)
load_dotenv()

# 스케줄러 설정
scheduler = BackgroundScheduler()

def fetch_naver_news_job():
    fetch_naver_news()

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
    
    # 서버 부팅을 방해하지 않도록 별도 스레드에서 초기 크롤링 실행
    import threading
    threading.Thread(target=fetch_naver_news_job, daemon=True).start()
    
    yield
    
    # 서버 종료 시 실행될 로직
    print("서버가 종료됩니다. 스케줄러를 정지합니다.")
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# CORS 설정 (프론트엔드와의 통신 허용)
frontend_url = os.getenv("FRONTEND_URL", "*")
origins = [frontend_url] if frontend_url != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    cache_doc = get_cached_theme_news(theme)
    if not cache_doc:
        raise HTTPException(status_code=404, detail="현재 테마별 뉴스를 수집 중 입니다. 잠시 후 다시 시도해주세요.")
        
    articles = cache_doc["articles"]
    if category != "전체":
        articles = [a for a in articles if a["category"] == category]
        
    total_articles = len(articles)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    page_articles = []
    for i, a in enumerate(articles[start_idx:end_idx]):
        score = a.get("relevance_score", 0)
        percent = max(0, min(100, round(100 / (1 + math.exp(-(score - 12) / 4)))))
        
        if percent >= 85: label = "매우 높음"
        elif percent >= 70: label = "높음"
        elif percent >= 50: label = "보통"
        elif percent >= 30: label = "낮음"
        else: label = "매우 낮음"
        
        page_articles.append({
            "id": start_idx + i + 1,
            "title": a["title"],
            "url": a["url"],
            "description": a["description"],
            "summary": a["description"],
            "pubDate": a["pubDate"],
            "publishedAt": a["pubDate"],
            "source": "네이버 뉴스 검색",
            "theme": theme,
            "category": a["category"],
            "relevanceScore": score,
            "relevancePercent": percent,
            "relevanceLabel": label,
            "publisher": "네이버 뉴스 검색",
            "matchedQuery": None
        })
        
    return {
        "theme": theme,
        "category": category,
        "summary": cache_doc["summary"],
        "articles": page_articles,
        "page": page,
        "page_size": page_size,
        "has_more": end_idx < total_articles,
        "total_articles": total_articles,
        "generated_at": cache_doc["fetched_at"],
        "cache_hit": True
    }