'use client';

import type { SquareInfo } from '@/app/hooks/useChessUI';
import { FILES, RANKS, pieceCssClass } from '@/app/chess-ui/helpers';
import { useTranslation } from '@/app/i18n/TranslationProvider';
import { Team } from '@/domain/chess';

interface BoardGridProps {
  squares: SquareInfo[];
  availableDestinations: Set<string>;
  selectedSquareKey: string | null;
  currentTurn: Team;
}

export const BoardGrid = ({
  squares,
  availableDestinations,
  selectedSquareKey,
  currentTurn,
}: BoardGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative ml-6 inline-block pb-8">
      <div className="grid w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-xl border border-slate-800 shadow-inner">
        {squares.map((square) => {
          const key = square.position.toKey();
          const isSelected = selectedSquareKey === key;
          const isTarget = availableDestinations.has(key);
          const hasEnemyPiece =
            isTarget && square.piece && !square.piece.belongsTo(currentTurn);

          const base = square.isDark ? 'bg-slate-800' : 'bg-slate-700/40';
          const highlight = isSelected
            ? 'ring-2 ring-emerald-400/70 ring-inset'
            : isTarget
            ? hasEnemyPiece
              ? 'bg-rose-500/40'
              : 'bg-emerald-400/25'
            : '';

          return (
            <div
              key={square.id}
              className={`relative aspect-square flex items-center justify-center text-lg font-semibold ${base} ${highlight}`}
              aria-label={t('board.squareAria', { id: square.id })}
            >
              {square.piece ? (
                <span
                  className={`inline-flex h-4 w-4 rounded-full shadow-inner ${pieceCssClass(
                    square.piece,
                  )}`}
                />
              ) : isTarget ? (
                <span className={`h-3 w-3 rounded-full ${hasEnemyPiece ? 'bg-rose-300/80' : 'bg-emerald-200/70'}`} />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute -left-6 top-0 grid h-full grid-rows-8 place-items-center text-xs font-semibold text-slate-500">
        {RANKS.map((rank) => (
          <span key={rank}>{rank}</span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 grid w-full grid-cols-8 place-items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {FILES.map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>
    </div>
  );
};
