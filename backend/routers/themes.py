from fastapi import APIRouter, Query

from mock_news import mock_articles, theme_summaries
from schemas import CategoryEnum, ThemeEnum, ThemeNewsResponse

router = APIRouter(prefix="/themes", tags=["themes"])


@router.get("/{theme}/news", response_model=ThemeNewsResponse)
def get_theme_news(
    theme: ThemeEnum,
    category: CategoryEnum = Query(default=CategoryEnum.all),
):
    filtered_articles = [
        article
        for article in mock_articles
        if article.theme == theme
        and (
            category == CategoryEnum.all
            or article.category.value == category.value
        )
    ]

    return ThemeNewsResponse(
        theme=theme,
        category=category,
        summary=theme_summaries[theme],
        articles=filtered_articles,
    )