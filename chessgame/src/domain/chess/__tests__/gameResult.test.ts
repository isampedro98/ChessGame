import { describe, expect, test } from 'vitest';

import { Game } from '@/domain/chess/Game';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { Bishop, King, Knight, Pawn, Queen } from '@/domain/chess/pieces';
import { SimpleMove } from '@/domain/chess/moves/SimpleMove';
import { createStandardGame } from '@/domain/chess/factories/createStandardGame';

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

  test('threefold repetition: same position three times is draw', () => {
    const game = createStandardGame();
    const play = (from: string, to: string) => {
      const piece = game.getBoard().getPiece(Position.fromAlgebraic(from));
      if (!piece) throw new Error(`No piece at ${from}`);
      game.executeMove(new SimpleMove(piece.id, Position.fromAlgebraic(from), Position.fromAlgebraic(to)));
    };
    play('g1', 'f3'); // 1.Nf3
    play('g8', 'f6'); // 1...Nf6
    play('f3', 'g1'); // 2.Ng1
    play('f6', 'g8'); // 2...Ng8
    play('g1', 'f3'); // 3.Nf3
    play('g8', 'f6'); // 3...Nf6
    play('f3', 'g1'); // 4.Ng1
    play('f6', 'g8'); // 4...Ng8
    play('g1', 'f3'); // 5.Nf3 - position (black to move) now occurred 3rd time
    expect(game.getResult()).toBe('DRAW');
  });

  test('50-move rule: 50 half-moves without capture or pawn move is draw', () => {
    const wk = new King('wk', Team.White, Position.fromAlgebraic('e1'));
    const wn = new Knight('wn', Team.White, Position.fromAlgebraic('c3'));
    const bk = new King('bk', Team.Black, Position.fromAlgebraic('e8'));
    const bn = new Knight('bn', Team.Black, Position.fromAlgebraic('c6'));
    const game = new Game([wk, wn, bk, bn]);
    const cycle = [
      ['c3', 'd5'],
      ['c6', 'e5'],
      ['d5', 'c3'],
      ['e5', 'c6'],
    ];
    for (let i = 0; i < 50; i += 1) {
      const [from, to] = cycle[i % 4];
      const piece = game.getBoard().getPiece(Position.fromAlgebraic(from));
      if (!piece) throw new Error(`No piece at ${from}`);
      game.executeMove(new SimpleMove(piece.id, Position.fromAlgebraic(from), Position.fromAlgebraic(to)));
    }
    expect(game.getResult()).toBe('DRAW');
  });
});
