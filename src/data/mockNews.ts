import { NewsItem, Theme } from "@/types/news";

export const themeSummaries: Record<Theme, string> = {
  반도체:
    "오늘 반도체 테마는 정책 지원과 AI 수요 확대 이슈가 중심입니다.",
  AI: "오늘 AI 테마는 투자 확대와 규제 논의가 함께 부각되고 있습니다.",
  방산: "오늘 방산 테마는 수출 기대와 국방 예산 이슈가 핵심입니다.",
};

export const mockArticles: NewsItem[] = [
  {
    id: 1,
    theme: "반도체",
    title: "정부, 반도체 산업 지원책 검토",
    source: "연합뉴스",
    publishedAt: "2026-03-12 09:30",
    category: "정치",
    summary:
      "정부가 반도체 산업 경쟁력 강화를 위한 지원 정책을 검토하고 있다는 내용입니다.",
    url: "https://example.com/1",
  },
  {
    id: 2,
    theme: "반도체",
    title: "AI 서버 수요 확대에 HBM 기대감",
    source: "한국경제",
    publishedAt: "2026-03-12 11:10",
    category: "경제",
    summary:
      "AI 인프라 확대와 함께 고대역폭 메모리 수요 증가 가능성이 주목받고 있습니다.",
    url: "https://example.com/2",
  },
  {
    id: 3,
    theme: "반도체",
    title: "첨단 공정 인력 확보 경쟁 심화",
    source: "매일경제",
    publishedAt: "2026-03-12 13:20",
    category: "사회",
    summary:
      "반도체 업계 전반에서 고급 인재 확보 경쟁이 이어지고 있다는 보도입니다.",
    url: "https://example.com/3",
  },

  {
    id: 4,
    theme: "AI",
    title: "생성형 AI 투자 확대에 관련 시장 주목",
    source: "서울경제",
    publishedAt: "2026-03-12 09:15",
    category: "경제",
    summary:
      "기업들의 생성형 AI 투자 확대가 이어지면서 관련 인프라와 서비스 시장이 주목받고 있습니다.",
    url: "https://example.com/4",
  },
  {
    id: 5,
    theme: "AI",
    title: "정부, AI 규제 체계 논의 본격화",
    source: "조선비즈",
    publishedAt: "2026-03-12 10:40",
    category: "정치",
    summary:
      "정부와 관계 기관이 인공지능 관련 규제와 산업 진흥의 균형점을 찾기 위한 논의를 이어가고 있습니다.",
    url: "https://example.com/5",
  },
  {
    id: 6,
    theme: "AI",
    title: "대학가, AI 인재 양성 프로그램 확대",
    source: "한겨레",
    publishedAt: "2026-03-12 14:00",
    category: "사회",
    summary:
      "AI 인력 수요 증가에 대응하기 위해 대학과 교육기관이 관련 교육 프로그램을 넓히고 있습니다.",
    url: "https://example.com/6",
  },

  {
    id: 7,
    theme: "방산",
    title: "K-방산 수출 기대감에 업계 관심 집중",
    source: "아시아경제",
    publishedAt: "2026-03-12 08:50",
    category: "경제",
    summary:
      "국내 방산 기업들의 해외 수출 확대 가능성이 부각되며 업계 전반의 관심이 커지고 있습니다.",
    url: "https://example.com/7",
  },
  {
    id: 8,
    theme: "방산",
    title: "국방 예산 확대 논의에 방산업계 촉각",
    source: "연합뉴스",
    publishedAt: "2026-03-12 10:05",
    category: "정치",
    summary:
      "국방 예산 편성 방향과 관련된 논의가 이어지면서 방산 기업들의 수혜 가능성이 거론되고 있습니다.",
    url: "https://example.com/8",
  },
  {
    id: 9,
    theme: "방산",
    title: "방산 현장 인력 확보와 지역 일자리 효과 주목",
    source: "한국일보",
    publishedAt: "2026-03-12 15:10",
    category: "사회",
    summary:
      "방위산업 생산기지 확대가 지역 일자리와 산업 생태계에 미치는 영향이 주목받고 있습니다.",
    url: "https://example.com/9",
  },
];