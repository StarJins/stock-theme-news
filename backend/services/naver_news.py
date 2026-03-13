import os
import re
import html
from email.utils import parsedate_to_datetime

import httpx
from dotenv import load_dotenv

load_dotenv()

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

NAVER_NEWS_API_URL = "https://openapi.naver.com/v1/search/news.json"


def clean_text(text: str) -> str:
    if not text:
        return ""

    # <b> 같은 HTML 태그 제거
    text = re.sub(r"<[^>]+>", "", text)

    # &quot; &amp; 같은 HTML 엔티티 변환
    text = html.unescape(text)

    # 공백 정리
    text = text.strip()

    return text


def format_pub_date(pub_date: str) -> str:
    if not pub_date:
        return ""

    try:
        dt = parsedate_to_datetime(pub_date)
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return pub_date


async def search_naver_news(
    query: str,
    display: int = 10,
    start: int = 1,
    sort: str = "date",
):
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        raise ValueError("네이버 API 키가 설정되지 않았습니다. .env 파일을 확인하세요.")

    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }

    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            NAVER_NEWS_API_URL,
            headers=headers,
            params=params,
        )
        response.raise_for_status()
        data = response.json()

    items = data.get("items", [])

    normalized_items = []
    for item in items:
        normalized_items.append(
            {
                "title": clean_text(item.get("title", "")),
                "originallink": item.get("originallink", ""),
                "link": item.get("link", ""),
                "description": clean_text(item.get("description", "")),
                "pubDate": format_pub_date(item.get("pubDate", "")),
            }
        )

    return {
        "lastBuildDate": data.get("lastBuildDate"),
        "total": data.get("total", 0),
        "start": data.get("start", start),
        "display": data.get("display", display),
        "items": normalized_items,
    }