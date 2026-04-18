import os
import re
import httpx
import html
from datetime import datetime

from processor import (
    THEME_COLLECTION_PROFILES,
    infer_category,
    compute_relevance_score,
    dedupe_news_items,
    KST
)

# 수집된 뉴스 데이터를 저장할 인메모리 딕셔너리 (캐시 역할)
NEWS_CACHE = {}

def strip_html_and_entities(text: str) -> str:
    if not text: return ""
    # HTML 태그 제거
    clean = re.sub(r'<[^>]+>', '', text)
    # &quot;, &amp; 등 HTML 엔티티를 실제 문자로 변환
    return html.unescape(clean)

def fetch_naver_news():
    print("\n▶ 시작: 네이버 뉴스 API 크롤링 및 카테고리 분류")
    client_id = os.getenv("NAVER_CLIENT_ID")
    client_secret = os.getenv("NAVER_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("⚠️ 에러: .env 파일에 NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.")
        return
        
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret
    }
    url = "https://openapi.naver.com/v1/search/news.json"
    
    new_cache = {}
    
    with httpx.Client() as client:
        for theme, profile in THEME_COLLECTION_PROFILES.items():
            print(f"  - [{theme}] 테마 기사 수집 중...")
            all_candidates = []
            
            # 각 테마에 정의된 검색어들을 순회하며 API 호출
            for query in profile["queries"]:
                params = {"query": query, "display": 100, "start": 1, "sort": "sim"}
                try:
                    response = client.get(url, headers=headers, params=params, timeout=10.0)
                    if response.status_code == 200:
                        data = response.json()
                        all_candidates.extend(data.get("items", []))
                    else:
                        print(f"    ⚠️ API 호출 실패 ({response.status_code}): {response.text}")
                except Exception as e:
                    print(f"    ⚠️ 요청 에러 ('{query}'): {e}")
            
            # 중복 기사 제거
            deduped_items = dedupe_news_items(all_candidates)
            
            processed_articles = []
            for item in deduped_items:
                raw_title = strip_html_and_entities(item.get("title", ""))
                raw_desc = strip_html_and_entities(item.get("description", ""))
                link = item.get("url") or item.get("link") or item.get("originallink", "")
                
                # 날짜 형식 변환 (Naver: 'Thu, 15 Jun 2023 10:30:00 +0900' -> 'YYYY-MM-DD HH:MM:SS')
                try:
                    pub_date_obj = datetime.strptime(item["pubDate"], "%a, %d %b %Y %H:%M:%S %z")
                    pub_date_str = pub_date_obj.astimezone(KST).strftime("%Y-%m-%d %H:%M:%S")
                except Exception:
                    pub_date_str = item.get("pubDate", "")
                    
                # 카테고리 추론 및 적합도 점수 계산
                category = infer_category(raw_title, raw_desc, theme)
                score = compute_relevance_score(theme, raw_title, raw_desc, pub_date_str, category)
                
                processed_articles.append({
                    "title": raw_title,
                    "url": link,
                    "description": raw_desc,
                    "pubDate": pub_date_str,
                    "category": category,
                    "relevance_score": score
                })
            
            # 정렬: 1순위 적합도 점수(내림차순), 2순위 최신순(내림차순)
            processed_articles.sort(key=lambda x: (x["relevance_score"], x["pubDate"]), reverse=True)
            
            top_titles = [a["title"] for a in processed_articles[:3]]
            summary = f"오늘 {theme} 테마 기사 {len(processed_articles)}건을 수집했고, 상위 이슈는 {'; '.join(top_titles)} 입니다." if processed_articles else f"{theme} 테마 관련 기사를 찾지 못했습니다."

            new_cache[theme] = {
                "theme": theme,
                "fetched_at": datetime.now(KST).isoformat(),
                "candidate_count": len(all_candidates),
                "article_count": len(processed_articles),
                "summary": summary,
                "articles": processed_articles
            }
            
    # 크롤링이 모두 끝나면 전역 변수를 교체하여 캐시 업데이트
    global NEWS_CACHE
    NEWS_CACHE.clear()
    NEWS_CACHE.update(new_cache)
    print("▶ 완료: 모든 테마의 뉴스 크롤링 및 캐싱이 완료되었습니다.\n")

def get_cached_theme_news(theme: str):
    return NEWS_CACHE.get(theme)