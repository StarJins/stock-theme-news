from fastapi import APIRouter, Query

from services.naver_news import search_naver_news

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/naver-news")
async def debug_naver_news(
    query: str = Query(..., description="예: 반도체"),
    display: int = Query(default=5, ge=1, le=20),
):
    return await search_naver_news(query=query, display=display, sort="date")