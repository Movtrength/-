# JevHarness를 Cursor 플러그인으로 재구성

[TianyuCodings/JevHarness](https://github.com/TianyuCodings/JevHarness)의 Claude Code 플러그인을 분해한 뒤, Cursor가 읽는 구성요소로 다시 묶었습니다. Python 런타임(`auto_jev`)은 이 플러그인에 포함하지 않습니다. 에이전트는 작업 공간의 JevHarness 체크아웃에서 그 패키지를 import합니다.

## 원본 플러그인

Claude Code는 저장소 루트를 플러그인으로 보고, 실제 지시는 스킬 하나에 모여 있습니다.

| 원본 경로 | 하는 일 |
| --- | --- |
| `.claude-plugin/plugin.json` | 이름 `jev-harness`, 버전 `0.1.0` |
| `.claude-plugin/marketplace.json` | 마켓플레이스 이름 `jevharness`, 플러그인 소스 `./` |
| `skills/jev-harness/SKILL.md` | 계약 → 연동 위치 → 첫 파이프라인 → 선택적 진화 → 동결 |
| `skills/jev-harness/references/integration.md` | `auto_jev` API와 콜백 계약 |
| `skills/jev-harness/references/evaluation.md` | 학습/검증/홀드아웃, GEPA, 전체 궤적 |
| `skills/jev-harness/references/installation.md` | Codex·Claude Code 설치 |
| `skills/jev-harness/agents/openai.yaml` | Codex UI 메타데이터. 실행 에이전트가 아님 |
| `auto_jev/`, `examples/`, `website/` | 런타임과 예제. 스킬 번들이 아님 |

훅, MCP, 슬래시 커맨드 파일은 원본에 없습니다. 설치 문서도 호스트별 셸 주입을 일부러 넣지 않습니다.

## Cursor에서 나눈 이유

원본 `SKILL.md`는 한 파일 안에 다섯 단계가 들어 있습니다. Cursor는 스킬 설명으로 무엇을 읽을지 고르므로, 항상 필요한 진입점과 필요할 때만 읽는 단계를 분리했습니다. API 본문은 그대로 두어 시그니처를 다시 쓰지 않았습니다.

| Cursor 경로 | 원본에서 온 내용 |
| --- | --- |
| `skills/jev-harness/` | 작업 계약, 체크아웃 찾기, 단계 순서 |
| `skills/jev-pipeline/` | 첫 `PipelineSpec`, 어댑터, 샌드박스 |
| `skills/jev-evolution/` | 요청이 있을 때만 하는 GEPA 반사 |
| `skills/jev-freeze/` | 검증 점수로 동결한 뒤 홀드아웃 |
| `skills/jev-harness/references/integration.md` | 원본 연동 문서 유지 |
| `skills/jev-harness/references/evaluation.md` | 원본 평가 문서 유지 |
| `skills/jev-harness/references/installation.md` | Cursor 설치로 교체 |
| `rules/jev-candidate-boundary.mdc` | 후보 코드가 보상·권한을 못 바꾸게 하는 경계 |
| `rules/jev-provider-boundary.mdc` | 키, 전송 경로, 홀드아웃, 비용 한도 |
| `commands/jev-harness.md` | `/jev-harness` |
| `commands/jev-evolve.md` | `/jev-evolve` |
| `commands/jev-freeze.md` | `/jev-freeze` |
| `agents/jev-harness-author.md` | 계약부터 인도까지 맡는 작성 에이전트 |

규칙은 `alwaysApply: false`입니다. Jev 작업이 아닐 때 일반 코딩에 붙지 않게 하기 위해서입니다. 마켓플레이스 목록과 Codex용 `openai.yaml`은 Cursor 로더가 쓰지 않으므로 넣지 않았습니다.

## 설치

이 저장소에서:

```bash
plugins/jev-harness/scripts/install-cursor.sh
```

스크립트는 `~/.cursor/plugins/local/jev-harness`로 심볼릭 링크를 만듭니다. 이미 있으면 덮어쓰지 않습니다. 링크 후 새 Cursor 채팅을 엽니다.

## 사용

```text
/jev-harness 지원 티켓을 큐로 보내는 하네스를 만들어 줘.
결과, 입력, 예시, 평가 방법부터 확인하고
유료 추론이나 티켓 시스템 쓰기는 아직 하지 마.
```

진화는 `/jev-evolve`, 동결은 `/jev-freeze`입니다. 평가 가능한 보상이 없으면 프로토타입과 평가 계획까지만 갑니다.

## 런타임

플러그인과 별도로 [JevHarness](https://github.com/TianyuCodings/JevHarness.git) 체크아웃이 필요합니다. Python 3.11 이상입니다. 함수형 Python 노드는 macOS `sandbox-exec`가 있을 때만 동작하고, 없으면 실패로 멈춥니다.

| 용도 | 설정 |
| --- | --- |
| Vercel AI Gateway로 Jev | `JevClient(transport="vercel")`, `AI_GATEWAY_API_KEY` |
| TypeSafe 직접 호출 | `JevClient(transport="typesafe")`, `TYPESAFE_API_KEY` |
| 선택적 반사 | Claude CLI, OpenAI, Azure, Anthropic용 proposer |
| 아카이브만 보기 | 모델 키 불필요 |

출처와 저작권 범위는 `NOTICE.md`에 있습니다.
