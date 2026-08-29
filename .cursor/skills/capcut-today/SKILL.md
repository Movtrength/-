---
name: capcut-today
description: Use when the user mentions CapCut, 캡컷, Grok 스킬, today's video, 영상 업무, 컷시트, 숏폼 편집, 컷 1.5초, 장면 6–8, or a 10–12 second coaching clip.
icon: video
color: orange
---

# 캡컷 · 오늘 영상

Cursor Grok turns **오늘 변수 하나** into a CapCut cut sheet. Lock lives in `지금.md`. Do not edit `index.html`. Do not upload.

## Locked numbers

| 칸 | 값 |
|---|---|
| 업무 | 10분 |
| 컷 | 1.5초 |
| 장면 | 6–8. **그 변수의 반복** |
| 길이 | 10초 내외, 최대 12초 |
| 글 | 영상당 한마디. 목적 · 철학 |
| 말 | Exit 한 줄. **글과 다른 칸** |

합계 = 장면 수 × 1.5. 8장면 = 12초. 9장면은 버린다.

## Missing input

오늘 변수가 없으면 `확인 필요`. Do not invent a second variable. Do not average Sport / Fitness / Rehab into one clip.

Category arrow (화면의 주인, 변수를 바꾸지 않음):

- Rehab → 허용
- Sport → 목표 과제
- Fitness → 프로필 또는 과제. 한쪽으로 고정하지 않음

## Output shape

Always this order. No extra sections.

1. **변수** — 하나. 모르면 `확인 필요`
2. **컷 표** — `#` · `1.5s` · 무엇이 보이는가 (그 변수만)
3. **합계** — `N × 1.5 = Xs` (X ≤ 12)
4. **캡컷 손** — 아래 7칸만
5. **한마디 글** — 화면 텍스트
6. **말** — Exit. 모를 때 비움. 글과 같은 문장 금지
7. **문** — K4 · K5 · K6 · K7 · K9

## 캡컷 손 (10분)

1. 새 프로젝트. 비율 **9:16**
2. 그 변수 클립만 넣는다
3. 각 클립을 **1.5초**로 자른다. 자동 절단을 쓰면 길이를 다시 1.5로 맞춘다
4. 전환 · 효과를 쌓지 않는다
5. 텍스트 한 줄 = **글**. Exit를 자막으로 넣지 않는다
6. 미리보기. 12초면 클립을 뺀다
7. **내보내기**까지. 공유 · 업로드는 오늘 칸이 아니다

Worked sheet: [references/example.md](references/example.md)

기계 검사: `python .cursor/skills/capcut-today/scripts/check_cut_sheet.py <sheet.json>`

## 아닌 것

| 변명 | 사실 |
|---|---|
| 장면 더 넣으면 낫다 | 6–8. 추가 장면 = 두 번째 변수 |
| 비트에 맞추면 컷이 길어진다 | 컷은 1.5. 음악이 컷을 따른다 |
| Exit를 화면에 쓴다 | 화면 = 글. 말 = Exit |
| 오늘 올리면 커리어다 | 오늘 끝은 영상 · 만족. 누적 칸으로 닫지 않는다 |
| 시계 / 시즌을 오늘 클립에 넣는다 | 쓰지 않는다 |

**Red flags:** 두 변수, 13초, 컷 ≠ 1.5, 말=글, 업로드 CTA, `index.html` 수정.
