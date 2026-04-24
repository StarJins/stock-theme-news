import os
import re
import time
import httpx
import html
import threading
import math
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
IS_CRAWLING = False
_crawl_lock = threading.Lock()
_theme_locks = {theme: threading.Lock() for theme in THEME_COLLECTION_PROFILES.keys()}

def strip_html_and_entities(text: str) -> str:
    if not text: return ""
    # HTML 태그 제거
    clean = re.sub(r'<[^>]+>', '', text)
    # &quot;, &amp; 등 HTML 엔티티를 실제 문자로 변환
    return html.unescape(clean)

def get_relevance_group(score: float) -> int:
    # 1: 매우 높음, 높음 (>= 70%)
    # 2: 보통 (>= 50%)
    # 3: 낮음, 매우 낮음 (< 50%)
    percent = max(0, min(100, round(100 / (1 + math.exp(-(score - 12) / 4)))))
    if percent >= 70: return 1
    elif percent >= 50: return 2
    else: return 3

def fetch_single_theme(theme: str, profile: dict, url: str, headers: dict, today_str: str, client: httpx.Client) -> dict:
    print(f"  - [{theme}] 테마 기사 수집 중...")
    all_candidates = []
    
    # 각 테마에 정의된 검색어들을 순회하며 API 호출
    for query in profile["queries"]:
        start = 1
        
        # 네이버 API는 start 파라미터를 최대 1000까지만 허용하므로 while문으로 반복
        while start <= 1000:
            params = {"query": query, "display": 100, "start": start, "sort": "date"}
            
            max_retries = 5
            retry_delay = 2.0
            success = False
            
            for attempt in range(max_retries):
                try:
                    response = client.get(url, headers=headers, params=params, timeout=10.0)
                    if response.status_code == 200:
                        success = True
                        break
                    elif response.status_code == 429:
                        print(f"    ⚠️ 속도 제한 초과 (429). {retry_delay}초 후 재시도... ({attempt + 1}/{max_retries})")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # 지수 백오프: 대기 시간을 2배씩 늘림
                    else:
                        print(f"    ⚠️ API 호출 실패 ({response.status_code}): {response.text}")
                        break
                except Exception as e:
                    print(f"    ⚠️ 요청 에러 ('{query}'): {e}")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    
            if not success:
                print(f"    ❌ '{query}' 검색어 데이터 수집 최종 실패. 다음 검색어로 넘어갑니다.")
                break
                
            data = response.json()
            items = data.get("items", [])
            
            if not items:
                break # 더 이상 가져올 기사가 없으면 페이징 종료
            
            older_article_found = False
            
            for item in items:
                # 기사 작성 시간 파싱
                try:
                    pub_date_obj = datetime.strptime(item["pubDate"], "%a, %d %b %Y %H:%M:%S %z")
                    item_date_str = pub_date_obj.astimezone(KST).strftime("%Y-%m-%d")
                except Exception:
                    item_date_str = ""
                
                # 오늘 날짜인 경우에만 수집 목록에 추가
                if item_date_str == today_str:
                    all_candidates.append(item)
                else:
                    # 최신순 정렬이므로, 오늘 날짜가 아닌(과거) 기사가 나오면
                    # 그 뒤의 기사들도 모두 과거 기사이므로 수집 중단 플래그 설정
                    older_article_found = True
            
            if older_article_found:
                break # 과거 기사가 발견되었으므로 이 검색어에 대한 페이징 중단
            
            # 다음 100개를 가져오기 위해 start 값 증가
            start += 100 
            
            # API 호출 제한 방지를 위해 1.5초 대기 (한 번 호출할 때마다 쉼)
            time.sleep(1.5) 
    
    # 중복 기사 제거
    deduped_items = dedupe_news_items(all_candidates)
    
    processed_articles = []
    for item in deduped_items:
        # 위에서 이미 오늘 날짜만 필터링했으므로, 여기서는 형식만 YYYY-MM-DD HH:MM:SS 로 예쁘게 변경
        try:
            pub_date_obj = datetime.strptime(item["pubDate"], "%a, %d %b %Y %H:%M:%S %z")
            pub_date_str = pub_date_obj.astimezone(KST).strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            pub_date_str = item.get("pubDate", "")
            
        raw_title = strip_html_and_entities(item.get("title", ""))
        raw_desc = strip_html_and_entities(item.get("description", ""))
        link = item.get("url") or item.get("link") or item.get("originallink", "")
        
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
    
    # 정렬: 1순위 적합도 그룹(1그룹->3그룹 순), 2순위 최신순(내림차순)
    # reverse=True 상태에서 정렬 기준:
    # 첫 번째 요소: -get_relevance_group(...) -> 1그룹(-1) > 2그룹(-2) > 3그룹(-3) 이 되므로 그룹순으로 먼저 묶임
    # 두 번째 요소: pubDate 문자열 -> 시간이 늦을수록(최신일수록) 문자열 비교에서 크므로 최신순 정렬됨
    processed_articles.sort(key=lambda x: (-get_relevance_group(x["relevance_score"]), x["pubDate"]), reverse=True)
    
    top_titles = [a["title"] for a in processed_articles[:3]]
    summary = f"오늘 {theme} 테마 기사 {len(processed_articles)}건을 수집했고, 상위 이슈는 {'; '.join(top_titles)} 입니다." if processed_articles else f"{theme} 테마의 오늘자 관련 기사를 찾지 못했습니다."

    return {
        "theme": theme,
        "fetched_at": datetime.now(KST).isoformat(),
        "candidate_count": len(all_candidates),
        "article_count": len(processed_articles),
        "summary": summary,
        "articles": processed_articles
    }

def fetch_naver_news():
    global IS_CRAWLING
    with _crawl_lock:
        if IS_CRAWLING:
            return
        IS_CRAWLING = True
        
    try:
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
        
        # 오늘 날짜 문자열 추출 (예: '2026-04-20')
        today_str = datetime.now(KST).strftime("%Y-%m-%d")
        
        with httpx.Client() as client:
            for theme, profile in THEME_COLLECTION_PROFILES.items():
                new_cache[theme] = fetch_single_theme(theme, profile, url, headers, today_str, client)
                
        # 크롤링이 모두 끝나면 전역 변수를 교체하여 캐시 업데이트
        global NEWS_CACHE
        NEWS_CACHE.clear()
        NEWS_CACHE.update(new_cache)
        print("▶ 완료: 모든 테마의 뉴스 크롤링 및 캐싱이 완료되었습니다.\n")
    finally:
        with _crawl_lock:
            IS_CRAWLING = False

def fetch_single_theme_on_demand(theme: str):
    client_id = os.getenv("NAVER_CLIENT_ID")
    client_secret = os.getenv("NAVER_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        return
        
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret
    }
    url = "https://openapi.naver.com/v1/search/news.json"
    today_str = datetime.now(KST).strftime("%Y-%m-%d")
    
    profile = THEME_COLLECTION_PROFILES.get(theme)
    if not profile:
        return

    with httpx.Client() as client:
        result = fetch_single_theme(theme, profile, url, headers, today_str, client)
        
    if result:
        NEWS_CACHE[theme] = result

def get_cached_theme_news(theme: str):
    # 1. 이미 캐시에 있으면 반환
    cached_data = NEWS_CACHE.get(theme)
    if cached_data:
        return cached_data
        
    # 2. 캐시가 없는데, 백그라운드 전체 크롤링 중이라면 (서버 시작 직후 등) None 반환
    with _crawl_lock:
        if IS_CRAWLING:
            return None
            
    # 3. 백그라운드 크롤링이 돌지 않는데도 캐시에 데이터가 없으면 프론트엔드 요청에 의한 단일 테마 수집 시도
    # 동시에 여러번 같은 테마 요청이 오는 것을 방지하기 위해 blocking=False로 락을 얻음
    lock = _theme_locks.get(theme)
    if lock and lock.acquire(blocking=False):
        try:
            # 락 획득 후 혹시 그새 캐시가 채워졌는지 다시 확인
            if theme in NEWS_CACHE:
                return NEWS_CACHE[theme]
                
            print(f"\n▶ 프론트엔드 요청에 의한 단일 테마 크롤링 시작: {theme}")
            fetch_single_theme_on_demand(theme)
            return NEWS_CACHE.get(theme)
        finally:
            lock.release()
            
    # 락을 얻지 못했거나(이미 수집 중) 수집에 실패한 경우
    return NEWS_CACHE.get(theme)
