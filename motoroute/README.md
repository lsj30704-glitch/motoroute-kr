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

- 🤖 AI 맞춤 코스 추천 (Claude API)
- 🌤️ 지역별 날씨 및 라이딩 가능 여부
- 🗺️ 카카오맵 / 네이버맵 / 구글맵 연동
- 📋 전국 6개 지역 기본 코스 내장
- 📱 모바일 PWA 지원
