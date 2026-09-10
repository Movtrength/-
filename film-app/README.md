# 필름감성 — Film Lab

iPhone 사진 앱의 필름 레시피를 브라우저에서 바로 적용하는 Canvas 기반 웹앱입니다. 서버 없이 로컬에서 실행하며, 업로드한 사진은 기기 안에서만 처리됩니다.

## 실행 방법

```bash
cd film-app
python3 -m http.server 8765
```

브라우저에서 [http://localhost:8765](http://localhost:8765) 를 엽니다.

> **참고:** `file://` 로 직접 열면 ES 모듈 로딩이 차단될 수 있으므로 반드시 로컬 HTTP 서버를 사용하세요.

## 개인정보

사진은 브라우저 Canvas에서만 처리되며, 네트워크로 전송되거나 서버에 저장되지 않습니다.

## 새 프리셋 추가

스크린샷이나 iPhone 사진 앱에서 확인한 필름 레시피 값을 `presets.js`의 `PRESETS` 배열에 객체로 추가합니다.

```js
{
  id: "my-recipe",           // 고유 ID (영문, kebab-case 권장)
  name: "내 레시피",          // UI에 표시되는 이름
  sourceNote: "출처 메모",   // 선택 — 스크린샷 출처 등
  filter: { type: "dramatic", amount: 38 },
  adjustments: {
    brilliance: 20,
    highlights: 33,
    shadows: 20,
    contrast: -20,
    brightness: -6,
    blackPoint: -20,
    warmth: 9,
    definition: 14,
    noiseReduction: 47,
  },
},
```

### 필드 설명

| 필드 | 설명 |
|------|------|
| `filter.type` | 현재 `"dramatic"` 만 지원 |
| `filter.amount` | 드라마틱 필터 강도 (0–100) |
| `adjustments.*` | iPhone 편집 슬라이더 값과 동일한 범위 (−100 ~ +100) |

기존 `"film-sensibility"` 항목을 참고해 같은 형태로 붙여 넣으면 `#presetSelect` 드롭다운에 자동으로 나타납니다.

## 파일 구조

| 파일 | 역할 |
|------|------|
| `index.html` | 마크업 |
| `styles.css` | 다크룸 비주얼, 비교 UI |
| `app.js` | 업로드 · 프리셋 전환 · 다운로드 |
| `engine.js` | Canvas 필름 보정 파이프라인 |
| `presets.js` | 데이터 기반 프리셋 정의 |

## 수동 테스트

`engine.test.html` — 엔진 단위 테스트 (브라우저에서 열기)
