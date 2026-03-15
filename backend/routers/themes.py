from datetime import datetime
from fastapi import APIRouter, Query

from schemas import (
    CategoryEnum,
    ThemeEnum,
    ThemeNewsResponse,
    NewsItem,
    NewsCategoryEnum,
)
from services.naver_news import search_naver_news

router = APIRouter(prefix="/themes", tags=["themes"])

theme_queries = {
    ThemeEnum.semiconductor: "반도체",
    ThemeEnum.ai: "인공지능",
    ThemeEnum.defense: "방산",
}

theme_summaries = {
    ThemeEnum.semiconductor: "오늘 반도체 테마 관련 최신 뉴스입니다.",
    ThemeEnum.ai: "오늘 AI 테마 관련 최신 뉴스입니다.",
    ThemeEnum.defense: "오늘 방산 테마 관련 최신 뉴스입니다.",
}


def is_today(published_at: str) -> bool:
    try:
        article_date = datetime.strptime(published_at, "%Y-%m-%d %H:%M").date()
        today = datetime.now().date()
        return article_date == today
    except Exception:
        return False


@router.get("/{theme}/news", response_model=ThemeNewsResponse)
async def get_theme_news(
    theme: ThemeEnum,
    category: CategoryEnum = Query(default=CategoryEnum.all),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=20),
):
    query = theme_queries[theme]
    start = (page - 1) * page_size + 1

    raw_result = await search_naver_news(
        query=query,
        display=page_size,
        start=start,
        sort="date",
    )

    articles = []

    for idx, item in enumerate(raw_result["items"], start=start):
        if not is_today(item["pubDate"]):
            continue

        text = f'{item["title"]} {item["description"]}'

        if any(word in text for word in ["정부", "정책", "국회", "규제", "예산"]):
            inferred_category = NewsCategoryEnum.politics
        elif any(word in text for word in ["고용", "교육", "인력", "사회", "현장"]):
            inferred_category = NewsCategoryEnum.society
        else:
            inferred_category = NewsCategoryEnum.economy

        if category != CategoryEnum.all and inferred_category.value != category.value:
            continue

        articles.append(
            NewsItem(
                id=idx,
                theme=theme,
                title=item["title"],
                source="네이버 뉴스 검색",
                publishedAt=item["pubDate"],
                category=inferred_category,
                summary=item["description"],
                url=item["originallink"] or item["link"],
            )
        )

    has_more = len(raw_result["items"]) == page_size and start + page_size - 1 < 1000

    return ThemeNewsResponse(
        theme=theme,
        category=category,
        summary=theme_summaries[theme],
        articles=articles,
        page=page,
        page_size=page_size,
        has_more=has_more,
    )