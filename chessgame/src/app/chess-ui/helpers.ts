import { Team, type Piece, PieceType, type Move, type MoveResolution } from '@/domain/chess';

export const PIECE_SYMBOLS: Record<PieceType, string> = {
  [PieceType.King]: 'K',
  [PieceType.Queen]: 'Q',
  [PieceType.Rook]: 'R',
  [PieceType.Bishop]: 'B',
  [PieceType.Knight]: 'N',
  [PieceType.Pawn]: 'P',
};

export const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const getPieceSymbol = (piece: Piece): string => {
  const base = PIECE_SYMBOLS[piece.type];
  return piece.belongsTo(Team.White) ? base : base.toLowerCase();
};

export const pieceCssClass = (piece: Piece): string =>
  piece.belongsTo(Team.White)
    ? 'bg-white/10 text-slate-50 ring-1 ring-white/40'
    : 'bg-slate-200 text-slate-900';

export type MoveNote = {
  key: string;
  params?: Record<string, string>;
};

export type MoveDetails = {
  title: string;
  notes: MoveNote[];
};

export const describeMove = (
  index: number,
  move: Move,
  piece: Piece | undefined,
  resolution: MoveResolution,
): MoveDetails => {
  const pieceLabel = piece ? getPieceSymbol(piece) : '';
  const title = `${index + 1}. ${pieceLabel ? `${pieceLabel} ` : ''}${move.description()}`;

  const notes: MoveNote[] = [];
  if (resolution.capturedPiece) {
    notes.push({
      key: 'history.note.capture',
      params: {
        piece: getPieceSymbol(resolution.capturedPiece),
        square: move.to.toAlgebraic(),
      },
    });
  }
  if (resolution.isPromotion && resolution.promotedPiece) {
    notes.push({
      key: 'history.note.promote',
      params: {
        piece: getPieceSymbol(resolution.promotedPiece),
      },
    });
  }

  return { title, notes };
};
