import { useState, useCallback } from "react";
import { getSmartRecommendation } from "./utils/recommend";
import PRESET_COURSES from "./data/presetCourses.json";

const REGIONS = [
  { id: "gangwon", name: "강원도", emoji: "⛰️", color: "#2d6a4f" },
  { id: "gyeonggi", name: "경기도", emoji: "🌆", color: "#1d3557" },
  { id: "chungcheong", name: "충청도", emoji: "🌾", color: "#6d4c41" },
  { id: "gyeongsang", name: "경상도", emoji: "🌊", color: "#0077b6" },
  { id: "jeolla", name: "전라도", emoji: "🌸", color: "#7b2d8b" },
  { id: "jeju", name: "제주도", emoji: "🌺", color: "#e63946" },
];

const PREFERENCES = [
  { id: "scenic", label: "경치 위주", icon: "🏔️" },
  { id: "winding", label: "와인딩 코스", icon: "🔄" },
  { id: "short", label: "당일치기", icon: "⏱️" },
  { id: "long", label: "1박 이상", icon: "🏕️" },
  { id: "landmark", label: "명소 경유", icon: "📍" },
  { id: "coastal", label: "해안도로", icon: "🌊" },
];

const difficultyColor = { "초급": "#2d6a4f", "중급": "#e67e22", "고급": "#e63946" };

// 계절+지역 기반 날씨 시뮬레이션
function getSimulatedWeather(regionId) {
  const month = new Date().getMonth() + 1;
  const getSeason = (m) => {
    if (m >= 3 && m <= 5) return "spring";
    if (m >= 6 && m <= 8) return "summer";
    if (m >= 9 && m <= 11) return "fall";
    return "winter";
  };
  const season = getSeason(month);

  const data = {
    gangwon: {
      spring: { icon: "🌤️", temp: "12~18°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 최적" },
      summer: { icon: "⛈️", temp: "24~30°C", desc: "소나기 주의", wind: "2~4m/s", rideOk: false, advice: "산간 돌발 강우 주의" },
      fall:   { icon: "🍂", temp: "10~18°C", desc: "맑음", wind: "4~6m/s", rideOk: true, advice: "단풍 라이딩 최적" },
      winter: { icon: "❄️", temp: "-5~5°C", desc: "눈/결빙", wind: "5~8m/s", rideOk: false, advice: "결빙 위험" },
    },
    gyeonggi: {
      spring: { icon: "🌸", temp: "14~20°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 적합" },
      summer: { icon: "🌧️", temp: "26~33°C", desc: "장마철", wind: "2~4m/s", rideOk: false, advice: "장마철 주의" },
      fall:   { icon: "☀️", temp: "12~20°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 최적" },
      winter: { icon: "🌨️", temp: "-3~5°C", desc: "흐림/눈", wind: "4~7m/s", rideOk: false, advice: "방한 필수" },
    },
    chungcheong: {
      spring: { icon: "🌼", temp: "13~19°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 적합" },
      summer: { icon: "🌧️", temp: "25~32°C", desc: "장마", wind: "2~4m/s", rideOk: false, advice: "장마 주의" },
      fall:   { icon: "🍁", temp: "11~19°C", desc: "맑음", wind: "3~6m/s", rideOk: true, advice: "라이딩 최적" },
      winter: { icon: "❄️", temp: "-4~4°C", desc: "흐림/눈", wind: "4~7m/s", rideOk: false, advice: "결빙 주의" },
    },
    gyeongsang: {
      spring: { icon: "🌺", temp: "15~21°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 최적" },
      summer: { icon: "☀️", temp: "27~34°C", desc: "맑음/폭염", wind: "2~3m/s", rideOk: true, advice: "수분 보충 필수" },
      fall:   { icon: "🍂", temp: "13~21°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 최적" },
      winter: { icon: "🌬️", temp: "0~8°C", desc: "쌀쌀/바람", wind: "4~7m/s", rideOk: false, advice: "방한 필수" },
    },
    jeolla: {
      spring: { icon: "🌸", temp: "14~20°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 최적" },
      summer: { icon: "🌧️", temp: "26~32°C", desc: "장마", wind: "2~4m/s", rideOk: false, advice: "장마 주의" },
      fall:   { icon: "☀️", temp: "12~20°C", desc: "맑음", wind: "3~5m/s", rideOk: true, advice: "라이딩 최적" },
      winter: { icon: "🌨️", temp: "1~8°C", desc: "흐림", wind: "4~6m/s", rideOk: false, advice: "방한 필수" },
    },
    jeju: {
      spring: { icon: "🌺", temp: "15~20°C", desc: "맑음", wind: "4~7m/s", rideOk: true, advice: "라이딩 최적" },
      summer: { icon: "🌊", temp: "27~32°C", desc: "태풍 주의", wind: "5~10m/s", rideOk: false, advice: "태풍 시즌 주의" },
      fall:   { icon: "🌤️", temp: "16~22°C", desc: "맑음", wind: "4~6m/s", rideOk: true, advice: "라이딩 최적" },
      winter: { icon: "🌬️", temp: "5~12°C", desc: "흐림/바람", wind: "6~10m/s", rideOk: false, advice: "강풍 주의" },
    },
  };

  return { ...(data[regionId] || data.gyeonggi)[season], season };
}

// 지도 링크 생성
function makeKakaoLink(start, waypoints, end) {
  return `https://map.kakao.com/link/from/${encodeURIComponent(start + " 한국")},0,0/to/${encodeURIComponent(end + " 한국")},0,0`;
}
function makeNaverLink(start, end) {
  return `https://map.naver.com/v5/directions/-/-/${encodeURIComponent(start)}/-/${encodeURIComponent(end)}/transit`;
}
function makeGoogleLink(start, waypoints, end) {
  const origin = encodeURIComponent(start + " 한국");
  const dest = encodeURIComponent(end + " 한국");
  const wps = (waypoints || []).slice(0, 2);
  const wpStr = wps.length ? `&waypoints=${wps.map(w => encodeURIComponent(w + " 한국")).join("|")}` : "";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${wpStr}&travelmode=driving`;
}

function WeatherCard({ regionId }) {
  const w = getSimulatedWeather(regionId);
  return (
    <div style={{
      background: w.rideOk ? "rgba(45,106,79,0.15)" : "rgba(230,57,70,0.1)",
      border: `1px solid ${w.rideOk ? "rgba(45,106,79,0.45)" : "rgba(230,57,70,0.35)"}`,
      borderRadius: 14, padding: "14px 16px", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{ fontSize: 38 }}>{w.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#999", marginBottom: 3 }}>🌡️ 현재 지역 날씨 (계절 기반)</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{w.temp}</div>
        <div style={{ fontSize: 12, color: "#aaa" }}>{w.desc} · 💨 {w.wind}</div>
      </div>
      <div style={{
        textAlign: "center", minWidth: 72,
        background: w.rideOk ? "rgba(46,213,115,0.12)" : "rgba(230,57,70,0.12)",
        border: `1px solid ${w.rideOk ? "#2ed573" : "#e63946"}`,
        borderRadius: 10, padding: "8px 6px",
      }}>
        <div style={{ fontSize: 18, marginBottom: 2 }}>{w.rideOk ? "✅" : "⛔"}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: w.rideOk ? "#2ed573" : "#e63946" }}>
          {w.rideOk ? "라이딩\n가능" : "주의\n필요"}
        </div>
        <div style={{ fontSize: 9, color: "#aaa", marginTop: 3 }}>{w.advice}</div>
      </div>
    </div>
  );
}

function MapLinks({ start, waypoints, end }) {
  if (!start || !end) return null;
  const maps = [
    { label: "카카오맵", emoji: "🟡", color: "#f9e000", bg: "rgba(249,224,0,0.08)", border: "rgba(249,224,0,0.3)", url: makeKakaoLink(start, waypoints, end) },
    { label: "네이버맵", emoji: "🟢", color: "#03c75a", bg: "rgba(3,199,90,0.08)", border: "rgba(3,199,90,0.3)", url: makeNaverLink(start, end) },
    { label: "구글맵", emoji: "🔵", color: "#4285f4", bg: "rgba(66,133,244,0.08)", border: "rgba(66,133,244,0.3)", url: makeGoogleLink(start, waypoints, end) },
  ];
  return (
    <div>
      <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>🗺️ 지도 앱으로 열기</div>
      <div style={{ display: "flex", gap: 8 }}>
        {maps.map(m => (
          <a key={m.label} href={m.url} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "10px 4px", background: m.bg, border: `1px solid ${m.border}`,
            borderRadius: 12, color: m.color, textDecoration: "none", fontSize: 12, fontWeight: 700,
          }}>
            <span style={{ fontSize: 20 }}>{m.emoji}</span>
            {m.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function MotoApp() {
  const [step, setStep] = useState("home");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedPrefs, setSelectedPrefs] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeTab, setActiveTab] = useState("ai");
  const [error, setError] = useState("");

  const togglePref = (id) =>
    setSelectedPrefs(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  // 외부 API 호출 없이 등록된 코스 데이터를 선호도/입력 텍스트로 점수화하는 로컬 추천 엔진을 사용합니다.
  const handleAIRecommend = useCallback(async () => {
    setLoading(true); setError(""); setAiResult(null);
    try {
      // "AI가 분석 중" UX를 유지하기 위한 짧은 지연 (실제 네트워크 호출은 없음)
      await new Promise(resolve => setTimeout(resolve, 650));
      const result = getSmartRecommendation(selectedRegion, selectedPrefs, userInput);
      if (!result) throw new Error("no-course-found");
      setAiResult(result);
      setStep("result");
    } catch (e) {
      setError("추천 코스를 찾지 못했습니다. 다른 조건으로 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedPrefs, userInput]);

  const region = REGIONS.find(r => r.id === selectedRegion);
  const presetCourses = PRESET_COURSES[selectedRegion] || [];

  const S = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)", fontFamily: "'Noto Sans KR', sans-serif", color: "#f0f0f0", overflowX: "hidden" },
    header: { background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 },
    backBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
    wrap: { maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px" },
    card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, marginBottom: 12 },
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        {step !== "home" && (
          <button style={S.backBtn} onClick={() => {
            if (step === "result") setStep("prefs");
            else if (step === "prefs") setStep("region");
            else setStep("home");
          }}>←</button>
        )}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px" }}>🏍️ MotoRoute KR</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>전국 바이크 코스 · 날씨 · 지도 연동</div>
        </div>
      </div>

      <div style={S.wrap}>

        {/* ── HOME ── */}
        {step === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "40px 0 28px" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🏍️</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(90deg,#ff6b35,#f7c59f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>전국 바이크 코스</h1>
              <p style={{ color: "#888", marginTop: 8, fontSize: 14 }}>AI 추천 · 날씨 확인 · 지도 연동</p>
            </div>

            <button onClick={() => setStep("region")} style={{ width: "100%", background: "linear-gradient(135deg,#ff6b35,#c0392b)", border: "none", color: "#fff", padding: "18px", borderRadius: 16, fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.3px", boxShadow: "0 8px 32px rgba(255,107,53,0.3)", marginBottom: 12 }}>
              🤖 AI 맞춤 코스 추천받기
            </button>

            <div style={{ ...S.card, marginBottom: 0 }}>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>📋 지역별 날씨 확인 후 빠른 선택</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {REGIONS.map(r => {
                  const w = getSimulatedWeather(r.id);
                  return (
                    <button key={r.id} onClick={() => { setSelectedRegion(r.id); setStep("prefs"); }} style={{
                      background: `${r.color}22`, border: `1px solid ${r.color}44`, color: "#f0f0f0",
                      padding: "12px 10px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{r.emoji} {r.name}</span>
                        <span style={{ fontSize: 18 }}>{w.icon}</span>
                      </div>
                      <div style={{ fontSize: 10, marginTop: 5, fontWeight: 700, color: w.rideOk ? "#2ed573" : "#e87c7c" }}>
                        {w.rideOk ? "✅ 라이딩 가능" : "⛔ 주의 필요"}
                      </div>
                      <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{w.temp} · {w.wind}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 14, background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 12, fontSize: 12, color: "#aaa", lineHeight: 1.8 }}>
              💡 <strong style={{ color: "#ff6b35" }}>BMW K1600GTL</strong> 같은 대배기량 투어러 기준 고속 쾌속 코스도 추천 가능합니다.
            </div>
          </div>
        )}

        {/* ── REGION ── */}
        {step === "region" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "16px 0 6px" }}>어느 지역으로 가실 건가요?</h2>
            <p style={{ color: "#777", fontSize: 13, marginBottom: 20 }}>현재 날씨와 라이딩 가능 여부를 확인하세요</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {REGIONS.map(r => {
                const w = getSimulatedWeather(r.id);
                return (
                  <button key={r.id} onClick={() => { setSelectedRegion(r.id); setStep("prefs"); }} style={{
                    background: `${r.color}18`, border: `1px solid ${r.color}55`,
                    color: "#f0f0f0", padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 26 }}>{r.emoji}</span>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{w.temp} · {w.desc} · 💨 {w.wind}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{w.icon}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        background: w.rideOk ? "rgba(46,213,115,0.15)" : "rgba(230,57,70,0.15)",
                        color: w.rideOk ? "#2ed573" : "#e63946",
                        border: `1px solid ${w.rideOk ? "#2ed573" : "#e63946"}`,
                      }}>{w.rideOk ? "✅ 가능" : "⛔ 주의"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PREFS ── */}
        {step === "prefs" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "16px 0 14px" }}>{region?.emoji} {region?.name}</h2>

            {selectedRegion && <WeatherCard regionId={selectedRegion} />}

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["ai", "preset"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flex: 1, padding: "10px", borderRadius: 10, border: "none",
                  background: activeTab === t ? "#ff6b35" : "rgba(255,255,255,0.08)",
                  color: activeTab === t ? "#fff" : "#aaa", fontWeight: 600, cursor: "pointer", fontSize: 14,
                }}>{t === "ai" ? "🤖 AI 추천" : "📋 기본 코스"}</button>
              ))}
            </div>

            {activeTab === "ai" && (
              <div>
                <div style={{ fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 10 }}>선호 스타일 선택 (복수 가능)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {PREFERENCES.map(p => (
                    <button key={p.id} onClick={() => togglePref(p.id)} style={{
                      padding: "12px 8px", borderRadius: 12,
                      border: selectedPrefs.includes(p.id) ? "2px solid #ff6b35" : "1px solid rgba(255,255,255,0.12)",
                      background: selectedPrefs.includes(p.id) ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.05)",
                      color: selectedPrefs.includes(p.id) ? "#ff6b35" : "#ccc",
                      cursor: "pointer", fontWeight: selectedPrefs.includes(p.id) ? 700 : 400,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 13,
                    }}>
                      <span style={{ fontSize: 22 }}>{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
                <textarea value={userInput} onChange={e => setUserInput(e.target.value)}
                  placeholder="추가 요청사항&#10;예: BMW K1600GTL 고속 크루징 위주, 점심 식당 포함..."
                  style={{ width: "100%", height: 80, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#f0f0f0", padding: 14, fontSize: 13, resize: "none", boxSizing: "border-box", marginBottom: 14, outline: "none" }}
                />
                {error && <div style={{ color: "#e63946", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "rgba(230,57,70,0.1)", borderRadius: 8 }}>{error}</div>}
                <button onClick={handleAIRecommend} disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "rgba(255,107,53,0.3)" : "linear-gradient(135deg,#ff6b35,#c0392b)", border: "none", color: "#fff", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: loading ? "default" : "pointer", boxShadow: loading ? "none" : "0 6px 24px rgba(255,107,53,0.25)" }}>
                  {loading ? "🔄 AI가 코스를 분석 중..." : "🤖 AI 맞춤 코스 추천받기"}
                </button>
              </div>
            )}

            {activeTab === "preset" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {presetCourses.map((course, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{course.name}</div>
                      <span style={{ background: `${difficultyColor[course.difficulty]}33`, color: difficultyColor[course.difficulty], fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600, border: `1px solid ${difficultyColor[course.difficulty]}55` }}>{course.difficulty}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>📏 {course.distance} &nbsp;|&nbsp; ⏱️ {course.time} &nbsp;|&nbsp; 🛣️ {course.type}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {course.highlights.map((h, j) => (
                        <span key={j} style={{ background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)", color: "#ff8c65", fontSize: 11, padding: "3px 9px", borderRadius: 20 }}>📍 {h}</span>
                      ))}
                    </div>
                    <MapLinks start={course.start} waypoints={course.waypoints} end={course.end} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && aiResult && (
          <div>
            <div style={{ background: `linear-gradient(135deg,${region?.color || "#ff6b35"}33,rgba(255,107,53,0.1))`, border: `1px solid ${region?.color || "#ff6b35"}44`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#ff8c65", fontWeight: 600, marginBottom: 6 }}>🤖 AI 추천 코스</div>
              <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>{aiResult.title}</h2>
              {aiResult.note && (
                <div style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>{aiResult.note}</div>
              )}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#ccc" }}>📏 {aiResult.distance}</span>
                <span style={{ fontSize: 13, color: "#ccc" }}>⏱️ {aiResult.time}</span>
                <span style={{ background: `${difficultyColor[aiResult.difficulty] || "#888"}33`, color: difficultyColor[aiResult.difficulty] || "#888", fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 700, border: `1px solid ${difficultyColor[aiResult.difficulty] || "#888"}44` }}>{aiResult.difficulty}</span>
              </div>
            </div>

            {selectedRegion && <WeatherCard regionId={selectedRegion} />}

            <div style={S.card}>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 12 }}>🗺️ 코스 경로</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ background: "rgba(255,107,53,0.2)", color: "#ff6b35", padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>🚦 {aiResult.startPoint}</span>
                {aiResult.waypoints?.map((wp, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#555" }}>→</span>
                    <span style={{ background: "rgba(255,255,255,0.07)", padding: "5px 12px", borderRadius: 20, fontSize: 13 }}>📍 {wp}</span>
                  </span>
                ))}
                <span style={{ color: "#555" }}>→</span>
                <span style={{ background: "rgba(46,213,115,0.15)", color: "#2ed573", padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>🏁 {aiResult.endPoint}</span>
              </div>
              <MapLinks start={aiResult.startPoint} waypoints={aiResult.waypoints} end={aiResult.endPoint} />
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 10 }}>✨ 주요 볼거리</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {aiResult.highlights?.map((h, i) => (
                  <span key={i} style={{ background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)", color: "#ff8c65", fontSize: 12, padding: "5px 12px", borderRadius: 20 }}>🌟 {h}</span>
                ))}
              </div>
            </div>

            {[
              { label: "🛣️ 도로 특성", value: aiResult.roadType },
              { label: "🌤️ 최적 시즌", value: aiResult.bestSeason },
              { label: "⚠️ 주의사항", value: aiResult.caution, warn: true },
              { label: "💡 라이더 팁", value: aiResult.tip },
            ].map((item, i) => item.value && (
              <div key={i} style={{ background: item.warn ? "rgba(230,57,70,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${item.warn ? "rgba(230,57,70,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: item.warn ? "#e87c7c" : "#888", fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.6 }}>{item.value}</div>
              </div>
            ))}

            <button onClick={() => { setAiResult(null); setSelectedPrefs([]); setUserInput(""); setStep("prefs"); }} style={{ width: "100%", marginTop: 8, padding: "14px", background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.3)", color: "#ff8c65", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              🔄 다른 코스 추천받기
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "22px 16px",
        textAlign: "center",
        background: "rgba(0,0,0,0.35)",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#ff6b35", letterSpacing: "-0.5px", marginBottom: 6 }}>
          🏍️ MotoRoute KR
        </div>
        <div style={{ fontSize: 13, color: "#ccc", marginBottom: 10 }}>
          만든이 &nbsp;<strong style={{ color: "#fff", fontSize: 14 }}>폭풍간지 이상준</strong>&nbsp; · 무료 배포
        </div>
        <div style={{
          display: "inline-block",
          background: "rgba(230,57,70,0.12)",
          border: "1px solid rgba(230,57,70,0.35)",
          color: "#e87c7c",
          fontSize: 12,
          fontWeight: 700,
          padding: "6px 16px",
          borderRadius: 20,
          letterSpacing: "0.5px",
        }}>
          🚫 상업적 이용 금지
        </div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 14 }}>
          © 2025 이상준. All rights reserved. Non-commercial use only.
        </div>
      </div>

    </div>
  );
}
