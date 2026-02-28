import { describe, expect, test } from 'vitest';

import { Game } from '@/domain/chess/Game';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Bishop, King, Knight, Pawn, Queen } from '@/domain/chess/pieces';
import { SimpleMove } from '@/domain/chess/moves/SimpleMove';

describe('game result (draws)', () => {
  test('insufficient material: kings only', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, blackKing]);

    expect(game.getResult()).toBe('DRAW');
  });

  test('insufficient material: king and bishop vs king', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteBishop = new Bishop('white-bishop', Team.White, Position.fromAlgebraic('c1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteBishop, blackKing]);

    expect(game.getResult()).toBe('DRAW');
  });

  test('sufficient material: bishop + knight vs king', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteBishop = new Bishop('white-bishop', Team.White, Position.fromAlgebraic('c1'));
    const whiteKnight = new Knight('white-knight', Team.White, Position.fromAlgebraic('g1'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('e8'));
    const game = new Game([whiteKing, whiteBishop, whiteKnight, blackKing]);

    expect(game.getResult()).toBeNull();
  });

  test('stalemate: no legal moves and not in check', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('f7'));
    const whiteQueen = new Queen('white-queen', Team.White, Position.fromAlgebraic('g6'));
    const whitePawn = new Pawn('white-pawn', Team.White, Position.fromAlgebraic('a2'));
    const blackKing = new King('black-king', Team.Black, Position.fromAlgebraic('h8'));
    const game = new Game([whiteKing, whiteQueen, whitePawn, blackKing]);

    game.executeMove(new SimpleMove(whitePawn.id, Position.fromAlgebraic('a2'), Position.fromAlgebraic('a3')));

    expect(game.getResult()).toBe('DRAW');
  });

  test('missing king does not award a winner (fallback removed)', () => {
    const whiteKing = new King('white-king', Team.White, Position.fromAlgebraic('e1'));
    const whiteQueen = new Queen('white-queen', Team.White, Position.fromAlgebraic('d1'));
    const game = new Game([whiteKing, whiteQueen]);

    expect(game.getResult()).toBe('DRAW');
  });
});
