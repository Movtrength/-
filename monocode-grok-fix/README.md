# MonoCode 두 가지 실패

## 1. Grok Build did not start. Invalid params

프로젝트 없이 보내면 cwd가 `~`입니다. Grok ACP `session/new`는 절대 경로만 받습니다. 브랜치 칸은 **No repo**.

지금: 이 저장소 폴더를 연다. 모델은 **Grok 4.6**. `grok login`.

## 2. Couldn't install the update. Read-only file system (os error 30)

DMG나 Downloads에서 바로 연 앱은 macOS가 읽기 전용 위치(디스크 이미지 / App Translocation)에서 돌립니다. 업데이터가 그 파일을 덮어쓰지 못합니다.

지금:

1. MonoCode를 종료한다
2. `MonoCode.app`을 **응용 프로그램**으로 드래그한다
3. 디스크 이미지가 남아 있으면 추출한다
4. 응용 프로그램에서 다시 연다
5. 그래도 같으면 터미널에서 `xattr -cr /Applications/MonoCode.app` 후 다시 연다

## 이 폴더

- `resolveGrokSession.js` / `updateInstall.js` — 두 오류의 판정
- `upstream/` — MonoCode `v0.1.53`에 맞춘 수정 파일
- `apply-to-monocode.patch` — Grok `session/new` 수정
- `apply-update-readonly.patch` — 업데이터 읽기 전용 안내

```bash
node --test monocode-grok-fix/resolveGrokSession.test.js monocode-grok-fix/updateInstall.test.js
```
