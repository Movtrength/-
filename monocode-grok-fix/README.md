# MonoCode: Grok Build did not start. Invalid params

스크린샷의 오류는 MonoCode 버그입니다. Grok CLI가 거절한 자리를 MonoCode가 그대로 보냅니다.

## 원인

1. 프로젝트 폴더를 열지 않으면 MonoCode cwd가 `~`입니다. 브랜치 칸은 **No repo**.
2. Grok ACP `session/new`는 **절대 경로** cwd만 받습니다. `~`는 절대 경로가 아니라 JSON-RPC `-32602 Invalid params`가 납니다.
3. MonoCode는 그 메시지를 `Grok Build did not start. Invalid params`로 감쌉니다.
4. 모델 칸의 **Grok Build** (`grok-build`)는 제품 이름입니다. 살아있는 모델 id는 `grok-4.6` / `grok-4.5`입니다.

## 지금 바로

1. MonoCode에서 이 저장소 폴더를 연다. `~/` 홈이 아니어야 합니다.
2. 모델은 **Grok 4.6**을 고른다. 제품명 Grok Build를 고르지 않는다.
3. `grok login`이 되어 있는지 확인한다.

홈(`~`)에서 보내면 1초 만에 같은 오류가 납니다. 폴더를 연 뒤에는 **No repo**가 사라져야 합니다. 이 저장소는 git이라 브랜치 이름이 보입니다.

## 이 폴더

- `resolveGrokSession.js` — cwd 확장, `grok-build` → 실제 모델 id, Invalid params 재시도
- `resolveGrokSession.test.js` — 그 규칙의 테스트
- `upstream/` — MonoCode `v0.1.53`에 맞춘 수정 파일
- `apply-to-monocode.patch` — `hardbeat920/monocode` 체크아웃에 적용

```bash
node --test monocode-grok-fix/resolveGrokSession.test.js
```

소스에서 MonoCode를 고치려면:

```bash
cd /path/to/monocode
git apply /path/to/this-repo/monocode-grok-fix/apply-to-monocode.patch
npm test -- src/integrations/harness/providers/grok src/integrations/harness/core/jsonRpc.test.ts
```
