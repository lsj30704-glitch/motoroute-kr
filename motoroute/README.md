# 🏍️ MotoRoute KR

> 전국 바이크 코스 추천 앱 — AI + 날씨 + 지도 연동

**만든이: 폭풍간지 이상준**
🚫 상업적 이용 금지 | © 2025 이상준. All rights reserved.

---

## ✅ Vercel 무료 배포 방법 (5분)

### 1단계 — GitHub에 올리기
1. https://github.com 가입 (무료)
2. 우측 상단 **"+"** → **New repository**
3. Repository name: `motoroute-kr` 입력 후 **Create repository**
4. 압축 풀고 해당 폴더 전체를 업로드

### 2단계 — Vercel 연결
1. https://vercel.com 가입 (무료, GitHub 계정으로 로그인)
2. **"Add New Project"** 클릭
3. GitHub에서 `motoroute-kr` 선택
4. Framework: **Create React App** 자동 감지됨
5. **"Deploy"** 클릭 → 2분 후 완료!

### 3단계 — URL 공유
- 배포 완료 후 `https://motoroute-kr.vercel.app` 형태의 URL 생성
- 이 URL을 카카오톡, 유튜브, 커뮤니티에 공유하면 됩니다

---

## 📱 폰에 앱으로 설치하기

배포된 URL에서:
- **아이폰**: Safari → 공유 → "홈 화면에 추가"
- **안드로이드**: Chrome → 메뉴 → "앱 설치" 또는 "홈 화면에 추가"

---

## 🛠️ 로컬 실행 (개발용)

```bash
npm install
npm start
```

---

## 기능

- 🤖 맞춤 코스 추천 (외부 API 없이 동작하는 로컬 추천 엔진)
- 🌤️ 지역별 날씨 및 라이딩 가능 여부
- 🗺️ 카카오맵 / 네이버맵 / 구글맵 연동
- 📋 전국 6개 지역 기본 코스 내장
- 📱 모바일 PWA 지원

## 🤖 AI 추천 엔진 동작 방식

이전 버전은 `/api/recommend`를 통해 외부 AI API(Claude) 호출을 시도했지만, 해당 백엔드 함수가 저장소에 없어 실제로는 동작하지 않았습니다.
지금은 별도 API 키나 서버 없이, `src/data/presetCourses.json`에 등록된 코스 데이터를 사용자가 고른 선호도(경치/와인딩/해안/명소/당일치기/1박 이상)와 자유 입력 텍스트로 점수화해 가장 적합한 코스를 즉시 추천합니다.

- 관련 코드: `src/utils/recommend.js` (`getSmartRecommendation`)
- 데이터: `src/data/presetCourses.json`
- 장점: 비용 0원, 네트워크 호출 없음, 오프라인에서도 동작
- 코스를 추가/수정하려면 `presetCourses.json`에 지역별 배열 항목을 추가하면 됩니다.
