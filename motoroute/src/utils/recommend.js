// 외부 API 없이 등록된 코스 데이터를 선호도/입력 텍스트로 점수화해 추천하는 로컬 추천 엔진
import PRESET_COURSES from "../data/presetCourses.json";

function timeToHours(timeStr) {
  if (!timeStr) return 0;
  const nums = timeStr.match(/[\d.]+/g);
  if (!nums) return 0;
  return nums.reduce((a, b) => a + parseFloat(b), 0) / nums.length; // "3-4시간" → 평균
}

function distanceToKm(distStr) {
  if (!distStr) return 0;
  const m = distStr.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function getSeason(date = new Date()) {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "fall";
  return "winter";
}

const SEASON_NOTE = {
  spring: "봄(3~5월) 라이딩에 좋은 시기입니다.",
  summer: "여름철은 소나기·장마·폭염에 대비가 필요한 시기입니다.",
  fall: "가을(9~11월) 단풍 라이딩에 좋은 시기입니다.",
  winter: "겨울철은 결빙·강풍에 주의가 필요한 시기입니다.",
};

const CAUTION_BY_DIFFICULTY = {
  "초급": "전반적으로 완만한 구간이 많지만, 출발 전 지도 앱으로 최신 노면·통제 상황을 확인하세요.",
  "중급": "와인딩 구간이 포함되어 있어 코너 진입 속도와 노면(낙엽·모래·살얼음) 상태에 주의하세요.",
  "고급": "급커브와 고저차가 큰 구간이 있을 수 있어 충분한 휴식과 타이어·브레이크 점검 후 출발하세요.",
};

function scoreCourse(course, prefIds, userInput) {
  let score = 0;
  const type = course.type || "";
  const highlightText = (course.highlights || []).join(" ");
  const has = (kw) => type.includes(kw) || highlightText.includes(kw) || course.name.includes(kw);

  if (prefIds.includes("scenic") && has("경치")) score += 2;
  if (prefIds.includes("winding") && has("와인딩")) score += 2;
  if (prefIds.includes("coastal") && has("해안")) score += 2;
  if (prefIds.includes("landmark")) score += Math.min((course.highlights || []).length, 3) * 0.5;
  if (prefIds.includes("short") && timeToHours(course.time) <= 2.5) score += 1.5;
  if (prefIds.includes("long") && distanceToKm(course.distance) >= 150) score += 1.5;

  if (userInput && userInput.trim()) {
    const lower = userInput.toLowerCase();
    const hay = `${course.name} ${course.start} ${course.end} ${highlightText}`.toLowerCase();
    const words = lower.split(/[\s,.\n]+/).filter((w) => w.length >= 2);
    words.forEach((w) => { if (hay.includes(w)) score += 1; });
    if (/와인딩|코너|굽이/.test(lower) && has("와인딩")) score += 1;
    if (/바다|해안|파도/.test(lower) && has("해안")) score += 1;
    if (/경치|뷰|풍경/.test(lower) && has("경치")) score += 1;
  }
  return score;
}

function buildTip(course, prefIds, userInput) {
  const tips = [];
  if (prefIds.includes("winding")) tips.push("와인딩 구간에서는 무리한 추월보다 안전거리 확보가 우선입니다.");
  if (prefIds.includes("coastal")) tips.push("해안도로는 강풍이 잦으니 측풍에 대비하세요.");
  if (prefIds.includes("long")) tips.push("장거리 구간이라 1~2시간 단위로 휴식을 끼워주는 것이 좋습니다.");
  if (userInput && /k1600|투어러|대배기량/i.test(userInput)) tips.push("대배기량 투어러는 저속 구간에서 클러치 발열에 유의하세요.");
  if (tips.length === 0) tips.push("출발 전 타이어 공기압과 체인 상태를 점검하세요.");
  return tips.join(" ");
}

export function getSmartRecommendation(regionId, prefIds = [], userInput = "") {
  const courses = PRESET_COURSES[regionId] || [];
  if (courses.length === 0) return null;

  const scored = courses.map((course) => ({ course, score: scoreCourse(course, prefIds, userInput) }));
  const maxScore = Math.max(...scored.map((s) => s.score));
  const top = scored.filter((s) => s.score === maxScore);
  const picked = top[Math.floor(Math.random() * top.length)].course;
  const season = getSeason();

  return {
    title: picked.name,
    distance: picked.distance,
    time: picked.time,
    difficulty: picked.difficulty,
    startPoint: picked.start,
    endPoint: picked.end,
    waypoints: picked.waypoints || [],
    highlights: picked.highlights || [],
    roadType: picked.type,
    bestSeason: SEASON_NOTE[season] || SEASON_NOTE.spring,
    caution: CAUTION_BY_DIFFICULTY[picked.difficulty] || CAUTION_BY_DIFFICULTY["초급"],
    tip: buildTip(picked, prefIds, userInput),
    source: "engine",
    note: "등록된 코스 데이터에서 선호도에 맞춰 자동으로 추천된 코스입니다.",
  };
}

export default getSmartRecommendation;
