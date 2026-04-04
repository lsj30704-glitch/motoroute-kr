export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { region, preferences, userInput } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `당신은 한국 오토바이 라이딩 전문가입니다. 다음 조건에 맞는 오토바이 코스를 추천해주세요.\n\n지역: ${region}\n선호 스타일: ${preferences || "제한 없음"}\n추가 요청: ${userInput || "없음"}\n\n다음 JSON 형식으로만 응답하세요 (마크다운 없이):\n{"title":"코스 이름","distance":"총 거리","time":"예상 소요시간","startPoint":"출발지","endPoint":"도착지","waypoints":["경유지1","경유지2"],"highlights":["볼거리1","볼거리2","볼거리3"],"roadType":"도로 특성","bestSeason":"최적 시즌","caution":"주의사항","tip":"라이더 팁","difficulty":"초급 또는 중급 또는 고급"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "AI 추천 실패: " + e.message });
  }
}
