import {
  Category,
  NewsCategory,
  NewsItem,
  Theme,
  ThemeNewsResponse,
} from "@/types/news";

export const KST_TIME_ZONE = "Asia/Seoul";

export const CACHE_TTL_SECONDS = Number(
  process.env.NEWS_CACHE_TTL_SECONDS ?? "600"
);

// 테마당 최종 후보 최대치
export const MAX_CANDIDATES = Number(
  process.env.NEWS_MAX_CANDIDATES ?? "1000"
);

// 네이버 검색 API 제약: display 최대 100, start 최대 1000
export const NAVER_PAGE_SIZE = 100;
export const NAVER_MAX_START = 1000;

// 오늘 기사 수집 중, "이 페이지에 오늘 기사가 하나도 없으면 종료"
export const STOP_ON_EMPTY_TODAY_PAGE = true;

// 추가 안전장치: 연속으로 오래된 기사 페이지가 몇 번 나오면 종료
export const MAX_OLDER_PAGE_STREAK = 1;

export type ThemeCollectionProfile = {
  label: Theme;
  queries: string[];
};

export type ThemeScoringProfile = {
  primary: string[];
  secondary: string[];
  negative: string[];
  entities: string[];
  categories: Record<string, string[]>;
};

export const THEME_CATEGORIES: Record<Theme, string[]> = {
  반도체: ["삼성전자", "SK하이닉스", "메모리·HBM", "파운드리", "팹리스·설계", "장비", "패키징·테스트", "기타"],
  AI: ["OpenAI", "구글", "앤스로픽", "메타", "LLM·모델", "AI반도체", "온디바이스", "AI서비스", "데이터센터", "기타"],
  방산: ["한화에어로스페이스", "수주·수출", "지상무기", "항공·해상", "무인기·첨단", "정책·예산", "기타"],
  원전: ["두산에너빌리티", "해외수주", "SMR", "설비·부품", "해체·폐기물", "정책·규제", "기타"],
  배터리: ["테슬라", "LG에너지솔루션", "배터리셀", "핵심소재", "차세대", "광물·공급망", "폐배터리", "기타"],
  건설: ["현대건설", "해외·플랜트", "정비사업", "PF·자금", "스마트건설", "자재·인프라", "기타"],
  부동산: ["시황·동향", "청약·분양", "대출·금리", "개발·호재", "상업·수익형", "기타"],
  우주항공: ["스페이스X", "민간우주", "발사체·로켓", "위성·통신", "우주탐사", "UAM", "기타"],
  전쟁: ["중동분쟁", "러·우전쟁", "미중갈등", "재건·복구", "원자재·공급망", "기타"],
};

export const THEME_COLLECTION_PROFILES: Record<
  Theme,
  ThemeCollectionProfile
> = {
  반도체: {
    label: "반도체",
    queries: [
      "반도체",
      "HBM DRAM 낸드 파운드리",
      "삼성전자 SK하이닉스 TSMC Micron 반도체",
      "반도체 정책 반도체 규제 반도체 지원",
    ],
  },
  AI: {
    label: "AI",
    queries: [
      "인공지능",
      "생성형 AI LLM 멀티모달",
      "챗GPT 오픈AI GPU NPU AI 반도체",
      "AI 정책 AI 규제 AI 데이터센터",
    ],
  },
  방산: {
    label: "방산",
    queries: [
      "방산",
      "방위산업",
      "K방산",
      "무기 수출",
      "방산 수주",
      "FA-50",
      "K9 자주포",
      "천궁",
    ],
  },
  원전: {
    label: "원전",
    queries: [
      "원전",
      "원전 수출",
      "원전 수주",
      "SMR",
      "소형모듈원전",
      "한국수력원자력",
      "원자력 체코",
    ],
  },
  배터리: {
    label: "배터리",
    queries: [
      "이차전지",
      "배터리",
      "전고체",
      "LFP",
      "LG에너지솔루션",
      "삼성SDI",
      "SK온",
      "배터리 캐즘",
    ],
  },
  건설: {
    label: "건설",
    queries: [
      "건설사",
      "건설사 수주",
      "부동산PF",
      "재건축",
      "재개발",
      "해외건설",
      "분양",
    ],
  },
  부동산: {
    label: "부동산",
    queries: [
      "부동산",
      "아파트값",
      "집값",
      "전세 매매",
      "부동산 청약",
      "아파트 분양",
      "부동산 정책",
      "대출규제",
    ],
  },
  우주항공: {
    label: "우주항공",
    queries: [
      "우주항공",
      "누리호",
      "스페이스X",
      "인공위성",
      "달 탐사",
      "우주 발사체",
    ],
  },
  전쟁: {
    label: "전쟁",
    queries: [
      "전쟁",
      "러시아 우크라이나",
      "이스라엘 하마스",
      "중동 분쟁",
      "무력 충돌",
      "이란 미국",
    ],
  }
};

export const THEME_SCORING_PROFILES: Record<Theme, ThemeScoringProfile> = {
  반도체: {
    primary: [
      "반도체",
      "hbm",
      "메모리",
      "dram",
      "낸드",
      "파운드리",
      "웨이퍼",
      "패키징",
      "ai 반도체",
    ],
    secondary: [
      "칩",
      "후공정",
      "전공정",
      "수율",
      "증설",
      "fab",
      "고대역폭메모리",
    ],
    negative: ["피부", "치과", "화장품", "반도체등"],
    entities: ["삼성전자", "sk하이닉스", "tsmc", "micron", "인텔", "amd", "엔비디아"],
    categories: {
      "삼성전자": ["삼성전자", "삼성", "samsung", "삼전", "전영현", "이재용"],
      "SK하이닉스": ["sk하이닉스", "하이닉스", "skhynix", "최태원", "곽노정"],
      "메모리·HBM": ["hbm", "메모리", "dram", "디램", "낸드", "nand", "고대역폭"],
      "파운드리": ["파운드리", "tsmc", "위탁생산", "선단공정", "나노", "가우테"],
      "팹리스·설계": ["팹리스", "arm", "설계", "디자인하우스", "비메모리", "시스템 반도체", "시스템반도체"],
      "장비": ["장비", "euv", "asml", "노광", "식각", "세정", "테스터", "어플라이드", "램리서치"],
      "패키징·테스트": ["패키징", "후공정", "osat", "칩렛", "2.5d", "3d", "테스트", "한미반도체"]
    }
  },
  AI: {
    primary: [
      "인공지능",
      "ai",
      "생성형 ai",
      "llm",
      "멀티모달",
      "추론",
      "학습",
      "모델",
      "챗gpt",
      "오픈ai",
    ],
    secondary: [
      "에이전트",
      "파인튜닝",
      "온디바이스 ai",
      "데이터센터",
      "gpu",
      "npu",
      "클라우드",
    ],
    negative: ["a.i", "아이"],
    entities: ["오픈ai", "google", "구글", "meta", "메타", "microsoft", "ms", "엔비디아"],
    categories: {
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
  방산: {
    primary: [
      "방산",
      "국방",
      "방위산업",
      "무기",
      "무기수출",
      "전투기",
      "미사일",
      "잠수함",
      "군수",
    ],
    secondary: [
      "k9",
      "fa-50",
      "천궁",
      "l-sam",
      "함정",
      "장갑차",
      "탄약",
      "전력화",
    ],
    negative: ["부동산", "방산시장"],
    entities: [
      "한화에어로스페이스",
      "현대로템",
      "한국항공우주",
      "lig넥스원",
      "방위사업청",
    ],
    categories: {
      "한화에어로스페이스": ["한화에어로", "한화에어로스페이스", "김동관"],
      "수주·수출": ["수주", "수출", "계약", "moa", "mou", "폴란드", "루마니아", "잭팟"],
      "지상무기": ["k9", "전차", "자주포", "장갑차", "k2", "현대로템", "레드백"],
      "항공·해상": ["전투기", "fa-50", "kf-21", "헬기", "잠수함", "함정", "한국항공우주", "kai"],
      "무인기·첨단": ["무인기", "드론", "대드론", "레이저", "우주", "사이버", "lig넥스원"],
      "정책·예산": ["방위사업청", "방사청", "국방부", "예산", "국방비", "정부", "안보"]
    }
  },
  원전: {
    primary: ["원전", "원자력", "smr", "체코", "원자로", "소형모듈원전"],
    secondary: ["수출", "수주", "원안위", "생태계", "발전소", "우라늄"],
    negative: ["원전사고", "오염수", "방사능 누출"],
    entities: ["한국수력원자력", "한수원", "두산에너빌리티", "한국전력", "한전기술"],
    categories: {
      "두산에너빌리티": ["두산에너빌리티", "두산", "주기기"],
      "해외수주": ["체코", "폴란드", "수주", "수출", "팀코리아", "우원식", "웨스팅하우스"],
      "SMR": ["smr", "소형모듈원전", "테라파워", "뉴스케일", "빌게이츠", "혁신형"],
      "설비·부품": ["설비", "부품", "터빈", "원자로", "펌프", "우진", "비에이치아이", "한전기술"],
      "해체·폐기물": ["해체", "폐기물", "방폐장", "건식저장", "오염"],
      "정책·규제": ["원안위", "생태계", "지원", "정부", "원자력안전위원회", "친환경", "택소노미", "탈원전"]
    }
  },
  배터리: {
    primary: ["배터리", "이차전지", "2차전지", "전고체", "lfp", "리튬", "양극재", "음극재"],
    secondary: ["전기차", "캐즘", "수율", "공급망", "ess", "셀", "광물"],
    negative: ["배터리 방전", "휴대폰 배터리", "폭행", "폭발"],
    entities: ["lg에너지솔루션", "삼성sdi", "sk온", "에코프로", "포스코퓨처엠", "엘지에너지솔루션"],
    categories: {
      "테슬라": ["테슬라", "tesla", "일론 머스크", "머스크", "모델"],
      "LG에너지솔루션": ["lg에너지솔루션", "lges", "엘지에너지솔루션", "권영수", "김동명"],
      "배터리셀": ["삼성sdi", "sk온", "배터리셀", "완성차", "oem", "파우치", "원통형"],
      "핵심소재": ["양극재", "음극재", "분리막", "전해액", "에코프로", "포스코퓨처엠", "엘앤에프"],
      "차세대": ["전고체", "4680", "리튬황", "차세대", "실리콘 음극재", "꿈의 배터리"],
      "광물·공급망": ["리튬", "니켈", "광물", "공급망", "ira", "인플레이션감축법", "흑연"],
      "폐배터리": ["폐배터리", "재활용", "리사이클링", "성일하이텍", "새빗켐"]
    }
  },
  건설: {
    primary: ["건설", "건설사", "수주", "재건축", "재개발", "pf", "부동산pf", "분양"],
    secondary: ["착공", "시공", "미분양", "해외건설", "정비사업", "청약"],
    negative: ["건설기계", "불법하도급", "부실시공", "철근 누락"],
    entities: ["현대건설", "gs건설", "대우건설", "삼성물산", "dl이앤씨", "hdc현대산업개발"],
    categories: {
      "현대건설": ["현대건설", "디에이치", "힐스테이트", "윤영준"],
      "해외·플랜트": ["해외", "플랜트", "중동", "네옴시티", "수주"],
      "정비사업": ["재건축", "재개발", "도시정비", "시공사", "조합", "리모델링", "가로주택"],
      "PF·자금": ["pf", "프로젝트파이낸싱", "유동성", "워크아웃", "태영", "자금조달", "부도", "브릿지론"],
      "스마트건설": ["스마트건설", "모듈러", "bim", "건설로봇", "드론", "프롭테크"],
      "자재·인프라": ["시멘트", "철근", "레미콘", "인프라", "토목", "원자재"]
    }
  },
  부동산: {
    primary: ["부동산", "아파트", "집값", "전세", "월세", "청약", "분양", "매매", "주택"],
    secondary: ["대출", "금리", "규제지역", "디딤돌", "보금자리론", "ltv", "dsr", "임대차", "전세사기"],
    negative: ["기획부동산", "사기꾼", "살인", "폭행", "사건"],
    entities: ["국토교통부", "한국부동산원", "주택도시보증공사", "hug", "국토부"],
    categories: {
      "시황·동향": ["아파트값", "전세가", "실거래가", "매매가", "하락", "상승", "보합", "한국부동산원", "거래량"],
      "청약·분양": ["청약", "분양", "경쟁률", "특별공급", "모델하우스", "당첨", "줍줍", "무순위"],
      "대출·금리": ["대출", "금리", "dsr", "주담대", "디딤돌", "보금자리", "한국은행", "가계부채"],
      "개발·호재": ["gtx", "신도시", "재건축", "선도지구", "철도", "지하화", "교통", "재개발"],
      "상업·수익형": ["상가", "오피스", "꼬마빌딩", "수익형", "리츠", "reits", "지식산업센터"]
    }
  },
  우주항공: {
    primary: ["우주", "항공", "위성", "발사체", "누리호", "스페이스x", "달탐사", "우주선"],
    secondary: ["궤도", "로켓", "탐사선", "우주정거장", "인공위성"],
    negative: ["항공권", "여행", "공항"],
    entities: ["한화에어로스페이스", "한국항공우주", "kai", "스페이스x", "nasa", "항우연", "우주항공청"],
    categories: {
      "스페이스X": ["스페이스x", "spacex", "스타십", "일론 머스크", "머스크", "스타링크"],
      "민간우주": ["블루오리진", "원웹", "뉴스페이스", "민간기업", "버진갤럭틱"],
      "발사체·로켓": ["누리호", "로켓", "발사체", "엔진", "재사용", "발사", "팰컨"],
      "위성·통신": ["위성", "통신", "관측", "저궤도", "초소형", "위성통신"],
      "우주탐사": ["달", "화성", "아르테미스", "탐사선", "우주정거장", "nasa", "항우연"],
      "UAM": ["uam", "도심항공교통", "에어택시", "버티포트", "플라잉카", "드론택시"]
    }
  },
  전쟁: {
    primary: ["전쟁", "교전", "공습", "침공", "미사일", "포격", "무력충돌"],
    secondary: ["휴전", "종전", "확전", "군사작전", "난민", "사상자", "점령"],
    negative: ["경제전쟁", "무역전쟁", "사이버전쟁", "마약과의 전쟁"],
    entities: ["러시아", "우크라이나", "이스라엘", "하마스", "이란", "미국", "중국", "대만", "헤즈볼라", "가자지구"],
    categories: {
      "중동분쟁": ["중동", "이스라엘", "하마스", "이란", "헤즈볼라", "가자", "후티", "아이언돔"],
      "러·우전쟁": ["러시아", "우크라이나", "푸틴", "젤렌스키", "쿠르스크", "파병"],
      "미중갈등": ["미국", "중국", "대만", "관세", "무역", "제재", "패권"],
      "재건·복구": ["재건", "복구", "인프라", "전후", "수혜주", "평화"],
      "원자재·공급망": ["유가", "원유", "곡물", "공급망", "운임", "해운", "물류", "홍해"]
    }
  },
};

const WORD_RE = /[\w가-힣\-]+/g;

function getKstDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function nowKstIsoString() {
  const now = new Date();
  const parts = getKstDateParts(now);

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
}

export function nowKstDateString() {
  const now = new Date();
  const parts = getKstDateParts(now);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateToKst(date: Date) {
  const parts = getKstDateParts(date);

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

export function isTodayKst(publishedAt: string) {
  return publishedAt.slice(0, 10) === nowKstDateString();
}

export function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeTitle(title: string) {
  return normalizeWhitespace(
    title
      .replace(/^\[(속보|단독|종합|인터뷰|현장|오피셜)\]\s*/gi, "")
      .replace(/\((종합|상보|속보|사진|영상)\)$/gi, "")
      .replace(/\[[^\]]+\]\s*$/g, "")
      .replace(/【[^】]+】/g, "")
      .replace(/[“”"'`]/g, "")
      .replace(/[|·]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

export function normalizeUrl(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    parsed.hash = "";

    const blockedParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ];

    for (const key of blockedParams) {
      parsed.searchParams.delete(key);
    }

    const normalized = parsed.toString().replace(/\/$/, "");
    return normalized;
  } catch {
    return url.trim();
  }
}

function tokenSet(text: string) {
  return new Set((normalizeTitle(text).match(WORD_RE) ?? []).filter(Boolean));
}

function jaccardSimilarity(a: string, b: string) {
  const aSet = tokenSet(a);
  const bSet = tokenSet(b);

  if (aSet.size === 0 && bSet.size === 0) return 1;
  if (aSet.size === 0 || bSet.size === 0) return 0;

  let intersection = 0;

  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }

  const union = aSet.size + bSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function inferCategory(
  title: string,
  description: string,
  theme: Theme
): NewsCategory {
  const titleL = title.toLowerCase();
  const descL = description.toLowerCase();
  const categories = THEME_SCORING_PROFILES[theme].categories;

  let bestCategory = "기타"; // 매칭되는 키워드가 없을 경우 기본값 설정
  let bestScore = 0; // 최소 1점 이상 매칭되어야 해당 카테고리로 분류되도록 0으로 시작

  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    for (const keyword of keywords) {
      const needle = keyword.toLowerCase();
      if (titleL.includes(needle)) score += 3;
      if (descL.includes(needle)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory as NewsCategory;
}

export function computeRelevanceScore(
  theme: Theme,
  title: string,
  description: string,
  publishedAt: string,
  category?: NewsCategory
) {
  const profile = THEME_SCORING_PROFILES[theme];
  const titleL = title.toLowerCase();
  const descL = description.toLowerCase();

  let titleMatchScore = 0;
  let descriptionMatchScore = 0;
  let entityScore = 0;
  let categoryFitScore = 0;
  let noisePenalty = 0;
  let recencyScore = 0;

  for (const keyword of profile.primary) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) titleMatchScore += 6;
    if (descL.includes(normalized)) descriptionMatchScore += 2.5;
  }

  for (const keyword of profile.secondary) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) titleMatchScore += 3;
    if (descL.includes(normalized)) descriptionMatchScore += 1.2;
  }

  for (const keyword of profile.entities) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) entityScore += 2.5;
    if (descL.includes(normalized)) entityScore += 1;
  }

  for (const keyword of profile.negative) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) noisePenalty += 5;
    if (descL.includes(normalized)) noisePenalty += 2;
  }

  if (category) {
    const hints = profile.categories[category as string] ?? [];
    for (const keyword of hints) {
      const normalized = keyword.toLowerCase();
      if (titleL.includes(normalized)) categoryFitScore += 2.5;
      if (descL.includes(normalized)) categoryFitScore += 1.0;
    }
  }

  const titleTokens = titleL.match(WORD_RE) ?? [];
  if (titleTokens.length > 0) {
    const keywordSet = new Set(
      [...profile.primary, ...profile.secondary, ...profile.entities].map((k) =>
        k.toLowerCase()
      )
    );

    const uniqueMatches = [...new Set(titleTokens)].filter((token) =>
      keywordSet.has(token)
    ).length;

    titleMatchScore += Math.min(uniqueMatches * 0.8, 4);
  }

  const publishedDate = new Date(`${publishedAt.replace(" ", "T")}:00+09:00`);
  if (!Number.isNaN(publishedDate.getTime())) {
    const diffMinutes = Math.max(
      (Date.now() - publishedDate.getTime()) / 1000 / 60,
      0
    );
    recencyScore = Math.max(5 - diffMinutes / 120, 0);
  }

  const finalScore =
    titleMatchScore +
    descriptionMatchScore +
    entityScore +
    categoryFitScore +
    recencyScore -
    noisePenalty;

  return Number(finalScore.toFixed(2));
}

export function convertRelevanceScoreToPercent(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) return null;

  // 현재 점수 체계 기준 사용자용 정규화
  const center = 12;
  const scale = 4;

  const percent = 100 / (1 + Math.exp(-(score - center) / scale));
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function getRelevanceLabel(percent: number | null | undefined) {
  if (percent == null) return null;
  if (percent >= 85) return "매우 높음";
  if (percent >= 70) return "높음";
  if (percent >= 50) return "보통";
  if (percent >= 30) return "낮음";
  return "매우 낮음";
}

export function dedupeNewsItems<
  T extends {
    title: string;
    url: string;
    originallink?: string;
    link?: string;
  }
>(items: T[]) {
  const deduped: T[] = [];
  const seenUrls = new Set<string>();
  const seenTitleKeys = new Set<string>();

  for (const item of items) {
    const urlKey = normalizeUrl(item.originallink || item.link || item.url || "");
    const titleKey = normalizeTitle(item.title);

    if (urlKey && seenUrls.has(urlKey)) continue;
    if (titleKey && seenTitleKeys.has(titleKey)) continue;

    const nearDup = deduped.find((existing) => {
      const sim = jaccardSimilarity(existing.title, item.title);
      return sim >= 0.85;
    });

    if (nearDup) continue;

    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) seenTitleKeys.add(titleKey);

    deduped.push({
      ...item,
      url: urlKey || item.url,
    });
  }

  return deduped;
}

export type RawNaverNewsItem = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

export type ThemeCacheArticle = Omit<
  NewsItem,
  "id" | "relevanceScore" | "relevancePercent" | "relevanceLabel"
> & {
  relevance_score?: number | null;
  matched_query?: string | null;
};

export type ThemeCacheDocument = {
  theme: Theme;
  queries: string[];
  date: string;
  fetched_at: string;
  expires_at: string;
  candidate_count: number;
  article_count: number;
  summary: string;
  articles: ThemeCacheArticle[];
};

export function buildSummary(
  theme: Theme,
  articles: ThemeCacheDocument["articles"]
) {
  if (articles.length === 0) {
    return `오늘 ${theme} 테마 관련 오늘 날짜 기사를 찾지 못했습니다.`;
  }

  const topTitles = articles.slice(0, 3).map((article) => article.title);

  return `오늘 ${theme} 테마 기사 ${articles.length}건을 수집했고, 상위 이슈는 ${topTitles.join(
    "; "
  )} 입니다.`;
}

export function buildPagedResponse(params: {
  theme: Theme;
  category: Category;
  page: number;
  pageSize: number;
  cacheDoc: ThemeCacheDocument;
}): ThemeNewsResponse {
  const { theme, category, page, pageSize, cacheDoc } = params;

  let articles = cacheDoc.articles;
  if (category !== "전체") {
    articles = articles.filter((article) => article.category === category);
  }

  const totalArticles = articles.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pageArticles = articles.slice(startIndex, endIndex).map((article, index) => {
    const relevanceScore = article.relevance_score ?? null;
    const relevancePercent = convertRelevanceScoreToPercent(relevanceScore);
    const relevanceLabel = getRelevanceLabel(relevancePercent);

    return {
      ...article,
      id: startIndex + index + 1,
      relevanceScore,
      relevancePercent,
      relevanceLabel,
      publisher: article.publisher ?? null,
      matchedQuery: article.matched_query ?? null,
    };
  });

  return {
    theme,
    category,
    summary: cacheDoc.summary || buildSummary(theme, articles),
    articles: pageArticles,
    page,
    page_size: pageSize,
    has_more: endIndex < totalArticles,
    total_articles: totalArticles,
    generated_at: cacheDoc.fetched_at,
    expires_at: cacheDoc.expires_at,
    cache_hit: true,
  };
}