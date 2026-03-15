from enum import Enum
from pydantic import BaseModel


class ThemeEnum(str, Enum):
    semiconductor = "반도체"
    ai = "AI"
    defense = "방산"


class CategoryEnum(str, Enum):
    all = "전체"
    economy = "경제"
    society = "사회"
    politics = "정치"


class NewsCategoryEnum(str, Enum):
    economy = "경제"
    society = "사회"
    politics = "정치"


class NewsItem(BaseModel):
    id: int
    theme: ThemeEnum
    title: str
    source: str
    publishedAt: str
    category: NewsCategoryEnum
    summary: str
    url: str


class ThemeNewsResponse(BaseModel):
    theme: ThemeEnum
    category: CategoryEnum
    summary: str
    articles: list[NewsItem]
    page: int
    page_size: int
    has_more: bool