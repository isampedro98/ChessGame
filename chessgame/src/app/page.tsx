'use client';

import { JSX, useEffect, useRef, useState } from 'react';

import { BoardGrid } from '@/app/components/BoardGrid';
import { HistoryPanel } from '@/app/components/HistoryPanel';
import { InfoPanel } from '@/app/components/InfoPanel';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { StatsPanel } from '@/app/components/StatsPanel';
import { SquareInfo, useChessUI } from '@/app/hooks/useChessUI';
import { useTranslation } from '@/app/i18n/TranslationProvider';
import ChessScene from '@/app/components/ChessScene';
import { createStandardGame, createSwappedGame } from '@/domain/chess';
import { Position } from '@/domain/chess';
import { Team } from '@/domain/chess';
import { PieceType } from '@/domain/chess';

export default function Home(): JSX.Element {
	const [game, setGame] = useState(() => createStandardGame());
	const {
		squares,
		availableDestinations,
		history,
		instruction,
		message,
		onSquareClick,
		scenePieces,
		selectedSquareKey,
		currentTurn,
		captureDestinations,
	} = useChessUI(game);
		const { t } = useTranslation();

	// Stats in localStorage (extended schema with per-game summaries)
	const STATS_KEY = 'chess.stats';
	type GameSummary = { id: string; moves: number; capturedWhite: number; capturedBlack: number; winner: 'WHITE' | 'BLACK' | null; startedAt: string; endedAt: string | null };
	type Stats = { totalGames: number; winsWhite: number; winsBlack: number; games: GameSummary[] };

	const loadStats = (): Stats => {
		if (typeof window === 'undefined') return { totalGames: 0, winsWhite: 0, winsBlack: 0, games: [] };
		try {
			const raw = window.localStorage.getItem(STATS_KEY);
			if (!raw) return { totalGames: 0, winsWhite: 0, winsBlack: 0, games: [] };
			const parsed = JSON.parse(raw);
			if (parsed && Array.isArray(parsed.games)) {
				return parsed as Stats;
			}
			// legacy shape { gamesPlayed }
			const total = typeof parsed?.gamesPlayed === 'number' ? parsed.gamesPlayed : 0;
			return { totalGames: total, winsWhite: 0, winsBlack: 0, games: [] };
		} catch {
			return { totalGames: 0, winsWhite: 0, winsBlack: 0, games: [] };
		}
	};

	// Avoid hydration mismatch: init with empty and load after mount
	const [stats, setStats] = useState<Stats>({ totalGames: 0, winsWhite: 0, winsBlack: 0, games: [] });
	useEffect(() => { setStats(loadStats()); }, []);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [maxMoves, setMaxMoves] = useState<number | null>(() => {
		if (typeof window === 'undefined') return null;
		try { const raw = window.localStorage.getItem('chess.maxMoves'); return raw ? (Number(raw) || null) : null; } catch { return null; }
	});
	useEffect(() => { try { window.localStorage.setItem('chess.maxMoves', String(maxMoves ?? '')); } catch {} }, [maxMoves]);
const currentGameStartRef = useRef<string>(new Date().toISOString());
  // Bot (Phase 1 - random legal move)
  const [botEnabled, setBotEnabled] = useState(false);
  const [botSide, setBotSide] = useState<Team>(Team.Black);

	const persistStats = (value: Stats) => {
		setStats(value);
		try { window.localStorage.setItem(STATS_KEY, JSON.stringify(value)); } catch {}
	};

  const summarizeGame = (): GameSummary => {
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
	};

	const handleNewGame = () => {
		if (game.moveHistory().length > 0) {
			const summary = summarizeGame();
			const winsWhite = stats.winsWhite + (summary.winner === 'WHITE' ? 1 : 0);
			const winsBlack = stats.winsBlack + (summary.winner === 'BLACK' ? 1 : 0);
			persistStats({ totalGames: stats.totalGames + 1, winsWhite, winsBlack, games: [...stats.games, summary] });
		}
		setGame(createStandardGame());
		currentGameStartRef.current = new Date().toISOString();
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
		const records = game.moveHistory().map(({ move }) => {
			const idParts = String(move.pieceId).split('-');
			const pieceName = idParts.length >= 2 ? idParts[1] : 'piece';
			const teamStr = idParts.length >= 1 ? idParts[0] : 'unknown';
			return {
				pieceName,
				team: teamStr,
				from: move.from.toAlgebraic().toUpperCase(),
				to: move.to.toAlgebraic().toUpperCase(),
			};
		});
		const blob = new Blob([JSON.stringify({ moves: records }, null, 2)], { type: 'application/json' });
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
				if (Array.isArray(json.games)) {
					persistStats(json as Stats);
				} else {
					persistStats({ totalGames: json.gamesPlayed, winsWhite: 0, winsBlack: 0, games: [] });
				}
			}
			if (Array.isArray(json.moves)) {
				const fresh = createStandardGame();
				const { Position } = await import('@/domain/chess');
				const { SimpleMove } = await import('@/domain/chess/moves/SimpleMove');
				for (const m of json.moves) {
					const from = typeof m.from === 'string' ? Position.fromAlgebraic(m.from) : Position.fromCoordinates(m.from.row, m.from.column);
					const to = typeof m.to === 'string' ? Position.fromAlgebraic(m.to) : Position.fromCoordinates(m.to.row, m.to.column);
					let pieceId: string | null = typeof m.pieceId === 'string' ? m.pieceId : null;
					if (!pieceId) {
						const pieceAtFrom = fresh.getBoard().getPiece(from);
						pieceId = pieceAtFrom ? pieceAtFrom.id : null;
					}
					if (!pieceId) { continue; }
					const move = new SimpleMove(pieceId, from, to);
					try { fresh.executeMove(move); } catch {}
				}
				setGame(fresh);
			}
		} catch {}
		ev.target.value = '';
  };
  // Bot move effect: when it's bot's turn, pick a random move and simulate clicks
  useEffect(() => {
    if (!botEnabled) return;
    if (pendingSummary) return;
    if (game.getTurn() !== botSide) return;
    const board = game.getBoard();
    const pieces = board.getPiecesByTeam(botSide);
    const allMoves: any[] = [];
    for (const p of pieces) {
      const ms = p.generateMoves(board);
      for (const m of ms) allMoves.push(m);
    }
    if (allMoves.length === 0) return;
    const move = allMoves[Math.floor(Math.random() * allMoves.length)];
    const origin = move.from as typeof move.from;
    const dest = move.to as typeof move.to;
    const makeSquareInfo = (pos: typeof origin) => {
      const piece = board.getPiece(pos);
      return {
        id: pos.toAlgebraic(),
        position: pos,
        piece,
        isDark: ((pos.row + pos.column) % 2) === 1,
      } as SquareInfo;
    };
    const originSq = makeSquareInfo(origin);
    const destSq = makeSquareInfo(dest);
    onSquareClick(originSq);
    queueMicrotask(() => onSquareClick(destSq));
  }, [history.length, botEnabled, botSide, pendingSummary]);

  const handleRematchSwapColors = () => {
    setPendingSummary(null);
    setGame(createSwappedGame());
    currentGameStartRef.current = new Date().toISOString();
  };
  const handleToggleBot = () => {
    setBotEnabled((v) => !v);
    setBotSide(Team.Black);
  };
  // Detect end of game (winner or draw by max moves), persist stats, and prompt user
  const [pendingSummary, setPendingSummary] = useState<GameSummary | null>(null);
  useEffect(() => {
    const winner = game.getWinner();
    const reachedMax = maxMoves != null && history.length >= maxMoves;
    if ((winner || reachedMax) && !pendingSummary) {
      const summary = summarizeGame();
      const winsWhite = stats.winsWhite + (summary.winner === 'WHITE' ? 1 : 0);
      const winsBlack = stats.winsBlack + (summary.winner === 'BLACK' ? 1 : 0);
      persistStats({ totalGames: stats.totalGames + 1, winsWhite, winsBlack, games: [...stats.games, summary] });
      setPendingSummary(summary);
    }
  }, [history.length, maxMoves, pendingSummary, stats]);

	// Stable lookup by board key for 3D clicks
	const squaresByKey = new Map(squares.map((s) => [s.position.toKey(), s]));

	const handlePickSquare = (row: number, column: number, originKey?: string) => {
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
						<h1 className="text-3xl font-semibold">{t('app.title')}</h1>
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
							onSquareClick={onSquareClick}
						/>
                    <p className="text-sm text-slate-500">{t('board.subtitle')}</p>
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
						<div className="space-y-4">
                        <InfoPanel
                            currentTurn={currentTurn}
                            instruction={instruction}
                            message={message}
                            movesCount={history.length}
                            maxMoves={maxMoves}
                            onChangeMaxMoves={(v) => setMaxMoves(v)}
                            onNewGame={handleNewGame}
                            onExportGame={handleExportGame}
                            onImportGame={handleImportClick}
                            onPlayBot={handleToggleBot}
                        />
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
