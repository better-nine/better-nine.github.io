
// 조사되지 않은 항목은 -1
// 전체목록 가나다순
const allergens = [
  "감자",
  "게",
  "계란 노른자",
  "계란흰자",
  "고구마",
  "고등어",
  "고양이 상피",
  "굵은 보리가루",
  "귀리가루",
  "귤 혼합물(레몬, 라임, 오렌지)",
  "글루텐",
  "긴털가루진드기",
  "깍지콩",
  "꿀",
  "농어",
  "닭고기",
  "대구",
  "돼지고기",
  "딸기",
  "땅콩",
  "라일락 분",
  "래디시(무)",
  "렌즈콩(렌틸콩)",
  "망고",
  "맥주 효모",
  "메밀가루",
  "메추라기고기",
  "멜론",
  "멸치",
  "밀가루",
  "바퀴벌레 혼합물",
  "배",
  "배추",
  "버터",
  "번데기",
  "벌침독",
  "베이킹파우더",
  "베타-락토글로불린",
  "복숭아",
  "브로콜리",
  "블루베리",
  "비트",
  "빵 효모",
  "사과",
  "삼나무",
  "새우",
  "생밤",
  "소고기",
  "송어",
  "수박",
  "수중다리 가루 진드기",
  "시금치",
  "쌀가루",
  "아마 씨",
  "알로에베라",
  "알터나리아 곰팡이",
  "양고기",
  "양상추",
  "연어",
  "염소고기",
  "오리고기",
  "오리새",
  "오이",
  "옥수수",
  "완두콩",
  "요거트",
  "우유",
  "유럽 집먼지진드기",
  "자두",
  "자작나무/오리나무 혼합물",
  "정어리",
  "조",
  "조개",
  "주키니호박",
  "집안먼지",
  "참치",
  "청어",
  "체다치즈",
  "치커리",
  "칠면조고기",
  "카제인",
  "케일",
  "콜리플라워",
  "콩(대두)",
  "큰다리먼지진드기",
  "키위(참다래)",
  "타조고기",
  "토끼고기",
  "토마토",
  "파슬리",
  "파인애플",
  "파프리카",
  "포플라 혼합물",
  "플라타너스 혼합물",
  "향기풀",
  "호밀 분",
  "홍합",
  "환삼덩굴",
]

const allergen_list = {
  "귤 혼합물(레몬, 라임, 오렌지)" : { "ige": 2.0, "non-ige": 0.6 },
  "딸기" : { "ige": 1.0, "non-ige": 0.8 },
  "망고" : { "ige":  1.1, "non-ige": 0.2 },
  "멜론" : { "ige": 0.3, "non-ige": 2.7 },
  "배" : { "ige": 0.2, "non-ige": 1.0 },
  "복숭아" : { "ige": 2.6, "non-ige": 6.0 },
  "블루베리" : { "ige": 0.2, "non-ige": 0.2 },
  "사과" : { "ige": 0.4, "non-ige": 2.2 },
  "수박" : { "ige": 0.6, "non-ige": 3.3 },
  "자두" : { "ige": 2.1, "non-ige": 1.2 },
  "키위(참다래)" : { "ige": 0.0, "non-ige": 0.4 },
  "파인애플" : { "ige": 0.8, "non-ige": 2.6 },
  "굵은 보리가루" : { "ige": 0.0, "non-ige": 0.2 },
  "귀리가루" : { "ige": 0.0, "non-ige": 1.6 },
  "깍지콩" : { "ige": 0.3, "non-ige": 2.6 },
  "땅콩" : { "ige": 1.4, "non-ige": 0.1 },
  "렌즈콩" : { "ige": 0.3, "non-ige": 5.0 },
  "밀가루" : { "ige": 0.0, "non-ige": 0.0 },
  "쌀가루" : { "ige": 0.0, "non-ige": 0.2 },
  "생밤" : { "ige": 2.6, "non-ige": 2.1 },
  "아마 씨(아마인)" : { "ige": 0.8, "non-ige": 3.3 },
  "옥수수" : { "ige": 0.6, "non-ige": 1.4 },
  "완두콩" : { "ige": 0.0, "non-ige": 2.9 },
  "조" : { "ige": 0.0, "non-ige": 2.5 },
  "콩(대두)" : { "ige": 0.4, "non-ige": 0.0 },
  "호밀 분" : { "ige": 2.0, "non-ige": -1 },
  "오이" : { "ige": 0.8, "non-ige": 0.4 },
  "토마토" : { "ige": 1.7, "non-ige": 1.3 },
  "감자" : { "ige": 0.2, "non-ige": 0.3 },
  "고구마" : { "ige": 0.2, "non-ige": 2.5 },
  "배추" : { "ige": 0.2, "non-ige": 1.0 },
  "치커리" : { "ige": 0.2, "non-ige": 2.6 },
  "케일" : { "ige": 0.0, "non-ige": 1.2 },
  "양상추" : { "ige": 0.2, "non-ige": 2.7 },
  "시금치" : { "ige": 0.4, "non-ige": 0.4 },
  "주키니호박" : { "ige": 0.2, "non-ige": 2.2 },
  "파프리카" : { "ige": 0.0, "non-ige": 2.6 },
  "파슬리" : { "ige": 0.2, "non-ige": 0.2 },
  "비트" : { "ige": 0.3, "non-ige": 0.8 },
  "래디시(무)" : { "ige": 0.2, "non-ige": 3.6 },
  "알로에베라" : { "ige": 0.6, "non-ige": 0.8 },
  "콜리플라워" : { "ige": 0.0, "non-ige": 2.4 },
  "브로콜리" : { "ige": 0.2, "non-ige": 2.5 },
  "게" : { "ige": 1.0, "non-ige": 0.6 },
  "고등어" : { "ige": 1.0, "non-ige": 0.0 },
  "농어" : { "ige": 0.0, "non-ige": 2.2 },
  "대구" : { "ige": 0.0, "non-ige": 0.2 },
  "멸치" : { "ige": 0.0, "non-ige": 0.1 },
  "새우" : { "ige": 0.1, "non-ige": 0.0 },
  "송어" : { "ige": 0.2, "non-ige": 0.3 },
  "연어" : { "ige": 0.0, "non-ige": 0.0 },
  "정어리" : { "ige": 0.3, "non-ige": 0.3 },
  "조개" : { "ige": 0.7, "non-ige": 0.0 },
  "참치" : { "ige": 0.0, "non-ige": 0.0 },
  "청어" : { "ige": 0.3, "non-ige": 0.6 },
  "홍합" : { "ige": 0.0, "non-ige": 0.1 },
  "계란노른자" : { "ige": 1.8, "non-ige": 3.0 },
  "계란흰자" : { "ige": 1.2, "non-ige": 0.0 },
  "닭고기" : { "ige": 0.5, "non-ige": 0.0 },
  "돼지고기" : { "ige": 0.0, "non-ige": 0.0 },
  "메추라기고기" : { "ige": 0.4, "non-ige": 2.1 },
  "소고기" : { "ige": 0.0, "non-ige": 0.0 },
  "양고기" : { "ige": 0.4, "non-ige": 3.9 },
  "염소고기" : { "ige": 0.2, "non-ige": 2.7 },
  "오리고기" : { "ige": 0.0, "non-ige": 0.2 },
  "칠면조고기" : { "ige": 0.3, "non-ige": 2.5 },
  "타조고기" : { "ige": 0.2, "non-ige": 0.8 },
  "토끼고기" : { "ige": 0.2, "non-ige": 2.5 },
  "버터" : { "ige": 0.0, "non-ige": 0.6 },
  "베타락토글로불린" : { "ige": 0.3, "non-ige": 2.3 },
  "요거트" : { "ige": 0.2, "non-ige": 4.7 },
  "우유" : { "ige": 0.0, "non-ige": 0.0 },
  "체다치즈" : { "ige": 0.0, "non-ige": 0.0 },
  "카제인" : { "ige": 0.2, "non-ige": 2.3 },
  "고양이 상피" : { "ige": 1.0, "non-ige": -1 },
  "글루텐" : { "ige": 0.3, "non-ige": 0.8 },
  "긴털가루 진드기" : { "ige": 2.6, "non-ige": -1 },
  "꿀" : { "ige": 0.0, "non-ige": 2.1 },
  "라일락 분" : { "ige": 1.2, "non-ige": -1 },
  "맥주효모" : { "ige": 0.3, "non-ige": 2.1 },
  "벌침 독" : { "ige": 3.5, "non-ige": -1 },
  "바퀴벌레 혼합물" : { "ige": 1.3, "non-ige": -1 },
  "빵효모" : { "ige": 0.2, "non-ige": 0.0 },
  "번데기" : { "ige": 0.0, "non-ige": 0.2 },
  "베이킹파우더" : { "ige": 0.0, "non-ige": 0.4 },
  "삼나무(일본)" : { "ige": 4.6, "non-ige": -1 },
  "수중다리 가루 진드기" : { "ige": 2.5, "non-ige": -1 },
  "알터나리아 곰팡이" : { "ige": 2.3, "non-ige": -1 },
  "오리새" : { "ige": 2.2, "non-ige": -1 },
  "유럽 집먼지진드기" : { "ige": 2.1, "non-ige": -1 },
  "집안먼지" : { "ige": 1.1, "non-ige": -1 },
  "자작나무/오리나무 혼합물" : { "ige": 1.4, "non-ige": -1 },
  "큰다리 먼지진드기" : { "ige": 2.1, "non-ige": -1 },
  "포플라 혼합물" : { "ige": 1.3, "non-ige": -1 },
  "플라타너스 혼합물" : { "ige": 2.3, "non-ige": -1 },
  "향기풀" : { "ige": 1.0, "non-ige": -1 },
  "환삼덩굴" : { "ige": 1.3, "non-ige": -1 },
}

// 과일 목록
const fruit_list = {
  "귤 혼합물(레몬, 라임, 오렌지)" : { "ige": 2.0, "non-ige": 0.6 },
  "딸기" : { "ige": 1.0, "non-ige": 0.8 },
  "망고" : { "ige":  1.1, "non-ige": 0.2 },
  "멜론" : { "ige": 0.3, "non-ige": 2.7 },
  "배" : { "ige": 0.2, "non-ige": 1.0 },
  "복숭아" : { "ige": 2.6, "non-ige": 6.0 },
  "블루베리" : { "ige": 0.2, "non-ige": 0.2 },
  "사과" : { "ige": 0.4, "non-ige": 2.2 },
  "수박" : { "ige": 0.6, "non-ige": 3.3 },
  "자두" : { "ige": 2.1, "non-ige": 1.2 },
  "키위(참다래)" : { "ige": 0.0, "non-ige": 0.4 },
  "파인애플" : { "ige": 0.8, "non-ige": 2.6 },
}

// 곡류/견과류 목록
const cereal_list = {
  "굵은 보리가루" : { "ige": 0.0, "non-ige": 0.2 },
  "귀리가루" : { "ige": 0.0, "non-ige": 1.6 },
  "깍지콩" : { "ige": 0.3, "non-ige": 2.6 },
  "땅콩" : { "ige": 1.4, "non-ige": 0.1 },
  "렌즈콩" : { "ige": 0.3, "non-ige": 5.0 },
  "밀가루" : { "ige": 0.0, "non-ige": 0.0 },
  "쌀가루" : { "ige": 0.0, "non-ige": 0.2 },
  "생밤" : { "ige": 2.6, "non-ige": 2.1 },
  "아마 씨(아마인)" : { "ige": 0.8, "non-ige": 3.3 },
  "옥수수" : { "ige": 0.6, "non-ige": 1.4 },
  "완두콩" : { "ige": 0.0, "non-ige": 2.9 },
  "조" : { "ige": 0.0, "non-ige": 2.5 },
  "콩(대두)" : { "ige": 0.4, "non-ige": 0.0 },
  "호밀 분" : { "ige": 2.0, "non-ige": -1 },
}

// 채소 목록
const vegetable_list = {
  "오이" : { "ige": 0.8, "non-ige": 0.4 },
  "토마토" : { "ige": 1.7, "non-ige": 1.3 },
  "감자" : { "ige": 0.2, "non-ige": 0.3 },
  "고구마" : { "ige": 0.2, "non-ige": 2.5 },
  "배추" : { "ige": 0.2, "non-ige": 1.0 },
  "치커리" : { "ige": 0.2, "non-ige": 2.6 },
  "케일" : { "ige": 0.0, "non-ige": 1.2 },
  "양상추" : { "ige": 0.2, "non-ige": 2.7 },
  "시금치" : { "ige": 0.4, "non-ige": 0.4 },
  "주키니호박" : { "ige": 0.2, "non-ige": 2.2 },
  "파프리카" : { "ige": 0.0, "non-ige": 2.6 },
  "파슬리" : { "ige": 0.2, "non-ige": 0.2 },
  "비트" : { "ige": 0.3, "non-ige": 0.8 },
  "래디시(무)" : { "ige": 0.2, "non-ige": 3.6 },
  "알로에베라" : { "ige": 0.6, "non-ige": 0.8 },
  "콜리플라워" : { "ige": 0.0, "non-ige": 2.4 },
  "브로콜리" : { "ige": 0.2, "non-ige": 2.5 },
}

// 수산물 목록
const aquatic_list = {
  "게" : { "ige": 1.0, "non-ige": 0.6 },
  "고등어" : { "ige": 1.0, "non-ige": 0.0 },
  "농어" : { "ige": 0.0, "non-ige": 2.2 },
  "대구" : { "ige": 0.0, "non-ige": 0.2 },
  "멸치" : { "ige": 0.0, "non-ige": 0.1 },
  "새우" : { "ige": 0.1, "non-ige": 0.0 },
  "송어" : { "ige": 0.2, "non-ige": 0.3 },
  "연어" : { "ige": 0.0, "non-ige": 0.0 },
  "정어리" : { "ige": 0.3, "non-ige": 0.3 },
  "조개" : { "ige": 0.7, "non-ige": 0.0 },
  "참치" : { "ige": 0.0, "non-ige": 0.0 },
  "청어" : { "ige": 0.3, "non-ige": 0.6 },
  "홍합" : { "ige": 0.0, "non-ige": 0.1 },
}

// 육류 목록
const meet_list = {
  "계란노른자" : { "ige": 1.8, "non-ige": 3.0 },
  "계란흰자" : { "ige": 1.2, "non-ige": 0.0 },
  "닭고기" : { "ige": 0.5, "non-ige": 0.0 },
  "돼지고기" : { "ige": 0.0, "non-ige": 0.0 },
  "메추라기고기" : { "ige": 0.4, "non-ige": 2.1 },
  "소고기" : { "ige": 0.0, "non-ige": 0.0 },
  "양고기" : { "ige": 0.4, "non-ige": 3.9 },
  "염소고기" : { "ige": 0.2, "non-ige": 2.7 },
  "오리고기" : { "ige": 0.0, "non-ige": 0.2 },
  "칠면조고기" : { "ige": 0.3, "non-ige": 2.5 },
  "타조고기" : { "ige": 0.2, "non-ige": 0.8 },
  "토끼고기" : { "ige": 0.2, "non-ige": 2.5 },
}

// 유제품 목록
const lactose_list = {
  "버터" : { "ige": 0.0, "non-ige": 0.6 },
  "베타락토글로불린" : { "ige": 0.3, "non-ige": 2.3 },
  "요거트" : { "ige": 0.2, "non-ige": 4.7 },
  "우유" : { "ige": 0.0, "non-ige": 0.0 },
  "체다치즈" : { "ige": 0.0, "non-ige": 0.0 },
  "카제인" : { "ige": 0.2, "non-ige": 2.3 },
}

// 기타 목록
const etc_list = {
  "고양이 상피" : { "ige": 1.0, "non-ige": -1 },
  "글루텐" : { "ige": 0.3, "non-ige": 0.8 },
  "긴털가루 진드기" : { "ige": 2.6, "non-ige": -1 },
  "꿀" : { "ige": 0.0, "non-ige": 2.1 },
  "라일락 분" : { "ige": 1.2, "non-ige": -1 },
  "맥주효모" : { "ige": 0.3, "non-ige": 2.1 },
  "벌침 독" : { "ige": 3.5, "non-ige": -1 },
  "바퀴벌레 혼합물" : { "ige": 1.3, "non-ige": -1 },
  "빵효모" : { "ige": 0.2, "non-ige": 0.0 },
  "번데기" : { "ige": 0.0, "non-ige": 0.2 },
  "베이킹파우더" : { "ige": 0.0, "non-ige": 0.4 },
  "삼나무(일본)" : { "ige": 4.6, "non-ige": -1 },
  "수중다리 가루 진드기" : { "ige": 2.5, "non-ige": -1 },
  "알터나리아 곰팡이" : { "ige": 2.3, "non-ige": -1 },
  "오리새" : { "ige": 2.2, "non-ige": -1 },
  "유럽 집먼지진드기" : { "ige": 2.1, "non-ige": -1 },
  "집안먼지" : { "ige": 1.1, "non-ige": -1 },
  "자작나무/오리나무 혼합물" : { "ige": 1.4, "non-ige": -1 },
  "큰다리 먼지진드기" : { "ige": 2.1, "non-ige": -1 },
  "포플라 혼합물" : { "ige": 1.3, "non-ige": -1 },
  "플라타너스 혼합물" : { "ige": 2.3, "non-ige": -1 },
  "향기풀" : { "ige": 1.0, "non-ige": -1 },
  "환삼덩굴" : { "ige": 1.3, "non-ige": -1 },
}
