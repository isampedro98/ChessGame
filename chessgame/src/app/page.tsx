'use client';

import { JSX, useRef, useState } from 'react';

import { BoardGrid } from '@/app/components/BoardGrid';
import { HistoryPanel } from '@/app/components/HistoryPanel';
import { InfoPanel } from '@/app/components/InfoPanel';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { SquareInfo, useChessUI } from '@/app/hooks/useChessUI';
import { useTranslation } from '@/app/i18n/TranslationProvider';
import ChessScene from '@/app/components/ChessScene';
import { createStandardGame } from '@/domain/chess';
import { Position } from '@/domain/chess';

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

	// Simple stats in localStorage
	const STATS_KEY = 'chess.stats';
	const [gamesPlayed, setGamesPlayed] = useState<number>(() => {
		if (typeof window === 'undefined') return 0;
		try {
			const raw = window.localStorage.getItem(STATS_KEY);
			return raw ? JSON.parse(raw).gamesPlayed ?? 0 : 0;
		} catch {
			return 0;
		}
	});
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const persistStats = (value: number) => {
		setGamesPlayed(value);
		try { window.localStorage.setItem(STATS_KEY, JSON.stringify({ gamesPlayed: value })); } catch {}
	};

	const handleNewGame = () => {
		setGame(createStandardGame());
		persistStats(gamesPlayed + 1);
	};

	const handleExportStats = () => {
		const data = { gamesPlayed };
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'chess-stats.json'; a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportGame = () => {
		const records = game.moveHistory().map(({ move }) => ({
			pieceId: move.pieceId,
			from: { row: move.from.row, column: move.from.column },
			to: { row: move.to.row, column: move.to.column },
		}));
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
			if (json && typeof json.gamesPlayed === 'number') {
				persistStats(json.gamesPlayed);
			}
			if (Array.isArray(json.moves)) {
				const fresh = createStandardGame();
				const { Position } = await import('@/domain/chess');
				const { SimpleMove } = await import('@/domain/chess/moves/SimpleMove');
				for (const m of json.moves) {
					const from = Position.fromCoordinates(m.from.row, m.from.column);
					const to = Position.fromCoordinates(m.to.row, m.to.column);
					const move = new SimpleMove(m.pieceId, from, to);
					try { fresh.executeMove(move); } catch {}
				}
				setGame(fresh);
			}
		} catch {}
		ev.target.value = '';
	};

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
					<div className="mt-2 flex flex-wrap gap-2">
						<button onClick={handleNewGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">{t('menu.newGame') || 'New Game'}</button>
						<button onClick={() => alert('Bot mode coming soon')} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">{t('menu.playBot') || 'Play vs Bot'}</button>
						<button onClick={handleExportGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">{t('menu.exportGame') || 'Export Game'}</button>
						<button onClick={handleExportStats} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">{t('menu.exportStats') || 'Export Stats'}</button>
						<button onClick={handleImportClick} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">{t('menu.import') || 'Import'}</button>
						<input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
					</div>
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















