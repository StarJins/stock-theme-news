from fastapi import APIRouter, Query

from schemas import CategoryEnum, ThemeEnum, ThemeNewsResponse
from services.theme_news_cache import get_theme_news_page

router = APIRouter(prefix="/themes", tags=["themes"])


@router.get("/{theme}/news", response_model=ThemeNewsResponse)
async def get_theme_news(
    theme: ThemeEnum,
    category: CategoryEnum = Query(default=CategoryEnum.all),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=20),
):
    return await get_theme_news_page(
        theme=theme,
        category=category,
        page=page,
        page_size=page_size,
    )
