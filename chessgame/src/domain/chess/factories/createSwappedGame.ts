import { Team } from '../core/Team';
import type { Piece } from '../core/Piece';
import { Position } from '../core/Position';
import { Game } from '../Game';
import { Bishop, Knight, Pawn, Queen, King, Rook } from '../pieces';

let idCounter = 0;

const createPieceId = (team: Team, prefix: string): string => {
  idCounter += 1;
  return `${team.toLowerCase()}-${prefix}-${idCounter}`;
};

const sidePositions = (side: 'whiteSide' | 'blackSide') => {
  if (side === 'whiteSide') {
    return {
      leftRook: 'a1', leftKnight: 'b1', leftBishop: 'c1', queen: 'd1', king: 'e1', rightBishop: 'f1', rightKnight: 'g1', rightRook: 'h1', pawnRank: '2',
    } as const;
  }
  return {
    leftRook: 'a8', leftKnight: 'b8', leftBishop: 'c8', queen: 'd8', king: 'e8', rightBishop: 'f8', rightKnight: 'g8', rightRook: 'h8', pawnRank: '7',
  } as const;
};

const createPiecesOnSide = (team: Team, side: 'whiteSide' | 'blackSide'): Piece[] => {
  const p = sidePositions(side);
  const pieces: Piece[] = [];
  pieces.push(new Rook(createPieceId(team, 'rook'), team, Position.fromAlgebraic(p.leftRook)));
  pieces.push(new Knight(createPieceId(team, 'knight'), team, Position.fromAlgebraic(p.leftKnight)));
  pieces.push(new Bishop(createPieceId(team, 'bishop'), team, Position.fromAlgebraic(p.leftBishop)));
  pieces.push(new Queen(createPieceId(team, 'queen'), team, Position.fromAlgebraic(p.queen)));
  pieces.push(new King(createPieceId(team, 'king'), team, Position.fromAlgebraic(p.king)));
  pieces.push(new Bishop(createPieceId(team, 'bishop'), team, Position.fromAlgebraic(p.rightBishop)));
  pieces.push(new Knight(createPieceId(team, 'knight'), team, Position.fromAlgebraic(p.rightKnight)));
  pieces.push(new Rook(createPieceId(team, 'rook'), team, Position.fromAlgebraic(p.rightRook)));

  const baseColumn = 'a'.charCodeAt(0);
  for (let i = 0; i < 8; i += 1) {
    const column = String.fromCharCode(baseColumn + i);
    const algebraic = column + p.pawnRank;
    pieces.push(new Pawn(createPieceId(team, 'pawn'), team, Position.fromAlgebraic(algebraic)));
  }
  return pieces;
};

export const createSwappedGame = (): Game => {
  idCounter = 0;
  const whitePieces = createPiecesOnSide(Team.White, 'blackSide');
  const blackPieces = createPiecesOnSide(Team.Black, 'whiteSide');
  return new Game([...whitePieces, ...blackPieces]);
};

