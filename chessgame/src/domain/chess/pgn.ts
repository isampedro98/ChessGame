import type { Board } from './core/Board';
import type { Move, MoveResolution } from './core/Move';
import type { Piece } from './core/Piece';
import { PieceType } from './core/Piece';
import { Position } from './core/Position';
import { Team } from './core/Team';
import type { Game } from './Game';
import { createStandardGame } from './factories/createStandardGame';
import { CastleMove } from './moves/CastleMove';
import { EnPassantMove } from './moves/EnPassantMove';
import { PromotionMove } from './moves/PromotionMove';
import { SimpleMove } from './moves/SimpleMove';

const PIECE_SAN: Record<PieceType, string> = {
  [PieceType.King]: 'K',
  [PieceType.Queen]: 'Q',
  [PieceType.Rook]: 'R',
  [PieceType.Bishop]: 'B',
  [PieceType.Knight]: 'N',
  [PieceType.Pawn]: '',
};

/**
 * Converts a single move to SAN (Standard Algebraic Notation).
 * board = position before the move; isCheck/isCheckmate = after the move.
 * promotionPiece = piece type promoted to (for promotion moves).
 */
export function moveToSAN(
  board: Board,
  move: Move,
  piece: Piece,
  isCheck: boolean,
  isCheckmate: boolean,
  promotionPiece?: PieceType,
): string {
  const to = move.to.toAlgebraic();
  const capture = board.getPiece(move.to) != null;

  if (move instanceof CastleMove) {
    const san = move.to.column > move.from.column ? 'O-O' : 'O-O-O';
    return san + (isCheckmate ? '#' : isCheck ? '+' : '');
  }

  if (piece.type === PieceType.Pawn) {
    const fromFile = move.from.toAlgebraic()[0];
    const base = capture ? `${fromFile}x${to}` : to;
    if (move instanceof PromotionMove || promotionPiece) {
      const p = promotionPiece ?? PieceType.Queen;
      const promo = PIECE_SAN[p] ?? 'Q';
      return base + '=' + promo + (isCheckmate ? '#' : isCheck ? '+' : '');
    }
    if (move instanceof EnPassantMove) {
      return `${fromFile}x${to} e.p.` + (isCheckmate ? '#' : isCheck ? '+' : '');
    }
    return base + (isCheckmate ? '#' : isCheck ? '+' : '');
  }

  const letter = PIECE_SAN[piece.type];
  const samePieces = board.getPiecesByTeam(piece.team).filter((p) => p.type === piece.type && p.id !== piece.id);
  let disambiguator = '';
  for (const other of samePieces) {
    const moves = other.generateMoves(board);
    if (moves.some((m) => m.to.equals(move.to))) {
      if (other.getPosition().column !== piece.getPosition().column && other.getPosition().row !== piece.getPosition().row) {
        disambiguator = move.from.toAlgebraic();
        break;
      }
      if (other.getPosition().column !== piece.getPosition().column) {
        disambiguator = move.from.toAlgebraic()[0];
        break;
      }
      disambiguator = move.from.toAlgebraic()[1];
      break;
    }
  }
  const captureStr = capture ? 'x' : '';
  return letter + disambiguator + captureStr + to + (isCheckmate ? '#' : isCheck ? '+' : '');
}

/** Result string for PGN headers. */
export function resultToPGN(result: Team | 'DRAW' | null): string {
  if (result === Team.White) return '1-0';
  if (result === Team.Black) return '0-1';
  return '1/2-1/2';
}

/** Builds a Move executable on the given board from a move record (same from/to/type, board’s piece IDs). */
export function buildMoveForBoard(
  board: Board,
  record: { move: Move; resolution: MoveResolution },
): Move | null {
  const { move, resolution } = record;
  const piece = board.getPiece(move.from);
  if (!piece) return null;
  const from = move.from;
  const to = move.to;
  if (move instanceof CastleMove) {
    const kingside = to.column > from.column;
    const row = from.row;
    const rookFrom = Position.fromCoordinates(row, kingside ? 7 : 0);
    const rookTo = Position.fromCoordinates(row, kingside ? 5 : 3);
    const rook = board.getPiece(rookFrom);
    if (!rook) return null;
    return new CastleMove(piece.id, from, to, rook.id, rookFrom, rookTo);
  }
  if (move instanceof EnPassantMove) {
    const capturedPos = Position.fromCoordinates(from.row, to.column);
    return new EnPassantMove(piece.id, from, to, capturedPos);
  }
  if (move instanceof PromotionMove || resolution.promotedPiece) {
    const promoteTo = resolution.promotedPiece?.type ?? PieceType.Queen;
    return new PromotionMove(piece.id, from, to, promoteTo);
  }
  return new SimpleMove(piece.id, from, to);
}

/**
 * Builds PGN text for a finished or in-progress game.
 * Replays history on a fresh game to resolve SAN (with correct piece IDs).
 */
export function gameToPGN(game: Game): string {
  const headers: string[] = [
    '[Event "?"]',
    '[Site "?"]',
    `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}"]`,
    '[Round "?"]',
    '[White "?"]',
    '[Black "?"]',
    `[Result "${resultToPGN(game.getResult())}"]`,
  ];
  const history = game.moveHistory();
  if (history.length === 0) {
    return headers.join('\n') + '\n\n';
  }
  const temp = createStandardGame() as Game;
  const moves: string[] = [];
  let fullMoveNumber = 1;
  let whiteTurn = true;
  for (const record of history) {
    const boardBefore = temp.getBoard();
    const move = buildMoveForBoard(boardBefore, record);
    if (!move) break;
    const piece = boardBefore.getPiece(move.from)!;
    const resolution = record.resolution;
    const promotionPiece = resolution.promotedPiece?.type;
    temp.executeMove(move);
    const isCheck = temp.isKingInCheck(temp.getTurn());
    const result = temp.getResult();
    const isCheckmate = result === Team.White || result === Team.Black;
    const san = moveToSAN(boardBefore, move, piece, isCheck, isCheckmate, promotionPiece);
    if (whiteTurn) {
      moves.push(`${fullMoveNumber}. ${san}`);
    } else {
      moves[moves.length - 1] += ` ${san}`;
      fullMoveNumber += 1;
    }
    whiteTurn = !whiteTurn;
  }
  const moveText = moves.join(' ');
  return headers.join('\n') + '\n\n' + moveText + '\n';
}
