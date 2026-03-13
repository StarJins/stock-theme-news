from fastapi import APIRouter, Query

from schemas import CategoryEnum, ThemeEnum, ThemeNewsResponse, NewsItem, NewsCategoryEnum
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


@router.get("/{theme}/news", response_model=ThemeNewsResponse)
async def get_theme_news(
    theme: ThemeEnum,
    category: CategoryEnum = Query(default=CategoryEnum.all),
):
    query = theme_queries[theme]
    raw_result = await search_naver_news(query=query, display=10, sort="date")

    articles = []

    for idx, item in enumerate(raw_result["items"], start=1):
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

    return ThemeNewsResponse(
        theme=theme,
        category=category,
        summary=theme_summaries[theme],
        articles=articles,
    )