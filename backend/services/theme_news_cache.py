import json
import os
import re
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from schemas import CategoryEnum, NewsCategoryEnum, NewsItem, ThemeEnum
from services.naver_news import search_naver_news

KST = timezone(timedelta(hours=9), name="Asia/Seoul")
CACHE_TTL_SECONDS = int(os.getenv("NEWS_CACHE_TTL_SECONDS", "600"))
CACHE_DIR = Path(os.getenv("NEWS_CACHE_DIR", "runtime_cache/news"))
MAX_CANDIDATES = int(os.getenv("NEWS_MAX_CANDIDATES", "100"))

THEME_CONFIGS: dict[ThemeEnum, dict[str, Any]] = {
    ThemeEnum.semiconductor: {
        "query": "반도체",
        "keywords": {
            "primary": ["반도체", "hbm", "메모리", "파운드리", "dram", "낸드", "sk하이닉스", "삼성전자"],
            "secondary": ["칩", "웨이퍼", "패키징", "ai 반도체", "고대역폭메모리", "micron", "tsmc"],
            "negative": ["피부", "화장품", "치과", "반도체등"],
        },
        "label": "반도체",
    },
    ThemeEnum.ai: {
        "query": "인공지능",
        "keywords": {
            "primary": ["인공지능", "ai", "생성형 ai", "llm", "모델", "추론", "학습", "gpu", "챗gpt", "오픈ai"],
            "secondary": ["에이전트", "멀티모달", "파인튜닝", "온디바이스 ai", "데이터센터", "npu"],
            "negative": ["a.i", "아이"],
        },
        "label": "AI",
    },
    ThemeEnum.defense: {
        "query": "방산",
        "keywords": {
            "primary": ["방산", "국방", "방위산업", "무기", "무기수출", "전투기", "미사일", "잠수함", "한화에어로스페이스"],
            "secondary": ["k9", "fa-50", "천궁", "l-sam", "군수", "방위사업청", "함정"],
            "negative": ["방산시장", "부동산"],
        },
        "label": "방산",
    },
}


def _now_kst() -> datetime:
    return datetime.now(KST)


def _parse_published_at(published_at: str) -> datetime | None:
    try:
        return datetime.strptime(published_at, "%Y-%m-%d %H:%M").replace(tzinfo=KST)
    except Exception:
        return None


def _is_today_kst(published_at: str) -> bool:
    article_dt = _parse_published_at(published_at)
    if not article_dt:
        return False
    return article_dt.date() == _now_kst().date()


CATEGORY_RULES = {
    NewsCategoryEnum.politics: ["정부", "정책", "국회", "규제", "예산", "대통령", "장관", "국정", "외교", "법안"],
    NewsCategoryEnum.society: ["고용", "교육", "인력", "사회", "현장", "노조", "안전", "사고", "채용", "산재"],
}


def infer_category(title: str, description: str) -> NewsCategoryEnum:
    text = f"{title} {description}".lower()
    for category, keywords in CATEGORY_RULES.items():
        if any(keyword.lower() in text for keyword in keywords):
            return category
    return NewsCategoryEnum.economy


_WORD_RE = re.compile(r"[\w가-힣\-]+")


def compute_relevance_score(theme: ThemeEnum, title: str, description: str, published_at: str) -> float:
    config = THEME_CONFIGS[theme]
    keywords = config["keywords"]
    title_l = title.lower()
    desc_l = description.lower()
    score = 0.0

    for keyword in keywords["primary"]:
        keyword_l = keyword.lower()
        if keyword_l in title_l:
            score += 6.0
        if keyword_l in desc_l:
            score += 2.5

    for keyword in keywords["secondary"]:
        keyword_l = keyword.lower()
        if keyword_l in title_l:
            score += 3.0
        if keyword_l in desc_l:
            score += 1.0

    for keyword in keywords["negative"]:
        keyword_l = keyword.lower()
        if keyword_l in title_l:
            score -= 4.0
        if keyword_l in desc_l:
            score -= 1.5

    # 제목이 짧고 핵심어가 많이 들어갈수록 조금 유리하게 처리
    title_tokens = _WORD_RE.findall(title_l)
    if title_tokens:
        unique_matches = sum(
            1 for token in set(title_tokens)
            if token in {k.lower() for k in keywords["primary"] + keywords["secondary"]}
        )
        score += min(unique_matches * 0.7, 2.8)

    article_dt = _parse_published_at(published_at)
    if article_dt:
        minutes_ago = max((_now_kst() - article_dt).total_seconds() / 60.0, 0.0)
        score += max(4.0 - (minutes_ago / 120.0), 0.0)

    return round(score, 2)


def _canonical_url(item: dict[str, Any]) -> str:
    return (item.get("originallink") or item.get("link") or "").strip()


def _cache_path(theme: ThemeEnum) -> Path:
    today_str = _now_kst().strftime("%Y-%m-%d")
    return CACHE_DIR / today_str / f"{theme.value}.json"


def _load_cache(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None

    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _is_cache_fresh(cache_doc: dict[str, Any]) -> bool:
    expires_at = cache_doc.get("expires_at")
    if not expires_at:
        return False
    try:
        expires_dt = datetime.fromisoformat(expires_at)
    except Exception:
        return False
    return expires_dt > _now_kst()


def _write_cache_atomic(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix="news-cache-", suffix=".json", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as tmp:
            json.dump(payload, tmp, ensure_ascii=False, indent=2)
        os.replace(temp_path, path)
    except Exception:
        try:
            os.unlink(temp_path)
        except OSError:
            pass
        raise


def _dedupe_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen_urls: set[str] = set()
    seen_titles: set[str] = set()
    deduped: list[dict[str, Any]] = []

    for item in items:
        url = _canonical_url(item)
        title_key = re.sub(r"\s+", " ", item["title"]).strip().lower()
        if url and url in seen_urls:
            continue
        if title_key and title_key in seen_titles:
            continue

        if url:
            seen_urls.add(url)
        if title_key:
            seen_titles.add(title_key)
        deduped.append(item)

    return deduped


def _make_summary(theme: ThemeEnum, articles: list[dict[str, Any]]) -> str:
    if not articles:
        return f"오늘 {theme.value} 테마 관련 오늘 날짜 기사를 찾지 못했습니다."

    top_titles = [article["title"] for article in articles[:3]]
    joined_titles = "; ".join(top_titles)
    return (
        f"오늘 {theme.value} 테마 기사 {len(articles)}건을 수집했고, "
        f"상위 이슈는 {joined_titles} 입니다."
    )


async def _refresh_theme_cache(theme: ThemeEnum) -> dict[str, Any]:
    config = THEME_CONFIGS[theme]
    raw_result = await search_naver_news(
        query=config["query"],
        display=min(MAX_CANDIDATES, 100),
        start=1,
        sort="date",
    )

    candidates = [item for item in raw_result["items"] if _is_today_kst(item["pubDate"])]
    candidates = _dedupe_items(candidates)

    ranked_articles: list[dict[str, Any]] = []
    for item in candidates:
        category = infer_category(item["title"], item["description"])
        ranked_articles.append(
            {
                "theme": theme.value,
                "title": item["title"],
                "source": "네이버 뉴스 검색",
                "publishedAt": item["pubDate"],
                "category": category.value,
                "summary": item["description"],
                "url": _canonical_url(item),
                "relevance_score": compute_relevance_score(
                    theme=theme,
                    title=item["title"],
                    description=item["description"],
                    published_at=item["pubDate"],
                ),
            }
        )

    ranked_articles.sort(
        key=lambda article: (
            article["relevance_score"],
            article["publishedAt"],
        ),
        reverse=True,
    )

    fetched_at = _now_kst()
    payload = {
        "theme": theme.value,
        "query": config["query"],
        "date": fetched_at.strftime("%Y-%m-%d"),
        "fetched_at": fetched_at.isoformat(),
        "expires_at": (fetched_at + timedelta(seconds=CACHE_TTL_SECONDS)).isoformat(),
        "candidate_count": min(raw_result.get("display", 0), MAX_CANDIDATES),
        "article_count": len(ranked_articles),
        "summary": _make_summary(theme, ranked_articles),
        "articles": ranked_articles,
    }

    _write_cache_atomic(_cache_path(theme), payload)
    return payload


async def get_theme_cache(theme: ThemeEnum) -> tuple[dict[str, Any], bool]:
    path = _cache_path(theme)
    cache_doc = _load_cache(path)
    if cache_doc and _is_cache_fresh(cache_doc):
        return cache_doc, True

    cache_doc = await _refresh_theme_cache(theme)
    return cache_doc, False


async def get_theme_news_page(
    theme: ThemeEnum,
    category: CategoryEnum,
    page: int,
    page_size: int,
) -> dict[str, Any]:
    cache_doc, cache_hit = await get_theme_cache(theme)

    articles = cache_doc.get("articles", [])
    if category != CategoryEnum.all:
        articles = [article for article in articles if article["category"] == category.value]

    total_articles = len(articles)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_articles = articles[start_idx:end_idx]
    has_more = end_idx < total_articles

    response_articles = [
        NewsItem(
            id=start_idx + index + 1,
            theme=theme,
            title=article["title"],
            source=article["source"],
            publishedAt=article["publishedAt"],
            category=NewsCategoryEnum(article["category"]),
            summary=article["summary"],
            url=article["url"],
            relevanceScore=article.get("relevance_score"),
        )
        for index, article in enumerate(page_articles)
    ]

    return {
        "theme": theme,
        "category": category,
        "summary": cache_doc.get("summary") or _make_summary(theme, articles),
        "articles": response_articles,
        "page": page,
        "page_size": page_size,
        "has_more": has_more,
        "total_articles": total_articles,
        "generated_at": cache_doc.get("fetched_at"),
        "expires_at": cache_doc.get("expires_at"),
        "cache_hit": cache_hit,
    }
