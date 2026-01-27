import { describe, expect, test } from 'vitest';

import { Board } from '@/domain/chess/core/Board';
import { Position } from '@/domain/chess/core/Position';
import { Team } from '@/domain/chess/core/Team';
import { King, Pawn } from '@/domain/chess/pieces';

const squares = (moves: Array<{ to: Position }>) =>
  moves.map((move) => move.to.toAlgebraic()).sort();

describe('king moves', () => {
  test('moves one square and cannot land on allied pieces', () => {
    const king = new King('white-king', Team.White, Position.fromAlgebraic('e4'));
    const ally1 = new Pawn('white-pawn-1', Team.White, Position.fromAlgebraic('e5'));
    const ally2 = new Pawn('white-pawn-2', Team.White, Position.fromAlgebraic('f5'));
    const enemy = new Pawn('black-pawn', Team.Black, Position.fromAlgebraic('d5'));
    const board = new Board([king, ally1, ally2, enemy]);

    const moves = king.generateMoves(board);
    expect(squares(moves)).toEqual(['d3', 'd4', 'd5', 'e3', 'f3', 'f4'].sort());
  });
});
