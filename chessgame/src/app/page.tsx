'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';

import { BoardGrid } from '@/app/components/BoardGrid';
import { HistoryPanel } from '@/app/components/HistoryPanel';
import { InfoPanel } from '@/app/components/InfoPanel';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { StatsPanel } from '@/app/components/StatsPanel';
import { SquareInfo, useChessUI, type MoveEvent } from '@/app/hooks/useChessUI';
import { analyzeTrainingMove, chooseTrainingMove } from '@/app/chess-ui/training';
import { useTranslation } from '@/app/i18n/TranslationProvider';
import ChessScene from '@/app/components/ChessScene';
import {
	createStandardGame,
	createSwappedGame,
	Move,
	Position,
	Team,
	PieceType,
	SimpleMove,
	CastleMove,
	EnPassantMove,
	PromotionMove,
} from '@/domain/chess';

const STATS_KEY = 'chess.stats';
const STATS_SCHEMA_VERSION = 1;
const GAME_SCHEMA_VERSION = 1;

type GameSummary = {
	id: string;
	moves: number;
	capturedWhite: number;
	capturedBlack: number;
	winner: 'WHITE' | 'BLACK' | null;
	startedAt: string;
	endedAt: string | null;
};

type Stats = {
	schemaVersion: number;
	totalGames: number;
	winsWhite: number;
	winsBlack: number;
	games: GameSummary[];
};

const buildEmptyStats = (): Stats => ({
	schemaVersion: STATS_SCHEMA_VERSION,
	totalGames: 0,
	winsWhite: 0,
	winsBlack: 0,
	games: [],
});

const coerceStats = (value: unknown): Stats => {
	if (!value || typeof value !== 'object') return buildEmptyStats();
	const parsed = value as Partial<Stats> & { gamesPlayed?: number };
	if (Array.isArray(parsed.games)) {
		return {
			schemaVersion: STATS_SCHEMA_VERSION,
			totalGames: typeof parsed.totalGames === 'number' ? parsed.totalGames : parsed.games.length,
			winsWhite: typeof parsed.winsWhite === 'number' ? parsed.winsWhite : 0,
			winsBlack: typeof parsed.winsBlack === 'number' ? parsed.winsBlack : 0,
			games: parsed.games,
		};
	}
	if (typeof parsed.gamesPlayed === 'number') {
		return { ...buildEmptyStats(), totalGames: parsed.gamesPlayed };
	}
	return buildEmptyStats();
};

export default function Home(): JSX.Element {
	const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';
	const [trainingFeedback, setTrainingFeedback] = useState<{ tone: 'good' | 'ok' | 'warn' | 'bad'; text: string } | null>(null);
	const [game, setGame] = useState(() => createStandardGame());
  const [pendingPromotion, setPendingPromotion] = useState<PromotionMove | null>(null);
	const { t } = useTranslation();
	const {
		squares,
		availableDestinations,
		history,
		instruction,
		message,
		onSquareClick,
		applyMove,
		scenePieces,
		selectedSquareKey,
		currentTurn,
		captureDestinations,
	} = useChessUI(game, {
		onMove: (event: MoveEvent) => {
			if (!botEnabled) return;
			const analysis = analyzeTrainingMove({
				board: event.boardBefore,
				move: event.move,
				legalMoves: event.legalMoves,
				turn: event.turn,
				moveIndex: event.moveIndex,
			});
			const isBotMove = event.turn === botSide;
			const preferNegative = analysis.delta > 1.4;
			const reasonKeys = isBotMove
				? analysis.positiveReasons
				: preferNegative
					? analysis.negativeReasons
					: analysis.positiveReasons;
			const fallbackReason = preferNegative ? 'training.reason.missed' : 'training.reason.quiet';
			const reasonText =
				reasonKeys.length > 0
					? reasonKeys.map((key) => t(`training.reason.${key}`)).join(', ')
					: t(fallbackReason);

			if (isBotMove) {
				setTrainingFeedback({
					tone: 'ok',
					text: t('training.bot', { reasons: reasonText }),
				});
				return;
			}

			const delta = analysis.delta;
			let label: 'excellent' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder' = 'ok';
			let tone: 'good' | 'ok' | 'warn' | 'bad' = 'ok';
			if (delta <= 0.3) {
				label = 'excellent';
				tone = 'good';
			} else if (delta <= 0.9) {
				label = 'good';
				tone = 'good';
			} else if (delta <= 1.5) {
				label = 'ok';
				tone = 'ok';
			} else if (delta <= 2.3) {
				label = 'inaccuracy';
				tone = 'warn';
			} else if (delta <= 3.2) {
				label = 'mistake';
				tone = 'warn';
			} else {
				label = 'blunder';
				tone = 'bad';
			}
			setTrainingFeedback({
				tone,
				text: t(`training.player.${label}`, { reasons: reasonText }),
			});
		},
    onPromotion: (move) => {
      if (botEnabled && currentTurn === botSide) return;
      setPendingPromotion(move);
    },
	});

	// Stats in localStorage (extended schema with per-game summaries)

	const loadStats = useCallback((): Stats => {
		if (typeof window === 'undefined') return buildEmptyStats();
		try {
			const raw = window.localStorage.getItem(STATS_KEY);
			if (!raw) return buildEmptyStats();
			const parsed = JSON.parse(raw);
			return coerceStats(parsed);
		} catch {
			return buildEmptyStats();
		}
	}, []);

	// Avoid hydration mismatch: init with empty and load after mount
	const [stats, setStats] = useState<Stats>(buildEmptyStats());
	useEffect(() => { setStats(loadStats()); }, [loadStats]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [maxMoves, setMaxMoves] = useState<number | null>(() => {
		if (typeof window === 'undefined') return null;
		try { const raw = window.localStorage.getItem('chess.maxMoves'); return raw ? (Number(raw) || null) : null; } catch { return null; }
	});
	useEffect(() => { try { window.localStorage.setItem('chess.maxMoves', String(maxMoves ?? '')); } catch {} }, [maxMoves]);
const currentGameStartRef = useRef<string>(new Date().toISOString());
  // Training bot (state machine)
  const [botEnabled, setBotEnabled] = useState(false);
  const [botSide, setBotSide] = useState<Team>(Team.Black);
  // End-of-game summary (declare before effects that depend on it)
  const [pendingSummary, setPendingSummary] = useState<GameSummary | null>(null);
  const botBusyRef = useRef(false);

	const persistStats = useCallback((value: Stats) => {
		const normalized = { ...value, schemaVersion: STATS_SCHEMA_VERSION };
		setStats(normalized);
		try { window.localStorage.setItem(STATS_KEY, JSON.stringify(normalized)); } catch {}
	}, []);

  const summarizeGame = useCallback((): GameSummary => {
    const history = game.moveHistory();
    const board = game.getBoard();
    const whiteHasKing = board.getPiecesByTeam(Team.White).some((p) => p.type === PieceType.King);
    const blackHasKing = board.getPiecesByTeam(Team.Black).some((p) => p.type === PieceType.King);
		const winner: 'WHITE' | 'BLACK' | null = !whiteHasKing ? 'BLACK' : !blackHasKing ? 'WHITE' : null;
		let capturedWhite = 0; let capturedBlack = 0;
		for (const rec of history) {
			const c = rec.resolution.capturedPiece;
			if (c) { if (c.team === Team.White) capturedWhite += 1; else capturedBlack += 1; }
		}
		return {
			id: 'game-' + Date.now(),
			moves: history.length,
			capturedWhite,
			capturedBlack,
			winner,
			startedAt: currentGameStartRef.current,
			endedAt: new Date().toISOString(),
		};
	}, [game]);

	const handleNewGame = () => {
		if (game.moveHistory().length > 0) {
			const summary = summarizeGame();
			const winsWhite = stats.winsWhite + (summary.winner === 'WHITE' ? 1 : 0);
			const winsBlack = stats.winsBlack + (summary.winner === 'BLACK' ? 1 : 0);
			persistStats({ ...stats, totalGames: stats.totalGames + 1, winsWhite, winsBlack, games: [...stats.games, summary] });
		}
		setGame(createStandardGame());
		currentGameStartRef.current = new Date().toISOString();
		setTrainingFeedback(null);
    setPendingPromotion(null);
	};

  const handleExportStats = () => {
		const data = stats;
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'chess-stats.json'; a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportGame = () => {
		// Export with pieceName, team and algebraic squares (uppercase)
		const records = game.moveHistory().map(({ move, resolution }) => {
			const idParts = String(move.pieceId).split('-');
			const pieceName = idParts.length >= 2 ? idParts[1] : 'piece';
			const teamStr = idParts.length >= 1 ? idParts[0] : 'unknown';
			const record: Record<string, unknown> = {
				pieceName,
				team: teamStr,
				from: move.from.toAlgebraic().toUpperCase(),
				to: move.to.toAlgebraic().toUpperCase(),
			};
			if (move instanceof CastleMove) {
				record.type = 'castle';
			} else if (move instanceof EnPassantMove) {
				record.type = 'enPassant';
			} else if (move instanceof PromotionMove) {
				record.type = 'promotion';
				if (resolution.promotedPiece) {
					record.promotion = resolution.promotedPiece.type;
				}
			}
			return record;
		});
		const blob = new Blob([JSON.stringify({ schemaVersion: GAME_SCHEMA_VERSION, moves: records }, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a'); a.href = url; a.download = 'chess-game.json'; a.click();
		URL.revokeObjectURL(url);
	};

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
		const file = ev.target.files?.[0];
		if (!file) return;
		const text = await file.text();
		try {
			const json = JSON.parse(text);
			if (json && (typeof json.gamesPlayed === 'number' || Array.isArray(json.games))) {
				persistStats(coerceStats(json));
			}
			if (Array.isArray(json.moves)) {
				const fresh = createStandardGame();
				for (const m of json.moves) {
					const from = typeof m.from === 'string' ? Position.fromAlgebraic(m.from) : Position.fromCoordinates(m.from.row, m.from.column);
					const to = typeof m.to === 'string' ? Position.fromAlgebraic(m.to) : Position.fromCoordinates(m.to.row, m.to.column);
					let pieceId: string | null = typeof m.pieceId === 'string' ? m.pieceId : null;
					if (!pieceId) {
						const pieceAtFrom = fresh.getBoard().getPiece(from);
						pieceId = pieceAtFrom ? pieceAtFrom.id : null;
					}
					if (!pieceId) { continue; }
					const moveTypeRaw =
						typeof m.type === 'string'
							? m.type
							: typeof m.promotion === 'string'
								? 'promotion'
								: 'simple';
					const moveType = typeof moveTypeRaw === 'string' ? moveTypeRaw.toLowerCase() : moveTypeRaw;
					let move: Move;
					if (moveType === 'castle') {
						const rookFrom = Position.fromCoordinates(from.row, to.column > from.column ? 7 : 0);
						const rookTo = Position.fromCoordinates(from.row, to.column > from.column ? 5 : 3);
						const rook = fresh.getBoard().getPiece(rookFrom);
						if (!rook) {
							continue;
						}
						move = new CastleMove(pieceId, from, to, rook.id, rookFrom, rookTo);
					} else if (moveType === 'enpassant') {
						const capturedPos = Position.fromCoordinates(from.row, to.column);
						move = new EnPassantMove(pieceId, from, to, capturedPos);
					} else if (moveType === 'promotion') {
						const rawPromotion = typeof m.promotion === 'string' ? m.promotion.toUpperCase() : '';
						const promoteTo = (Object.values(PieceType) as string[]).includes(rawPromotion)
							? (rawPromotion as PieceType)
							: PieceType.Queen;
						move = new PromotionMove(pieceId, from, to, promoteTo);
					} else {
						move = new SimpleMove(pieceId, from, to);
					}
					try { fresh.executeMove(move); } catch {}
				}
				setGame(fresh);
			}
		} catch {}
		ev.target.value = '';
  };
  // Bot move effect: when it's bot's turn, pick a capture-first move and simulate clicks
  const performBotMove = useCallback(() => {
    if (!botEnabled) return;
    if (pendingSummary) return;
    if (botBusyRef.current) return;
    if (game.getTurn() !== botSide) return;

    const board = game.getBoard();
    const pieces = board.getPiecesByTeam(botSide);

    const allMoves: Move[] = [];
    for (const p of pieces) {
      const ms = game.generateMovesFor(p.id) as Move[];
      for (const m of ms) allMoves.push(m);
    }
    if (allMoves.length === 0) return;

    botBusyRef.current = true;
    const selection = chooseTrainingMove({
      board,
      legalMoves: allMoves,
      turn: botSide,
      moveIndex: history.length,
      config: { randomness: 0.2, preferTop: 0.4 },
    });
    if (!selection) {
      botBusyRef.current = false;
      return;
    }
    applyMove(selection.move);
    botBusyRef.current = false;
  }, [applyMove, botEnabled, botSide, game, history.length, pendingSummary]);

  useEffect(() => { performBotMove(); }, [history.length, performBotMove]);

  const handleRematchSwapColors = () => {
    setPendingSummary(null);
    setGame(createSwappedGame());
    currentGameStartRef.current = new Date().toISOString();
    setTrainingFeedback(null);
    setPendingPromotion(null);
  };
  const handleToggleBot = () => {
    setBotEnabled((v) => !v);
    setBotSide(Team.Black);
    setTrainingFeedback(null);
    setPendingPromotion(null);
  };
  // Detect end of game (winner or draw by max moves), persist stats, and prompt user
  useEffect(() => {
    const winner = game.getWinner();
    const reachedMax = maxMoves != null && history.length >= maxMoves;
    if ((winner || reachedMax) && !pendingSummary) {
      const summary = summarizeGame();
      const winsWhite = stats.winsWhite + (summary.winner === 'WHITE' ? 1 : 0);
      const winsBlack = stats.winsBlack + (summary.winner === 'BLACK' ? 1 : 0);
      persistStats({ ...stats, totalGames: stats.totalGames + 1, winsWhite, winsBlack, games: [...stats.games, summary] });
      setPendingSummary(summary);
    }
  }, [game, history.length, maxMoves, pendingSummary, persistStats, stats, summarizeGame]);

	// Stable lookup by board key for 3D clicks
	const squaresByKey = new Map(squares.map((s) => [s.position.toKey(), s]));

	const handlePickSquare = (row: number, column: number, originKey?: string) => {
		if (pendingPromotion) {
			return;
		}
		if (botEnabled && currentTurn === botSide) {
			return;
		}
		const destKey = `${row},${column}`;
	const makeSquare = (r: number, c: number) => {
		const pos = Position.fromCoordinates(r, c);
		return { id: pos.toAlgebraic(), position: pos, isDark: (r + c) % 2 === 1 } as SquareInfo;
	};
	const destSquare = squaresByKey.get(destKey) ?? makeSquare(row, column);
	if (!selectedSquareKey && originKey && originKey !== destKey) {
		const [or, oc] = originKey.split(',').map((v) => Number(v));
		const originSquare = squaresByKey.get(originKey) ?? makeSquare(or, oc);
		onSquareClick(originSquare);
		queueMicrotask(() => onSquareClick(destSquare));
		return;
	}
onSquareClick(destSquare);
};
return (
		<div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
			<main className="mx-auto flex w-full max-w-6xl flex-col gap-12">
				<header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-3">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-500">
							{t('app.tagline')}
						</p>
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="text-3xl font-semibold">{t('app.title')}</h1>
							<span className="rounded-full border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-xs font-semibold tracking-[0.2em] text-slate-400">
								v{appVersion}
							</span>
						</div>
						<p className="max-w-3xl text-slate-400">{t('app.description')}</p>
					</div>
                    <LanguageSwitcher />
				</header>

				<section className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
					<div className="space-y-4">
						<h2 className="text-lg font-semibold">{t('board.title')}</h2>
						<BoardGrid
							squares={squares}
							availableDestinations={availableDestinations}
							selectedSquareKey={selectedSquareKey}
							currentTurn={currentTurn}
						/>
                    <p className="text-sm text-slate-500">{t('board.subtitle')}</p>
                    <p className="text-xs text-slate-500">{t('board.interactionHint')}</p>
                    {pendingSummary ? (
                      <div className="mt-2 rounded-md border border-emerald-700/40 bg-emerald-900/30 p-3 text-sm text-emerald-200">
                        <div className="mb-2">Game finished. {pendingSummary.winner ?? 'DRAW'}</div>
                        <div className="flex gap-2">
                          <button onClick={handleNewGame} className="rounded-md bg-emerald-700 px-3 py-1 text-xs text-white hover:bg-emerald-600">Start New Game</button>
                          <button onClick={handleRematchSwapColors} className="rounded-md bg-indigo-700 px-3 py-1 text-xs text-white hover:bg-indigo-600">Rematch (swap colors)</button>
                          <button onClick={() => setPendingSummary(null)} className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700">Keep Viewing</button>
                        </div>
                      </div>
                    ) : null}
                    <StatsPanel stats={stats} onExport={handleExportStats} />
					</div>

					<div className="space-y-4">
						<h2 className="text-lg font-semibold">{t('scene.title')}</h2>
						<div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
							<ChessScene
								initialPieces={scenePieces}
								currentTurn={currentTurn}
								onPickSquare={handlePickSquare}
								selectedSquareKey={selectedSquareKey}
								availableDestinations={availableDestinations}
								captureDestinations={captureDestinations}
							/>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="application/json"
							onChange={handleImportFile}
							className="hidden"
						/>
						<div className="space-y-4">
                        <InfoPanel
                            currentTurn={currentTurn}
                            instruction={instruction}
                            message={message}
                            trainingFeedback={trainingFeedback}
                            movesCount={history.length}
                            maxMoves={maxMoves}
                            onChangeMaxMoves={(v) => setMaxMoves(v)}
                            onNewGame={handleNewGame}
                            onExportGame={handleExportGame}
                            onImportGame={handleImportClick}
                            onPlayBot={handleToggleBot}
                            botEnabled={botEnabled}
                        />
                        {pendingPromotion ? (
                          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                            <div className="text-sm font-semibold">{t('promotion.title')}</div>
                            <div className="text-xs text-amber-200/80">{t('promotion.subtitle')}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                className="rounded-md border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-xs text-amber-50 hover:bg-amber-400/30"
                                onClick={() => {
                                  applyMove(new PromotionMove(pendingPromotion.pieceId, pendingPromotion.from, pendingPromotion.to, PieceType.Queen));
                                  setPendingPromotion(null);
                                }}
                              >
                                {t('piece.queen')}
                              </button>
                              <button
                                className="rounded-md border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-xs text-amber-50 hover:bg-amber-400/30"
                                onClick={() => {
                                  applyMove(new PromotionMove(pendingPromotion.pieceId, pendingPromotion.from, pendingPromotion.to, PieceType.Rook));
                                  setPendingPromotion(null);
                                }}
                              >
                                {t('piece.rook')}
                              </button>
                              <button
                                className="rounded-md border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-xs text-amber-50 hover:bg-amber-400/30"
                                onClick={() => {
                                  applyMove(new PromotionMove(pendingPromotion.pieceId, pendingPromotion.from, pendingPromotion.to, PieceType.Bishop));
                                  setPendingPromotion(null);
                                }}
                              >
                                {t('piece.bishop')}
                              </button>
                              <button
                                className="rounded-md border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-xs text-amber-50 hover:bg-amber-400/30"
                                onClick={() => {
                                  applyMove(new PromotionMove(pendingPromotion.pieceId, pendingPromotion.from, pendingPromotion.to, PieceType.Knight));
                                  setPendingPromotion(null);
                                }}
                              >
                                {t('piece.knight')}
                              </button>
                              <button
                                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                                onClick={() => setPendingPromotion(null)}
                              >
                                {t('promotion.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : null}
							<HistoryPanel
								history={history}
								title={t('history.title')}
								emptyState={t('history.empty')}
							/>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
