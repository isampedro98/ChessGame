import { Position } from './core/Position';
import { Team } from './core/Team';
import { PieceType } from './core/Piece';
import type { Piece } from './core/Piece';
import { Game, type GameFromFENOptions } from './Game';
import { Bishop, King, Knight, Pawn, Queen, Rook } from './pieces';

const FEN_PIECE: Record<string, { type: PieceType; team: Team }> = {
  P: { type: PieceType.Pawn, team: Team.White },
  N: { type: PieceType.Knight, team: Team.White },
  B: { type: PieceType.Bishop, team: Team.White },
  R: { type: PieceType.Rook, team: Team.White },
  Q: { type: PieceType.Queen, team: Team.White },
  K: { type: PieceType.King, team: Team.White },
  p: { type: PieceType.Pawn, team: Team.Black },
  n: { type: PieceType.Knight, team: Team.Black },
  b: { type: PieceType.Bishop, team: Team.Black },
  r: { type: PieceType.Rook, team: Team.Black },
  q: { type: PieceType.Queen, team: Team.Black },
  k: { type: PieceType.King, team: Team.Black },
};

let fenIdCounter = 0;

function nextFenId(team: Team, type: PieceType): string {
  fenIdCounter += 1;
  const prefix = type === PieceType.King ? 'king' : type === PieceType.Queen ? 'queen' : type === PieceType.Rook ? 'rook' : type === PieceType.Bishop ? 'bishop' : type === PieceType.Knight ? 'knight' : 'pawn';
  return `${team.toLowerCase()}-${prefix}-${fenIdCounter}`;
}

/**
 * Parses FEN and returns a Game, or throws with a message if invalid.
 * FEN format: "piecePlacement activeColor castlingRights enPassantTarget halfmoveClock fullMoveNumber"
 */
export function createGameFromFEN(fen: string): Game {
  fenIdCounter = 0;
  const trimmed = fen.trim();
  if (!trimmed) {
    throw new Error('Invalid FEN: empty string');
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length < 6) {
    throw new Error('Invalid FEN: expected 6 fields (placement active castling ep halfMove fullMove)');
  }
  const [placement, activeColor, castlingRights, , halfMoveStr] = parts;

  const ranks = placement.split('/');
  if (ranks.length !== 8) {
    throw new Error('Invalid FEN: piece placement must have 8 ranks');
  }

  const pieces: Piece[] = [];
  for (let rankIndex = 0; rankIndex < 8; rankIndex += 1) {
    const row = 7 - rankIndex;
    let col = 0;
    const rank = ranks[rankIndex];
    for (let i = 0; i < rank.length; i += 1) {
      if (col > 7) {
        throw new Error('Invalid FEN: too many squares in rank');
      }
      const c = rank[i];
      if (c >= '1' && c <= '8') {
        col += Number.parseInt(c, 10);
        continue;
      }
      const info = FEN_PIECE[c];
      if (!info) {
        throw new Error(`Invalid FEN: unknown piece character "${c}"`);
      }
      const pos = Position.fromCoordinates(row, col);
      const id = nextFenId(info.team, info.type);
      switch (info.type) {
        case PieceType.Pawn:
          pieces.push(new Pawn(id, info.team, pos));
          break;
        case PieceType.Knight:
          pieces.push(new Knight(id, info.team, pos));
          break;
        case PieceType.Bishop:
          pieces.push(new Bishop(id, info.team, pos));
          break;
        case PieceType.Rook:
          pieces.push(new Rook(id, info.team, pos));
          break;
        case PieceType.Queen:
          pieces.push(new Queen(id, info.team, pos));
          break;
        case PieceType.King:
          pieces.push(new King(id, info.team, pos));
          break;
      }
      col += 1;
    }
    if (col !== 8) {
      throw new Error('Invalid FEN: rank must have 8 squares');
    }
  }

  const turn = activeColor === 'b' ? Team.Black : activeColor === 'w' ? Team.White : null;
  if (turn === null) {
    throw new Error('Invalid FEN: active color must be "w" or "b"');
  }

  const halfMove = Number.parseInt(halfMoveStr, 10);
  if (!Number.isInteger(halfMove) || halfMove < 0) {
    throw new Error('Invalid FEN: halfmove clock must be a non-negative integer');
  }

  const options: GameFromFENOptions = {
    turn,
    halfMoveClock: halfMove,
    castlingRights: castlingRights === '-' ? '-' : castlingRights,
  };

  return new Game(pieces, options);
}
