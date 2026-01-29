import { describe, expect, test } from 'vitest';

import { Game } from '@/domain/chess/Game';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { King, Pawn, Rook } from '@/domain/chess/pieces';
import { createStandardGame } from '@/domain/chess';

const perft = (game: Game, depth: number): number => {
  if (depth === 0) return 1;
  let nodes = 0;
  const team = game.getTurn();
  const pieces = game.getBoard().getPiecesByTeam(team);
  for (const piece of pieces) {
    const moves = game.generateMovesFor(piece.id);
    for (const move of moves) {
      game.executeMove(move);
      nodes += perft(game, depth - 1);
      game.undoLastMove();
    }
  }
  return nodes;
};

describe('perft', () => {
  test('starting position (depth 1-2)', () => {
    const game = createStandardGame();
    expect(perft(game, 1)).toBe(20);
    expect(perft(game, 2)).toBe(400);
  });

  test('castling availability', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteRookA = new Rook('white-rook-a', Team.White, Position.fromAlgebraic('a1'));
    const whiteRookH = new Rook('white-rook-h', Team.White, Position.fromAlgebraic('h1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteRookA, whiteRookH, blackKing]);

    expect(perft(game, 1)).toBe(26);
  });

  test('en passant availability', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const whitePawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('e5'));
    const blackPawn = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('d7'));
    const game = new Game([whiteKing, blackKing, whitePawn, blackPawn]);

    game.executeMove(whiteKing.generateMoves(game.getBoard()).find((m) => m.to.equals(Position.fromAlgebraic('e2')))!);
    game.executeMove(blackPawn.generateMoves(game.getBoard()).find((m) => m.to.equals(Position.fromAlgebraic('d5')))!);

    expect(perft(game, 1)).toBe(10);
  });
});
