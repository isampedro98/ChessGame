# Improvements (Prioritized)

Ordered by importance and ROI.

## Execution order (tackling one by one)

1. ~~**Fixes** (Sec 12) - duplicate game log + rematch box buttons~~
2. ~~**DevEx / CI** (Sec 13) - add `npm test` to CI, optional coverage~~
3. ~~**Draw rules** (Sec 4) - threefold repetition + 50-move rule~~
4. ~~**FEN** (Sec 6) - import/export for state reproducibility, then PGN~~
5. ~~**Training UX** (Sec 9) - undo in UI, highlight check/checkmate~~
6. **Move list quality** (Sec 10) - SAN (or LAN) in history
7. ~~**Promotion** (Sec 7) - engine reject pawn/king, tests~~
8. ~~**Rules panel** (Sec 8) - in-app short rules + link to official~~
9. ~~**Legal move edge cases** (Sec 5) - pins, en passant, castling tests~~
10. **3D performance** (Sec 11) - piece instancing, raycast throttle
11. **Engine hints** (Sec 17) - basic move suggestions and mini decision tree guidance
12. **Three.js endgame overlay** (Sec 18) - in-scene end-of-game status banner and actions
13. **Local skill rating** (Sec 19) - offline ELO-like rating vs bot with honest claims
14. **Bot difficulty selector** (Sec 20) - target-rating levels with concrete engine params
15. **Multiplayer path decision** (Sec 21/22) - static Firebase path vs server-authoritative path

---

## 1) ~~Perft + position suite~~ (done)
- ~~Validates move generation quickly and catches edge-case bugs.~~
- ~~A single day here saves weeks of manual debugging.~~

## 2) ~~Stalemate + insufficient material~~ (done)
- ~~Relatively straightforward.~~
- ~~Big correctness boost.~~

## 3) ~~Remove king-capture fallback~~ (done)
- ~~Either remove it entirely or keep it only as a debug mode.~~

## 4) ~~Draw rules: threefold repetition + 50-move rule~~ (done)
- ~~Core chess rules for correctness.~~
- ~~Domain: position key (board + turn + castling + ep), `positionKeys[]` for threefold; `halfMovesWithoutCaptureOrPawn` for 50-move; both checked in `getResult()`.~~
- ~~Max moves select: added option "50 (professional max)" in InfoPanel.~~

## 5) ~~Legal move edge cases~~ (done)
- ~~Pins, discovered checks, and double checks are covered by explicit tests.~~
- ~~En passant edge cases are covered: immediate-only window and self-check rejection.~~
- ~~Castling strictness is covered: king/rook moved and pass-through attack constraints.~~
- ~~Added explicit test suite in `legalMoveEdgeCases.test.ts`.~~

## 6) ~~FEN import/export (PGN later)~~ (done)
- ~~FEN first for state reproducibility~~ - Game export v2 includes `fen` per move; `Game.toFEN()` in domain.
- ~~PGN for scoreboard~~ - `gameToPGN()`, SAN in `pgn.ts`; each finished game stores PGN; Stats panel: Copy PGN / Show PGN.
- Import: legacy (schemaVersion < 2) still accepted; replay from moves only (FEN in v2 for documentation/validation).

## 7) ~~Promotion UI + tests~~ (done)
- ~~Simple modal for piece choice is in place.~~
- ~~Engine enforces valid promotion targets only (queen/rook/bishop/knight).~~
- ~~Dedicated tests added for invalid promotion to pawn/king.~~

## 8) ~~Rules panel for beginners (in-app)~~ (done)
- ~~Added a collapsible in-app panel with concise beginner guidance.~~
- ~~Included practical checkpoints (objective, legality, opening, filtering moves, endgame habits).~~
- ~~Added direct link to official FIDE rules for deeper reading.~~

## 9) ~~Training UX~~ (done)
- ~~Added undo/backstep in UI (`Undo` action wired to `undoLastMove()`).~~
- ~~In bot-training mode, undo can step back through bot response and player move to restore the trainee turn.~~
- ~~Added check/checkmate visual highlighting in 2D board and 3D scene markers.~~

## 10) Move list quality
- SAN or LAN notation in history (replace or supplement "e2 -> e4" in HistoryPanel).

## 11) 3D performance
- Piece instancing / merge pass.
- Raycast throttling.

## 12) ~~Fixes~~ (done)
- ~~Fix history log after finishing match generates multiple game logs~~ - use ref to persist once per game; reset on new game/rematch.
- ~~Fix buttons in rematch box~~ - `type="button"`, focus ring, `py-2`, `flex-wrap`, `z-10` on container.

## 13) DevEx / CI
- ~~Add `npm test` to CI~~ - step added in `.github/workflows/nextjs.yml`.
- Optional: coverage gating, pre-commit lint/format.

## 14) Erase history
- Allow user to erase matches history.

## 15) Add changelog to frontend
- Add hiddable changelog section in frontend.

## 16) Choose AI side
- Choose side if against AI (Training mode ON).

## 17) Engine hints while playing
- Suggest 2-3 candidate moves each turn with a short reason for each.
- Show a basic decision tree (if opponent does X, your solid replies are A/B).
- Keep it lightweight (heuristics first, no heavy search required at first version).

## 18) Three.js endgame overlay
- Show a clear in-scene status when the game finishes (checkmate/draw/max-moves).
- Surface quick actions directly in that context (new game, rematch, keep viewing).
- Keep it readable over the board with responsive sizing and non-intrusive styling.

## 19) Local skill rating (ELO-like, offline single-player)
- Naming (non-misleading):
  - Public: `Local Skill Rating (ELO-like)`.
  - Short UI label: `Local rating`.
  - Disclaimer: "Not official FIDE/Chess.com rating. Local estimate against this bot only."
- Storage spec (`localStorage`):
  - Key: `chess.localRating`.
  - Schema:
```json
{
  "schemaVersion": 1,
  "rating": 1200,
  "peakRating": 1200,
  "gamesRated": 0,
  "wins": 0,
  "draws": 0,
  "losses": 0,
  "lastUpdatedAt": "2026-03-01T00:00:00.000Z",
  "history": [
    {
      "gameId": "game-1712345678",
      "endedAt": "2026-03-01T00:00:00.000Z",
      "botLevelId": "intermediate-1200",
      "botTargetRating": 1200,
      "result": "WIN|DRAW|LOSS",
      "score": 1,
      "expected": 0.5,
      "k": 40,
      "delta": 20,
      "ratingBefore": 1200,
      "ratingAfter": 1220,
      "terminationReason": "CHECKMATE|DRAW|MAX_MOVES|RESIGN|ABANDON"
    }
  ]
}
```
- Formula and update rules:
  - Expected score: `E = 1 / (1 + 10 ^ ((R_bot - R_user) / 400))`.
  - Update: `R_new = R_old + K * (S - E)`.
  - Score `S`: win `1`, draw `0.5`, loss `0`.
  - Suggested `K`: `40` for first 20 rated games (provisional), then `24`.
  - Update only once when game transitions to terminal state.
- Edge cases:
  - Rematch: counts as new rated game (new `gameId`).
  - Resign: rated loss for resigning side.
  - Max-moves end: rated draw unless winner already exists.
  - Abandon (tab close/crash): no rating change unless an explicit `Abandon` action is added and confirmed.
  - Imported/replayed games: non-rated by default.
  - Invalid/aborted games (engine mismatch/corrupt state): no rating update.
- Acceptance criteria:
  - Rating updates are deterministic for same input tuple (`R_user`, `R_bot`, `S`, `K`).
  - Exactly one rating update per finished rated game (idempotent persistence).
  - Disclaimer is visible in UI/README.
  - Schema migration guard exists (`schemaVersion`).
- Risks:
  - Claim risk: calling it "ELO" without qualifier can be misleading.
  - Design risk: users may compare it with official ladders despite different pool/opponents.
  - Technical risk: duplicate finalization can inflate rating if idempotency is broken.
- Test/calibration plan:
  - Unit tests for formula and rounding.
  - Unit tests for terminal outcomes and idempotent update guard.
  - Regression test for rematch flow (two different game IDs -> two updates).
  - Migration test for unknown schema -> safe reset/fallback.
- Paste-ready text:
  - "Add Local Skill Rating (ELO-like, offline) versus the training bot. Keep claims honest: local estimate only, not FIDE/Chess.com equivalent. Persist rating history in `localStorage` with schema versioning and update once per finished rated game."

## 20) Bot difficulty selector (Skill level / target rating)
- Naming (non-misleading):
  - Public: `Bot Skill Level (target rating)`.
  - Do not claim official Elo equivalence; call it "target rating band."
- Level table (implementable defaults):

| Level | Target rating | Search depth | Time budget | Eval noise | Blunder rate | Eval features |
| --- | --- | --- | --- | --- | --- | --- |
| Novice | 600 | 1 ply | 30 ms | +/-60 cp | 18% | material only |
| Beginner | 900 | 1 ply | 60 ms | +/-40 cp | 12% | material + piece-square |
| Intermediate | 1200 | 2 ply | 120 ms | +/-25 cp | 6% | + mobility + center control |
| Advanced | 1500 | 2 ply (+ tactical extensions) | 220 ms | +/-12 cp | 3% | + king safety + pawn structure |
| Expert | 1800 | 3 ply | 450 ms | +/-5 cp | 1% | + move ordering + endgame bonuses |

- Minimal UI/UX changes:
  - Add selector in `Game Actions` -> `Training` group, next to `Train vs AI`.
  - Persist in `localStorage` key `chess.botSkillLevel`.
  - Default level: `Intermediate (1200)`.
  - Show active level chip near training feedback (for transparency).
- Acceptance criteria:
  - Selected level persists across reloads.
  - Change applies to next bot move without restarting game.
  - Stronger level outperforms weaker level in calibration runs.
  - Move response stays under budget on mid hardware (+ reasonable buffer).
- Risks:
  - Claim risk: "1800" may be perceived as certified strength.
  - Perf risk on low-end/mobile for deeper levels.
  - Tuning risk: too much randomness can invert expected level ordering.
- Test/calibration plan (no external datasets):
  - Bot-vs-bot matrix (each adjacent pair, colors swapped, fixed seeds).
  - Pass threshold: higher level scores >= 60% against previous level.
  - Smoke tests per level: legal move always returned under timeout.
  - Track simple metrics: win rate, average game length, blunder frequency proxy.
- Paste-ready text:
  - "Add Bot Skill Level selector with target-rating bands (600-1800), backed by concrete search/time/noise/blunder parameters. Persist selection client-side and calibrate levels with bot-vs-bot runs so stronger levels consistently beat lower ones."

## 21) Multiplayer path C1: static hosting + Firebase (no Next runtime)
- Naming (non-misleading):
  - Public: `Casual Online Multiplayer (client-validated)`.
  - Explicit limit: soft-trust model, not anti-cheat secure.
- Architecture:
  - Static Next export + Firebase Auth + Firestore listeners.
  - No own backend; turn coordination via transactions and security rules.
- Data model (Firestore):
  - `games/{gameId}`: metadata, players, status, turn, clocks, latest FEN, result.
  - `games/{gameId}/moves/{ply}`: UCI/SAN, `fenAfter`, actor UID, timestamps.
  - `users/{uid}`: profile (displayName, createdAt).
  - Optional `presence/{uid}` heartbeat.
- Turn flow:
  - Client validates move locally with engine.
  - Transaction writes next move only if `currentTurn` and `ply` match expected values.
  - Both clients recompute from move log and sync board.
- Basic cheating prevention (best possible without server):
  - Firestore rules: only assigned player can write on their turn; historical moves immutable.
  - Reject out-of-order moves (`ply` monotonic).
  - Client-side mismatch detection: if `fenAfter` differs, mark game `DISPUTED`.
- Known limits:
  - Cannot fully prevent modified clients/engine assistance.
  - Clock integrity is partial without authoritative server clock.
  - Account abuse/smurfing is only partially mitigated.
- Acceptance criteria:
  - Two authenticated users can create/join/play/reconnect in real time.
  - Illegal turn writes blocked by rules.
  - Reconnect reconstructs exact state from persisted moves.
- Risks:
  - Security/cheat limitations inherent to client-trust architecture.
  - Firestore quota/cost spikes from listeners and move writes.
  - Conflict resolution complexity on unstable networks.
- Test plan:
  - Firestore emulator rule tests (allow/deny matrix).
  - E2E in two browsers/tabs with disconnect/reconnect scenarios.
  - Recovery tests from partial writes and stale listeners.
- Paste-ready text:
  - "Prototype casual multiplayer on GitHub Pages using Firebase Auth + Firestore. Keep engine validation client-side with transaction-based turn locking and explicit 'soft trust' limits (not fully anti-cheat)."

## 22) Multiplayer path C2: server-authoritative runtime (after hosting migration)
- Naming (non-misleading):
  - Public: `Ranked Multiplayer (server-authoritative)`.
  - Claim only once server-side move validation is enforced.
- Migration target:
  - Move hosting to Vercel/Render/Cloudflare Workers with runtime support.
  - Keep current frontend; add API/WebSocket layer for live matches.
- Architecture:
  - Clients send move intents (`from`, `to`, `promotion`) only.
  - Server owns authoritative `Game` state and validates with same TypeScript engine.
  - Server persists approved moves/state (Firestore or SQL), broadcasts updates.
  - Add basic matchmaking queue and authoritative clocks.
- Anti-cheat posture:
  - Server rejects illegal moves and out-of-turn actions.
  - Immutable server event log per game.
  - Optional signed move hashes for audit.
- Acceptance criteria:
  - 100% of illegal moves rejected server-side.
  - No state divergence between clients after reconnect.
  - Matchmaking creates playable game and resumes after transient disconnect.
- Risks:
  - Higher complexity/ops burden (runtime, monitoring, incident handling).
  - Infrastructure cost and latency management.
  - Need abuse controls (rate limits, auth hardening).
- Test plan:
  - Integration tests for API/WebSocket move lifecycle.
  - Fuzz tests for illegal/duplicate/out-of-order move intents.
  - Load tests for concurrent matches and reconnect storms.
- Paste-ready text:
  - "If multiplayer becomes core, migrate from static hosting to a server runtime and make the server authoritative for move validation, clocks, and matchmaking. This is the path for credible anti-cheat and ranked play."
