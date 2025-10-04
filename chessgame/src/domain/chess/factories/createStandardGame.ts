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

const initialPositions = (team: Team): Record<string, string> => {
  if (team === Team.White) {
    return {
      leftRook: 'a1',
      leftKnight: 'b1',
      leftBishop: 'c1',
      queen: 'd1',
      king: 'e1',
      rightBishop: 'f1',
      rightKnight: 'g1',
      rightRook: 'h1',
      pawnRank: '2',
    };
  }
  return {
    leftRook: 'a8',
    leftKnight: 'b8',
    leftBishop: 'c8',
    queen: 'd8',
    king: 'e8',
    rightBishop: 'f8',
    rightKnight: 'g8',
    rightRook: 'h8',
    pawnRank: '7',
  };
};

const createPiecesForTeam = (team: Team): Piece[] => {
  const positions = initialPositions(team);
  const pieces: Piece[] = [];

  pieces.push(new Rook(createPieceId(team, 'rook'), team, Position.fromAlgebraic(positions.leftRook)));
  pieces.push(new Knight(createPieceId(team, 'knight'), team, Position.fromAlgebraic(positions.leftKnight)));
  pieces.push(new Bishop(createPieceId(team, 'bishop'), team, Position.fromAlgebraic(positions.leftBishop)));
  pieces.push(new Queen(createPieceId(team, 'queen'), team, Position.fromAlgebraic(positions.queen)));
  pieces.push(new King(createPieceId(team, 'king'), team, Position.fromAlgebraic(positions.king)));
  pieces.push(new Bishop(createPieceId(team, 'bishop'), team, Position.fromAlgebraic(positions.rightBishop)));
  pieces.push(new Knight(createPieceId(team, 'knight'), team, Position.fromAlgebraic(positions.rightKnight)));
  pieces.push(new Rook(createPieceId(team, 'rook'), team, Position.fromAlgebraic(positions.rightRook)));

  const baseColumn = 'a'.charCodeAt(0);
  const pawnRank = positions.pawnRank;
  for (let i = 0; i < 8; i += 1) {
    const column = String.fromCharCode(baseColumn + i);
    const algebraic = column + pawnRank;
    pieces.push(new Pawn(createPieceId(team, 'pawn'), team, Position.fromAlgebraic(algebraic)));
  }

  return pieces;
};

export const createStandardGame = (): Game => {
  idCounter = 0;
  const whitePieces = createPiecesForTeam(Team.White);
  const blackPieces = createPiecesForTeam(Team.Black);
  return new Game([...whitePieces, ...blackPieces]);
};
