import re
import math
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))

THEME_CATEGORIES = {
    "반도체": ["삼성전자", "SK하이닉스", "메모리·HBM", "파운드리", "팹리스·설계", "장비", "패키징·테스트", "기타"],
    "AI": ["OpenAI", "구글", "앤스로픽", "메타", "LLM·모델", "AI반도체", "온디바이스", "AI서비스", "데이터센터", "기타"],
    "방산": ["한화에어로스페이스", "수주·수출", "지상무기", "항공·해상", "무인기·첨단", "정책·예산", "기타"],
    "원전": ["두산에너빌리티", "해외수주", "SMR", "설비·부품", "해체·폐기물", "정책·규제", "기타"],
    "배터리": ["테슬라", "LG에너지솔루션", "배터리셀", "핵심소재", "차세대", "광물·공급망", "폐배터리", "기타"],
    "건설": ["현대건설", "해외·플랜트", "정비사업", "PF·자금", "스마트건설", "자재·인프라", "기타"],
    "부동산": ["시황·동향", "청약·분양", "대출·금리", "개발·호재", "상업·수익형", "기타"],
    "우주항공": ["스페이스X", "민간우주", "발사체·로켓", "위성·통신", "우주탐사", "UAM", "기타"],
    "전쟁": ["중동분쟁", "러·우전쟁", "미중갈등", "재건·복구", "원자재·공급망", "기타"],
}

THEME_COLLECTION_PROFILES = {
    "반도체": {
        "label": "반도체",
        "queries": [
            "반도체",
            "HBM DRAM 낸드 파운드리",
            "삼성전자 SK하이닉스 TSMC Micron 반도체",
            "반도체 정책 반도체 규제 반도체 지원",
        ],
    },
    "AI": {
        "label": "AI",
        "queries": [
            "인공지능",
            "생성형 AI LLM 멀티모달",
            "챗GPT 오픈AI GPU NPU AI 반도체",
            "AI 정책 AI 규제 AI 데이터센터",
        ],
    },
    "방산": {
        "label": "방산",
        "queries": [
            "방산", "방위산업", "K방산", "무기 수출",
            "방산 수주", "FA-50", "K9 자주포", "천궁",
        ],
    },
    "원전": {
        "label": "원전",
        "queries": [
            "원전", "원전 수출", "원전 수주", "SMR",
            "소형모듈원전", "한국수력원자력", "원자력 체코",
        ],
    },
    "배터리": {
        "label": "배터리",
        "queries": [
            "이차전지", "배터리", "전고체", "LFP",
            "LG에너지솔루션", "삼성SDI", "SK온", "배터리 캐즘",
        ],
    },
    "건설": {
        "label": "건설",
        "queries": [
            "건설사", "건설사 수주", "부동산PF", "재건축",
            "재개발", "해외건설", "분양",
        ],
    },
    "부동산": {
        "label": "부동산",
        "queries": [
            "부동산", "아파트값", "집값", "전세 매매",
            "부동산 청약", "아파트 분양", "부동산 정책", "대출규제",
        ],
    },
    "우주항공": {
        "label": "우주항공",
        "queries": [
            "우주항공", "누리호", "스페이스X", "인공위성",
            "달 탐사", "우주 발사체",
        ],
    },
    "전쟁": {
        "label": "전쟁",
        "queries": [
            "전쟁", "러시아 우크라이나", "이스라엘 하마스",
            "중동 분쟁", "무력 충돌", "이란 미국",
        ],
    }
}

THEME_SCORING_PROFILES = {
    "반도체": {
        "primary": ["반도체", "hbm", "메모리", "dram", "낸드", "파운드리", "웨이퍼", "패키징", "ai 반도체"],
        "secondary": ["칩", "후공정", "전공정", "수율", "증설", "fab", "고대역폭메모리"],
        "negative": ["피부", "치과", "화장품", "반도체등"],
        "entities": ["삼성전자", "sk하이닉스", "tsmc", "micron", "인텔", "amd", "엔비디아"],
        "categories": {
            "삼성전자": ["삼성전자", "삼성", "samsung", "삼전", "전영현", "이재용"],
            "SK하이닉스": ["sk하이닉스", "하이닉스", "skhynix", "최태원", "곽노정"],
            "메모리·HBM": ["hbm", "메모리", "dram", "디램", "낸드", "nand", "고대역폭"],
            "파운드리": ["파운드리", "tsmc", "위탁생산", "선단공정", "나노", "가우테"],
            "팹리스·설계": ["팹리스", "arm", "설계", "디자인하우스", "비메모리", "시스템 반도체", "시스템반도체"],
            "장비": ["장비", "euv", "asml", "노광", "식각", "세정", "테스터", "어플라이드", "램리서치"],
            "패키징·테스트": ["패키징", "후공정", "osat", "칩렛", "2.5d", "3d", "테스트", "한미반도체"]
        }
    },
    "AI": {
        "primary": ["인공지능", "ai", "생성형 ai", "llm", "멀티모달", "추론", "학습", "모델", "챗gpt", "오픈ai"],
        "secondary": ["에이전트", "파인튜닝", "온디바이스 ai", "데이터센터", "gpu", "npu", "클라우드"],
        "negative": ["a.i", "아이"],
        "entities": ["오픈ai", "google", "구글", "meta", "메타", "microsoft", "ms", "엔비디아"],
        "categories": {
            "OpenAI": ["openai", "오픈ai", "샘 알트만", "chatgpt", "챗gpt", "sora", "소라"],
            "구글": ["구글", "google", "제미나이", "gemini", "순다르", "딥마인드"],
            "앤스로픽": ["앤스로픽", "anthropic", "클로드", "claude"],
            "메타": ["메타", "meta", "라마", "llama", "주크버그"],
            "LLM·모델": ["llm", "파운데이션", "멀티모달", "언어모델", "파라미터", "초거대"],
            "AI반도체": ["엔비디아", "nvidia", "amd", "npu", "가속기", "ai칩", "ai 반도체", "블랙웰"],
            "온디바이스": ["온디바이스", "스마트폰", "갤럭시 ai", "애플 인텔리전스", "pc", "가전"],
            "AI서비스": ["서비스", "b2b", "b2c", "에이전트", "소프트웨어", "수익화", "도입", "앱", "검색"],
            "데이터센터": ["데이터센터", "인프라", "서버", "전력", "쿨링", "냉각", "클라우드"]
        }
    },
    "방산": {
        "primary": ["방산", "국방", "방위산업", "무기", "무기수출", "전투기", "미사일", "잠수함", "군수"],
        "secondary": ["k9", "fa-50", "천궁", "l-sam", "함정", "장갑차", "탄약", "전력화"],
        "negative": ["부동산", "방산시장"],
        "entities": ["한화에어로스페이스", "현대로템", "한국항공우주", "lig넥스원", "방위사업청"],
        "categories": {
            "한화에어로스페이스": ["한화에어로", "한화에어로스페이스", "김동관"],
            "수주·수출": ["수주", "수출", "계약", "moa", "mou", "폴란드", "루마니아", "잭팟"],
            "지상무기": ["k9", "전차", "자주포", "장갑차", "k2", "현대로템", "레드백"],
            "항공·해상": ["전투기", "fa-50", "kf-21", "헬기", "잠수함", "함정", "한국항공우주", "kai"],
            "무인기·첨단": ["무인기", "드론", "대드론", "레이저", "우주", "사이버", "lig넥스원"],
            "정책·예산": ["방위사업청", "방사청", "국방부", "예산", "국방비", "정부", "안보"]
        }
    },
    "원전": {
        "primary": ["원전", "원자력", "smr", "체코", "원자로", "소형모듈원전"],
        "secondary": ["수출", "수주", "원안위", "생태계", "발전소", "우라늄"],
        "negative": ["원전사고", "오염수", "방사능 누출"],
        "entities": ["한국수력원자력", "한수원", "두산에너빌리티", "한국전력", "한전기술"],
        "categories": {
            "두산에너빌리티": ["두산에너빌리티", "두산", "주기기"],
            "해외수주": ["체코", "폴란드", "수주", "수출", "팀코리아", "우원식", "웨스팅하우스"],
            "SMR": ["smr", "소형모듈원전", "테라파워", "뉴스케일", "빌게이츠", "혁신형"],
            "설비·부품": ["설비", "부품", "터빈", "원자로", "펌프", "우진", "비에이치아이", "한전기술"],
            "해체·폐기물": ["해체", "폐기물", "방폐장", "건식저장", "오염"],
            "정책·규제": ["원안위", "생태계", "지원", "정부", "원자력안전위원회", "친환경", "택소노미", "탈원전"]
        }
    },
    "배터리": {
        "primary": ["배터리", "이차전지", "2차전지", "전고체", "lfp", "리튬", "양극재", "음극재"],
        "secondary": ["전기차", "캐즘", "수율", "공급망", "ess", "셀", "광물"],
        "negative": ["배터리 방전", "휴대폰 배터리", "폭행", "폭발"],
        "entities": ["lg에너지솔루션", "삼성sdi", "sk온", "에코프로", "포스코퓨처엠", "엘지에너지솔루션"],
        "categories": {
            "테슬라": ["테슬라", "tesla", "일론 머스크", "머스크", "모델"],
            "LG에너지솔루션": ["lg에너지솔루션", "lges", "엘지에너지솔루션", "권영수", "김동명"],
            "배터리셀": ["삼성sdi", "sk온", "배터리셀", "완성차", "oem", "파우치", "원통형"],
            "핵심소재": ["양극재", "음극재", "분리막", "전해액", "에코프로", "포스코퓨처엠", "엘앤에프"],
            "차세대": ["전고체", "4680", "리튬황", "차세대", "실리콘 음극재", "꿈의 배터리"],
            "광물·공급망": ["리튬", "니켈", "광물", "공급망", "ira", "인플레이션감축법", "흑연"],
            "폐배터리": ["폐배터리", "재활용", "리사이클링", "성일하이텍", "새빗켐"]
        }
    },
    "건설": {
        "primary": ["건설", "건설사", "수주", "재건축", "재개발", "pf", "부동산pf", "분양"],
        "secondary": ["착공", "시공", "미분양", "해외건설", "정비사업", "청약"],
        "negative": ["건설기계", "불법하도급", "부실시공", "철근 누락"],
        "entities": ["현대건설", "gs건설", "대우건설", "삼성물산", "dl이앤씨", "hdc현대산업개발"],
        "categories": {
            "현대건설": ["현대건설", "디에이치", "힐스테이트", "윤영준"],
            "해외·플랜트": ["해외", "플랜트", "중동", "네옴시티", "수주"],
            "정비사업": ["재건축", "재개발", "도시정비", "시공사", "조합", "리모델링", "가로주택"],
            "PF·자금": ["pf", "프로젝트파이낸싱", "유동성", "워크아웃", "태영", "자금조달", "부도", "브릿지론"],
            "스마트건설": ["스마트건설", "모듈러", "bim", "건설로봇", "드론", "프롭테크"],
            "자재·인프라": ["시멘트", "철근", "레미콘", "인프라", "토목", "원자재"]
        }
    },
    "부동산": {
        "primary": ["부동산", "아파트", "집값", "전세", "월세", "청약", "분양", "매매", "주택"],
        "secondary": ["대출", "금리", "규제지역", "디딤돌", "보금자리론", "ltv", "dsr", "임대차", "전세사기"],
        "negative": ["기획부동산", "사기꾼", "살인", "폭행", "사건"],
        "entities": ["국토교통부", "한국부동산원", "주택도시보증공사", "hug", "국토부"],
        "categories": {
            "시황·동향": ["아파트값", "전세가", "실거래가", "매매가", "하락", "상승", "보합", "한국부동산원", "거래량"],
            "청약·분양": ["청약", "분양", "경쟁률", "특별공급", "모델하우스", "당첨", "줍줍", "무순위"],
            "대출·금리": ["대출", "금리", "dsr", "주담대", "디딤돌", "보금자리", "한국은행", "가계부채"],
            "개발·호재": ["gtx", "신도시", "재건축", "선도지구", "철도", "지하화", "교통", "재개발"],
            "상업·수익형": ["상가", "오피스", "꼬마빌딩", "수익형", "리츠", "reits", "지식산업센터"]
        }
    },
    "우주항공": {
        "primary": ["우주", "항공", "위성", "발사체", "누리호", "스페이스x", "달탐사", "우주선"],
        "secondary": ["궤도", "로켓", "탐사선", "우주정거장", "인공위성"],
        "negative": ["항공권", "여행", "공항"],
        "entities": ["한화에어로스페이스", "한국항공우주", "kai", "스페이스x", "nasa", "항우연", "우주항공청"],
        "categories": {
            "스페이스X": ["스페이스x", "spacex", "스타십", "일론 머스크", "머스크", "스타링크"],
            "민간우주": ["블루오리진", "원웹", "뉴스페이스", "민간기업", "버진갤럭틱"],
            "발사체·로켓": ["누리호", "로켓", "발사체", "엔진", "재사용", "발사", "팰컨"],
            "위성·통신": ["위성", "통신", "관측", "저궤도", "초소형", "위성통신"],
            "우주탐사": ["달", "화성", "아르테미스", "탐사선", "우주정거장", "nasa", "항우연"],
            "UAM": ["uam", "도심항공교통", "에어택시", "버티포트", "플라잉카", "드론택시"]
        }
    },
    "전쟁": {
        "primary": ["전쟁", "교전", "공습", "침공", "미사일", "포격", "무력충돌"],
        "secondary": ["휴전", "종전", "확전", "군사작전", "난민", "사상자", "점령"],
        "negative": ["경제전쟁", "무역전쟁", "사이버전쟁", "마약과의 전쟁"],
        "entities": ["러시아", "우크라이나", "이스라엘", "하마스", "이란", "미국", "중국", "대만", "헤즈볼라", "가자지구"],
        "categories": {
            "중동분쟁": ["중동", "이스라엘", "하마스", "이란", "헤즈볼라", "가자", "후티", "아이언돔"],
            "러·우전쟁": ["러시아", "우크라이나", "푸틴", "젤렌스키", "쿠르스크", "파병"],
            "미중갈등": ["미국", "중국", "대만", "관세", "무역", "제재", "패권"],
            "재건·복구": ["재건", "복구", "인프라", "전후", "수혜주", "평화"],
            "원자재·공급망": ["유가", "원유", "곡물", "공급망", "운임", "해운", "물류", "홍해"]
        }
    },
}

WORD_RE = re.compile(r'[\w가-힣\-]+')

def normalize_title(title: str) -> str:
    t = re.sub(r'^\[(속보|단독|종합|인터뷰|현장|오피셜)\]\s*', '', title, flags=re.IGNORECASE)
    t = re.sub(r'\((종합|상보|속보|사진|영상)\)$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\[[^\]]+\]\s*$', '', t)
    t = re.sub(r'【[^】]+】', '', t)
    t = re.sub(r'[“”"\'`]', '', t)
    t = re.sub(r'[|·]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip().lower()
    return t

def normalize_url(url: str) -> str:
    if not url:
        return ""
    try:
        parsed = urlparse(url)
        parsed = parsed._replace(fragment="")
        
        qs = parse_qs(parsed.query)
        blocked_params = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"]
        for param in blocked_params:
            qs.pop(param, None)
            
        new_query = urlencode(qs, doseq=True)
        parsed = parsed._replace(query=new_query)
        
        normalized = urlunparse(parsed)
        if normalized.endswith('/'):
            normalized = normalized[:-1]
        return normalized
    except Exception:
        return url.strip()

def token_set(text: str) -> set:
    matches = WORD_RE.findall(normalize_title(text))
    return set(m for m in matches if m)

def jaccard_similarity(a: str, b: str) -> float:
    a_set = token_set(a)
    b_set = token_set(b)
    
    if not a_set and not b_set: return 1.0
    if not a_set or not b_set: return 0.0
        
    intersection = len(a_set.intersection(b_set))
    union = len(a_set) + len(b_set) - intersection
    
    return 0.0 if union == 0 else intersection / union

def infer_category(title: str, description: str, theme: str) -> str:
    title_l = title.lower()
    desc_l = description.lower()
    categories = THEME_SCORING_PROFILES[theme]["categories"]
    
    best_category = "기타"
    best_score = 0
    
    for category, keywords in categories.items():
        score = 0
        for keyword in keywords:
            needle = keyword.lower()
            if needle in title_l: score += 3
            if needle in desc_l: score += 1
        if score > best_score:
            best_score = score
            best_category = category
            
    return best_category

def compute_relevance_score(theme: str, title: str, description: str, published_at: str, category: str = None) -> float:
    profile = THEME_SCORING_PROFILES[theme]
    title_l = title.lower()
    desc_l = description.lower()
    
    scores = {"title": 0, "desc": 0, "entity": 0, "category": 0, "noise": 0, "recency": 0}
    
    for k in profile["primary"]:
        n = k.lower()
        if n in title_l: scores["title"] += 6
        if n in desc_l: scores["desc"] += 2.5
        
    for k in profile["secondary"]:
        n = k.lower()
        if n in title_l: scores["title"] += 3
        if n in desc_l: scores["desc"] += 1.2
        
    for k in profile["entities"]:
        n = k.lower()
        if n in title_l: scores["entity"] += 2.5
        if n in desc_l: scores["entity"] += 1
        
    for k in profile["negative"]:
        n = k.lower()
        if n in title_l: scores["noise"] += 5
        if n in desc_l: scores["noise"] += 2
        
    if category:
        for k in profile["categories"].get(category, []):
            n = k.lower()
            if n in title_l: scores["category"] += 2.5
            if n in desc_l: scores["category"] += 1.0
            
    title_tokens = WORD_RE.findall(title_l)
    if title_tokens:
        keyword_set = set(k.lower() for k in profile["primary"] + profile["secondary"] + profile["entities"])
        unique_matches = sum(1 for t in set(title_tokens) if t in keyword_set)
        scores["title"] += min(unique_matches * 0.8, 4)
        
    try:
        time_str = published_at.strip()
        if len(time_str) == 16: time_str += ":00"
        pub_date = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=KST)
        diff_minutes = max((datetime.now(KST) - pub_date).total_seconds() / 60, 0)
        scores["recency"] = max(5 - diff_minutes / 120, 0)
    except Exception:
        pass
        
    final_score = scores["title"] + scores["desc"] + scores["entity"] + scores["category"] + scores["recency"] - scores["noise"]
    return round(final_score, 2)

def dedupe_news_items(items: list) -> list:
    deduped = []
    seen_urls, seen_titles = set(), set()
    
    for item in items:
        raw_url = item.get("originallink") or item.get("link") or item.get("url") or ""
        url_key = normalize_url(raw_url)
        title_key = normalize_title(item["title"])
        
        if (url_key and url_key in seen_urls) or (title_key and title_key in seen_titles):
            continue
            
        if any(jaccard_similarity(ext["title"], item["title"]) >= 0.85 for ext in deduped):
            continue
            
        if url_key: seen_urls.add(url_key)
        if title_key: seen_titles.add(title_key)
        
        item_copy = dict(item)
        item_copy["url"] = url_key or raw_url
        deduped.append(item_copy)
        
    return deduped