# ExamHelper Optimization Plan

## Goal

Tighten the project around the current product direction: a FastAPI + LangGraph backend and a Next.js dashboard for outline ingestion, question staging, classification, and practice generation.

The work should improve correctness first, then protocol consistency, testability, and maintenance. Each phase should be small enough to verify independently.

## Phase 1: Correctness Fixes

### 1.1 Outline Agent Persistence Target

Problem:
- `/outlines/extract` creates an initial `Outline` row and streams events using that `outline_id`.
- The persistence step currently creates a second `Outline` row when saving extracted nodes.
- Result: the frontend can complete generation but inspect the original outline and see no generated nodes.

Plan:
- Change outline persistence to accept an optional `outline_id`.
- If `outline_id` exists, update that row and write nodes under it.
- If no `outline_id` is provided, preserve legacy behavior by creating a new `Outline`.
- Pass `state["outline_id"]` from the persistence node into the tool/service layer.
- Add a focused test for writing nodes into an existing outline.

Acceptance:
- Extracted nodes are associated with the original outline id.
- No duplicate outline is created for normal `/outlines/extract` flow.
- Existing tests continue to pass.

### 1.2 API Path Consistency

Problem:
- The project documents a no-trailing-slash API convention.
- `POST /nodes/` and the frontend `/nodes/` call still use a trailing slash.

Plan:
- Change backend create-node route from `@router.post("/")` to `@router.post("")`.
- Change frontend node service from `/nodes/` to `/nodes`.

Acceptance:
- OpenAPI lists `POST /nodes`.
- Existing create-node UI still works.

## Phase 2: Streaming Protocol Hardening

### 2.1 Typed Stream Events

Problem:
- The stream protocol is now unified, but event names and payload shapes are still implicit.

Plan:
- Add shared frontend event payload types for `progress`, `review_required`, `token`, `error`, and `done`.
- Add backend constants or helpers for event names.
- Add tests for SSE encoding and frontend parser behavior where practical.

Acceptance:
- New stream producers/consumers do not hand-roll event names.
- Stream parsing handles multi-line data, JSON payloads, and done events.

### 2.2 Run Metadata

Problem:
- Long-running streams do not include `run_id` or sequence numbers.

Plan:
- Add `run_id` at stream start.
- Include `seq` on emitted events.
- Include resource ids such as `outline_id` / `node_id` where useful.

Acceptance:
- Frontend can ignore stale stream events.
- Logs can correlate stream events to one run.

## Phase 3: Task Lifecycle Controls

### 3.1 Cancellation

Problem:
- Closing a panel or navigating away does not reliably stop backend work.

Plan:
- Use `AbortController` on the frontend.
- Add disconnect checks or explicit cancel endpoint for long-running agent tasks.
- Track active outline agent tasks in the agent manager.

Acceptance:
- User can cancel an outline or question extraction run.
- Backend stops or safely abandons work.

### 3.2 Standard Error Payloads

Problem:
- Error messages are plain strings in some places and partial JSON in others.

Plan:
- Standardize errors as `{ message, code, recoverable, details }`.
- Use this shape for all streaming and non-streaming agent endpoints.

Acceptance:
- Frontend can render recoverable vs terminal failures consistently.

## Phase 4: Test and Quality Gates

### 4.1 Agent Unit Tests Without Real LLM Calls

Plan:
- Test persistence and stream wrapping with mocked agent events.
- Avoid deep tests unless `--deep` is explicitly set.

Acceptance:
- Core agent plumbing can be verified without API keys.

### 4.2 Incremental Frontend Lint Cleanup

Plan:
- Keep changed files lint-clean.
- Gradually remove `any`, unused imports, and unescaped text in touched modules.

Acceptance:
- No new lint debt from new work.

## Execution Log

- [x] Phase 1.1: Outline agent persistence target
- [x] Phase 1.2: API path consistency
- [x] Phase 2.1: Typed stream events
- [x] Phase 2.2: Run metadata
- [x] Phase 3.1: Cancellation
- [ ] Phase 3.2: Standard error payloads
- [ ] Phase 4.1: Agent unit tests
- [ ] Phase 4.2: Incremental frontend lint cleanup

## Completed Work

### Phase 1.1

- Updated outline persistence to write extracted nodes into an existing `outline_id` when provided.
- Preserved legacy behavior for direct persistence calls without an `outline_id`.
- Rebuilds the target outline's node tree before inserting newly extracted nodes.
- Added a focused temporary SQLite test that verifies no duplicate outline is created and child nodes keep the correct parent relation.

### Phase 1.2

- Updated node creation API from `POST /nodes/` to `POST /nodes`.
- Updated the frontend node service to call `/nodes`.
- Confirmed OpenAPI now lists `POST /nodes`.

### Phase 2.1

- Added backend stream event constants, typed payload shapes, and helper functions for `progress`, `review_required`, `token`, `error`, and `done`.
- Added frontend stream event payload types and a typed handler map for `consumeSSE`.
- Updated outline extraction, question extraction, and practice generation consumers to use shared stream payload guards.
- Added focused SSE encoding tests covering metadata, JSON payloads, multi-line data, token events, and done events.

### Phase 2.2

- Added a backend `StreamRun` helper that assigns one `run_id` per stream and increments `seq` on every emitted event.
- Added resource metadata to stream payloads: outline extraction/question extraction include `outline_id`, and practice generation includes `node_id`.
- Updated frontend stream payload types to expose `run_id`, `seq`, `outline_id`, and `node_id`.
- Added tests that verify stable `run_id`, increasing `seq`, and resource id propagation across a stream run.

### Phase 3.1

- Added frontend `AbortController` support for outline extraction, question extraction, and practice generation streams.
- Added an explicit outline extraction cancel endpoint and backend disconnect checks for the long-running outline agent stream.
- Updated the outline agent manager to track active background tasks and cancel/clean them on disconnect, close, or explicit cancellation.
- Converted the staging extraction abort button and practice generation button into real stream cancellation controls.
- Added focused tests for outline agent task cancellation and cleanup.

## Verification

- `.venv/bin/python -m pytest`: `13 passed, 1 skipped`
- `.venv/bin/python scripts/api_explorer.py list nodes`: confirms `POST /nodes`
- `npm run lint -- services/nodeService.ts`: passed
- `npm run lint -- lib/stream-client.ts lib/stream-events.ts store/usePracticeStore.ts store/useOutlineStore.ts services/outlineService.ts components/CreateOutlineWizard.tsx 'app/[locale]/board/staging/add/page.tsx'`: passed
- `npm run lint -- services/questionService.ts services/outlineService.ts services/practiceService.ts components/CreateOutlineWizard.tsx 'app/[locale]/board/staging/add/page.tsx' store/usePracticeStore.ts 'app/[locale]/board/_components/PracticeConfig.tsx'`: passed
- `npx tsc --noEmit`: passed
